import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { notify } from "./notificationsService";

/**
 * Achievements unlock automatically from *real* activity counters. Each
 * definition compares a metric against a threshold; admins can create,
 * edit, and disable definitions in the admin panel.
 *
 * Metrics (all derived from actual stored data):
 *   listings  — active + sold listings posted
 *   sales     — listings marked as sold
 *   followers — followersCount on the user doc
 *   responses — offers responded to
 *   views     — total views across the user's listings
 *   saves     — total saves across the user's listings
 */

export const ACHIEVEMENT_METRICS = [
  { id: "listings", label: "Listings posted" },
  { id: "sales", label: "Items sold" },
  { id: "followers", label: "Followers" },
  { id: "responses", label: "Offers responded to" },
  { id: "views", label: "Total listing views" },
  { id: "saves", label: "Total listing saves" },
];

export const DEFAULT_ACHIEVEMENTS = [
  { id: "first-listing", name: "First Listing", description: "Post your first listing.", metric: "listings", threshold: 1, emoji: "🎉" },
  { id: "ten-listings", name: "Power Seller", description: "Post 10 listings.", metric: "listings", threshold: 10, emoji: "📦" },
  { id: "first-sale", name: "First Sale", description: "Sell your first item.", metric: "sales", threshold: 1, emoji: "💸" },
  { id: "popular-seller", name: "Popular Seller", description: "Reach 100 total listing views.", metric: "views", threshold: 100, emoji: "🔥" },
  { id: "hundred-followers", name: "Campus Famous", description: "Reach 100 followers.", metric: "followers", threshold: 100, emoji: "⭐" },
  { id: "fast-responder", name: "Fast Responder", description: "Respond to 10 offers.", metric: "responses", threshold: 10, emoji: "⚡" },
  { id: "trusted-seller", name: "Trusted Seller", description: "Get saved to 25 wishlists.", metric: "saves", threshold: 25, emoji: "🤝" },
];

/** Computes real metric values from the user's profile + their listings. */
export function computeMetrics(profile, myListings = []) {
  return {
    listings: myListings.length,
    sales: myListings.filter((l) => l.sold).length,
    followers: Number(profile?.followersCount) || 0,
    responses: Number(profile?.offersRespondedCount) || 0,
    views: myListings.reduce((n, l) => n + (Number(l.views) || 0), 0),
    saves: myListings.reduce((n, l) => n + (Number(l.savesCount) || 0), 0),
  };
}

let checking = false;

/**
 * Checks every enabled achievement definition against the user's real
 * metrics and unlocks any that are newly earned (idempotent — deterministic
 * doc ids prevent double unlocks even across devices).
 */
export async function checkAchievements(user, profile, myListings) {
  if (!user?.uid || checking) return;
  checking = true;
  try {
    const defsSnap = await getDocs(collection(db, "achievements"));
    const defs = defsSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((a) => a.enabled !== false);
    if (!defs.length) return;
    const metrics = computeMetrics(profile, myListings);
    const unlockedSnap = await getDocs(
      query(collection(db, "userAchievements"), where("uid", "==", user.uid))
    );
    const unlocked = new Set(unlockedSnap.docs.map((d) => d.data().achievementId));
    for (const def of defs) {
      if (unlocked.has(def.id)) continue;
      const value = metrics[def.metric];
      if (typeof value !== "number" || value < Number(def.threshold)) continue;
      const ref = doc(db, "userAchievements", `${user.uid}_${def.id}`);
      const existing = await getDoc(ref);
      if (existing.exists()) continue;
      await setDoc(ref, {
        uid: user.uid,
        achievementId: def.id,
        name: def.name,
        emoji: def.emoji || "🏆",
        unlockedAt: serverTimestamp(),
      });
      notify(user.uid, {
        type: "achievement",
        title: `Achievement unlocked: ${def.name} ${def.emoji || "🏆"}`,
        body: def.description || "",
        link: `/seller/${user.uid}`,
      });
    }
  } catch (e) {
    console.error("checkAchievements failed", e);
  } finally {
    checking = false;
  }
}
