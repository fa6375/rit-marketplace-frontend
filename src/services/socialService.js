import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit as qLimit,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { notify } from "./notificationsService";

/* ------------------------------------------------------------------ */
/* Follows                                                             */
/* Deterministic doc id `${followerId}_${sellerId}` makes duplicate    */
/* follows structurally impossible.                                    */
/* ------------------------------------------------------------------ */

export const followId = (followerId, sellerId) => `${followerId}_${sellerId}`;

export async function followSeller(follower, seller) {
  if (!follower?.uid || !seller?.id || follower.uid === seller.id) {
    throw Object.assign(new Error("invalid"), { code: "failed-precondition" });
  }
  const ref = doc(db, "follows", followId(follower.uid, seller.id));
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists()) return; // already following — no double counting
    tx.set(ref, {
      followerId: follower.uid,
      followerName: follower.displayName || follower.email || "Student",
      sellerId: seller.id,
      sellerName: seller.displayName || "",
      createdAt: serverTimestamp(),
    });
    tx.update(doc(db, "users", seller.id), { followersCount: increment(1) });
  });
  notify(seller.id, {
    type: "follower",
    title: "New follower",
    body: `${follower.displayName || "A student"} started following you.`,
    link: `/seller/${follower.uid}`,
  });
}

export async function unfollowSeller(followerUid, sellerId) {
  const ref = doc(db, "follows", followId(followerUid, sellerId));
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return; // already unfollowed — idempotent
    tx.delete(ref);
    tx.update(doc(db, "users", sellerId), { followersCount: increment(-1) });
  });
}

/** All follower uids of a seller (used to fan out "new listing" alerts). */
export async function getFollowerIds(sellerId, cap = 1000) {
  const snap = await getDocs(
    query(collection(db, "follows"), where("sellerId", "==", sellerId), qLimit(cap))
  );
  return snap.docs.map((d) => d.data().followerId).filter(Boolean);
}

/* ------------------------------------------------------------------ */
/* Saves & wishlist collections                                        */
/* One save doc per (user, listing): `${uid}_${listingId}`. A save     */
/* belongs to exactly one collection, so "move" is a single update.    */
/* ------------------------------------------------------------------ */

export const DEFAULT_COLLECTION = { id: "wishlist", name: "Wishlist" };
export const saveId = (uid, listingId) => `${uid}_${listingId}`;

export async function saveListing(user, listing, collectionId = DEFAULT_COLLECTION.id) {
  const ref = doc(db, "saves", saveId(user.uid, listing.id));
  let created = false;
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists()) {
      // Already saved — treat as a move between collections.
      tx.update(ref, { collectionId, updatedAt: serverTimestamp() });
      return;
    }
    created = true;
    tx.set(ref, {
      uid: user.uid,
      listingId: listing.id,
      listingTitle: listing.title || "",
      sellerId: listing.ownerId || "",
      collectionId,
      createdAt: serverTimestamp(),
    });
    tx.update(doc(db, "listings", listing.id), { savesCount: increment(1) });
  });
  if (created && listing.ownerId && listing.ownerId !== user.uid) {
    notify(listing.ownerId, {
      type: "like",
      title: "Someone saved your listing",
      body: `"${listing.title}" was added to a wishlist.`,
      link: `/listing/${listing.id}`,
    });
  }
}

export async function unsaveListing(uid, listingId) {
  const ref = doc(db, "saves", saveId(uid, listingId));
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    tx.delete(ref);
    // The listing may have been deleted since — only decrement if it exists.
    const listingRef = doc(db, "listings", listingId);
    const listingSnap = await tx.get(listingRef);
    if (listingSnap.exists()) {
      tx.update(listingRef, { savesCount: increment(-1) });
    }
  });
}

export async function moveSave(uid, listingId, collectionId) {
  await updateDoc(doc(db, "saves", saveId(uid, listingId)), {
    collectionId,
    updatedAt: serverTimestamp(),
  });
}

export async function createWishlistCollection(uid, name) {
  const trimmed = (name || "").trim();
  if (!trimmed) {
    throw Object.assign(new Error("empty"), { code: "failed-precondition" });
  }
  const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
  const id = `${uid}_${slug}`;
  const ref = doc(db, "wishlistCollections", id);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    throw Object.assign(new Error("exists"), { code: "already-exists" });
  }
  await setDoc(ref, {
    ownerId: uid,
    name: trimmed,
    slug,
    createdAt: serverTimestamp(),
  });
  return { id, name: trimmed };
}

export async function deleteWishlistCollection(uid, collectionDocId) {
  // Moves any saves in the deleted collection back to the default wishlist,
  // then removes the collection itself — nothing is lost.
  const snap = await getDocs(
    query(collection(db, "saves"), where("uid", "==", uid), where("collectionId", "==", collectionDocId))
  );
  const batch = writeBatch(db);
  snap.docs.forEach((d) =>
    batch.update(d.ref, { collectionId: DEFAULT_COLLECTION.id, updatedAt: serverTimestamp() })
  );
  batch.delete(doc(db, "wishlistCollections", collectionDocId));
  await batch.commit();
}

/* ------------------------------------------------------------------ */
/* Unique view counting                                                */
/* One view doc per (listing, viewer): `${listingId}_${uid}` — a       */
/* refresh can never inflate the counter, and owners never count.      */
/* ------------------------------------------------------------------ */

const recordedViews = new Set(); // per-session guard to skip redundant reads

export async function recordListingView(listing, viewerUid) {
  if (!listing?.id || !viewerUid || listing.ownerId === viewerUid) return;
  const key = `${listing.id}_${viewerUid}`;
  if (recordedViews.has(key)) return;
  recordedViews.add(key);
  try {
    await runTransaction(db, async (tx) => {
      const ref = doc(db, "views", key);
      const snap = await tx.get(ref);
      if (snap.exists()) return; // unique views only
      tx.set(ref, {
        listingId: listing.id,
        uid: viewerUid,
        ownerId: listing.ownerId || "",
        createdAt: serverTimestamp(),
      });
      tx.update(doc(db, "listings", listing.id), { views: increment(1) });
    });
  } catch (e) {
    recordedViews.delete(key); // allow a retry on a later visit
    console.error("recordListingView failed", e);
  }
}

export async function recordProfileView(sellerId, viewerUid) {
  if (!sellerId || !viewerUid || sellerId === viewerUid) return;
  const key = `p_${sellerId}_${viewerUid}`;
  if (recordedViews.has(key)) return;
  recordedViews.add(key);
  try {
    await runTransaction(db, async (tx) => {
      const ref = doc(db, "profileViews", `${sellerId}_${viewerUid}`);
      const snap = await tx.get(ref);
      if (snap.exists()) return;
      tx.set(ref, { sellerId, uid: viewerUid, createdAt: serverTimestamp() });
      tx.update(doc(db, "users", sellerId), { profileViews: increment(1) });
    });
  } catch (e) {
    recordedViews.delete(key);
    console.error("recordProfileView failed", e);
  }
}
