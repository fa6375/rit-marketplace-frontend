const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

exports.adminDeleteUser = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in is required.");
  const db = getFirestore();
  const admin = await db.doc(`users/${request.auth.uid}`).get();
  if (admin.data()?.role !== "admin") throw new HttpsError("permission-denied", "Administrator access is required.");
  const userId = request.data?.userId;
  if (!userId || userId === request.auth.uid) throw new HttpsError("invalid-argument", "A different user account is required.");
  await getAuth().deleteUser(userId);
  await db.doc(`users/${userId}`).delete();
  return { deleted: true };
});
