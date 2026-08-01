import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";

/**
 * Notification types used across the app. Each maps to an icon in the
 * NotificationsBell component.
 *  follower | offer | offer-accepted | offer-rejected | offer-countered
 *  like | achievement | price-drop | sold | new-listing | lost-found
 */

/**
 * Create a single notification for a user. Fire-and-forget by design:
 * a failed notification must never break the primary action, so callers
 * can `await` or ignore — errors are swallowed and logged.
 */
export async function notify(userId, { type, title, body = "", link = "" }) {
  if (!userId) return;
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      type,
      title,
      body,
      link,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("notify failed", e);
  }
}

/**
 * Create the same notification for many users (e.g. all followers when a
 * seller posts). Batched in chunks of 400 to stay under Firestore limits.
 */
export async function notifyMany(userIds, payload) {
  const ids = [...new Set(userIds)].filter(Boolean);
  if (!ids.length) return;
  try {
    for (let i = 0; i < ids.length; i += 400) {
      const batch = writeBatch(db);
      ids.slice(i, i + 400).forEach((uid) => {
        batch.set(doc(collection(db, "notifications")), {
          userId: uid,
          type: payload.type,
          title: payload.title,
          body: payload.body || "",
          link: payload.link || "",
          read: false,
          createdAt: serverTimestamp(),
        });
      });
      await batch.commit();
    }
  } catch (e) {
    console.error("notifyMany failed", e);
  }
}
