import {
  doc,
  increment,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { notify } from "./notificationsService";

/**
 * Offers use a deterministic id `${listingId}_${buyerId}` — one active
 * negotiation per buyer per listing. Every state change is appended to the
 * document's `history` array, so the complete negotiation is preserved and
 * spam offers are structurally impossible.
 *
 * Statuses: pending | countered | accepted | rejected | expired | withdrawn
 */

export const offerId = (listingId, buyerId) => `${listingId}_${buyerId}`;

const HISTORY_CAP = 30;
const MIN_RESUBMIT_MS = 60 * 1000; // 1 minute between offers on the same listing

const pushHistory = (history = [], entry) =>
  [...history, { ...entry, at: Timestamp.now() }].slice(-HISTORY_CAP);

export async function makeOffer(user, listing, amount, message = "") {
  if (!user?.uid || !listing?.id) {
    throw Object.assign(new Error(), { code: "failed-precondition" });
  }
  if (listing.ownerId === user.uid) {
    throw Object.assign(new Error("You can't make an offer on your own listing."), {
      code: "own-listing",
    });
  }
  if (listing.sold) {
    throw Object.assign(new Error("This listing has already been sold."), {
      code: "sold",
    });
  }
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    throw Object.assign(new Error("Enter a valid offer amount."), { code: "invalid-amount" });
  }
  const ref = doc(db, "offers", offerId(listing.id, user.uid));
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists()) {
      const data = snap.data();
      if (data.status === "pending" || data.status === "countered") {
        throw Object.assign(
          new Error("You already have an open offer on this listing. Wait for the seller to respond."),
          { code: "duplicate-offer" }
        );
      }
      if (data.status === "accepted") {
        throw Object.assign(new Error("Your offer was already accepted."), {
          code: "duplicate-offer",
        });
      }
      const last = data.lastOfferAt?.toMillis?.() || 0;
      if (Date.now() - last < MIN_RESUBMIT_MS) {
        throw Object.assign(
          new Error("Please wait a moment before sending another offer."),
          { code: "resource-exhausted" }
        );
      }
      tx.update(ref, {
        amount: value,
        message: (message || "").trim().slice(0, 300),
        status: "pending",
        counterAmount: null,
        lastOfferAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        history: pushHistory(data.history, { by: "buyer", action: "offered", amount: value }),
      });
      return;
    }
    tx.set(ref, {
      listingId: listing.id,
      listingTitle: listing.title || "",
      listingImage: listing.imageUrl || "",
      listingPrice: Number(listing.price) || 0,
      buyerId: user.uid,
      buyerName: user.displayName || user.email?.split("@")[0] || "Student",
      sellerId: listing.ownerId,
      sellerName: listing.ownerName || "",
      amount: value,
      message: (message || "").trim().slice(0, 300),
      status: "pending",
      counterAmount: null,
      createdAt: serverTimestamp(),
      lastOfferAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      respondedAt: null,
      history: pushHistory([], { by: "buyer", action: "offered", amount: value }),
    });
    tx.update(doc(db, "listings", listing.id), { offersCount: increment(1) });
    // Real response-rate bookkeeping: the seller now has one more offer
    // awaiting a first response.
    tx.update(doc(db, "users", listing.ownerId), { offersReceivedCount: increment(1) });
  });
  notify(listing.ownerId, {
    type: "offer",
    title: "New offer received",
    body: `${user.displayName || "A buyer"} offered €${value.toLocaleString()} for "${listing.title}".`,
    link: "/offers",
  });
}

/**
 * Seller responds to an offer. `action`: accept | reject | counter | expire.
 * The first response records real response-time metrics on the seller doc.
 */
export async function respondToOffer(seller, offer, action, counterAmount = null) {
  const ref = doc(db, "offers", offer.id);
  const statusMap = {
    accept: "accepted",
    reject: "rejected",
    counter: "countered",
    expire: "expired",
  };
  const status = statusMap[action];
  if (!status) throw Object.assign(new Error(), { code: "failed-precondition" });
  let value = null;
  if (action === "counter") {
    value = Number(counterAmount);
    if (!Number.isFinite(value) || value <= 0) {
      throw Object.assign(new Error("Enter a valid counter amount."), { code: "invalid-amount" });
    }
  }
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw Object.assign(new Error(), { code: "not-found" });
    const data = snap.data();
    if (data.sellerId !== seller.uid) {
      throw Object.assign(new Error(), { code: "permission-denied" });
    }
    if (!["pending", "countered"].includes(data.status)) {
      throw Object.assign(new Error("This offer has already been resolved."), {
        code: "failed-precondition",
      });
    }
    const firstResponse = !data.respondedAt;
    tx.update(ref, {
      status,
      counterAmount: action === "counter" ? value : data.counterAmount || null,
      respondedAt: data.respondedAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
      history: pushHistory(data.history, {
        by: "seller",
        action,
        amount: action === "counter" ? value : data.amount,
      }),
    });
    if (firstResponse) {
      const created = data.createdAt?.toMillis?.() || Date.now();
      tx.update(doc(db, "users", seller.uid), {
        offersRespondedCount: increment(1),
        totalResponseMillis: increment(Math.max(0, Date.now() - created)),
      });
    }
  });
  const titles = {
    accept: "Offer accepted 🎉",
    reject: "Offer declined",
    counter: "Counter offer received",
    expire: "Offer expired",
  };
  const bodies = {
    accept: `Your €${Number(offer.amount).toLocaleString()} offer for "${offer.listingTitle}" was accepted. Contact the seller to arrange pickup.`,
    reject: `The seller declined your offer for "${offer.listingTitle}".`,
    counter: `The seller countered with €${Number(value).toLocaleString()} for "${offer.listingTitle}".`,
    expire: `Your offer for "${offer.listingTitle}" expired.`,
  };
  notify(offer.buyerId, {
    type: action === "accept" ? "offer-accepted" : action === "counter" ? "offer-countered" : "offer-rejected",
    title: titles[action],
    body: bodies[action],
    link: "/offers",
  });
}

/** Buyer accepts a seller's counter offer. */
export async function acceptCounter(buyer, offer) {
  const ref = doc(db, "offers", offer.id);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw Object.assign(new Error(), { code: "not-found" });
    const data = snap.data();
    if (data.buyerId !== buyer.uid) throw Object.assign(new Error(), { code: "permission-denied" });
    if (data.status !== "countered") {
      throw Object.assign(new Error("This offer is no longer open."), { code: "failed-precondition" });
    }
    tx.update(ref, {
      status: "accepted",
      amount: data.counterAmount ?? data.amount,
      updatedAt: serverTimestamp(),
      history: pushHistory(data.history, {
        by: "buyer",
        action: "accepted-counter",
        amount: data.counterAmount ?? data.amount,
      }),
    });
  });
  notify(offer.sellerId, {
    type: "offer-accepted",
    title: "Counter offer accepted 🎉",
    body: `${buyer.displayName || "The buyer"} accepted your counter for "${offer.listingTitle}".`,
    link: "/offers",
  });
}

/** Buyer withdraws an open offer. */
export async function withdrawOffer(buyer, offer) {
  const ref = doc(db, "offers", offer.id);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    if (data.buyerId !== buyer.uid) throw Object.assign(new Error(), { code: "permission-denied" });
    if (!["pending", "countered"].includes(data.status)) {
      throw Object.assign(new Error("This offer has already been resolved."), { code: "failed-precondition" });
    }
    tx.update(ref, {
      status: "withdrawn",
      updatedAt: serverTimestamp(),
      history: pushHistory(data.history, { by: "buyer", action: "withdrew", amount: data.amount }),
    });
  });
}

/** Derives the public response metrics from real stored counters. */
export function responseMetrics(profile) {
  const received = Number(profile?.offersReceivedCount) || 0;
  const responded = Number(profile?.offersRespondedCount) || 0;
  const totalMs = Number(profile?.totalResponseMillis) || 0;
  if (!received || !responded) return { rate: null, avgLabel: null, received, responded };
  const rate = Math.min(100, Math.round((responded / received) * 100));
  const avgMs = totalMs / responded;
  const hours = avgMs / 3600000;
  const avgLabel =
    hours < 1
      ? `${Math.max(1, Math.round(avgMs / 60000))} min`
      : hours < 48
      ? `${Math.round(hours)} h`
      : `${Math.round(hours / 24)} d`;
  return { rate, avgLabel, received, responded };
}
