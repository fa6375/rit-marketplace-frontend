import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc, writeBatch } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "../lib/firebase";
import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebase";

export async function logAdminAction(admin, action, details = {}) {
  await addDoc(collection(db, "adminLogs"), {
    adminId: admin.uid,
    adminName: admin.displayName || admin.email,
    adminEmail: admin.email,
    action,
    details,
    timestamp: serverTimestamp(),
  });
}

export async function updateListing(admin, id, changes, action) {
  await updateDoc(doc(db, "listings", id), { ...changes, updatedAt: serverTimestamp() });
  await logAdminAction(admin, action, { listingId: id });
}

export async function deleteListing(admin, listing) {
  const paths = [...(listing.imagePaths || []), listing.imagePath].filter(Boolean);
  await Promise.all(paths.map((path) => deleteObject(ref(storage, path)).catch(() => null)));
  await deleteDoc(doc(db, "listings", listing.id));
  await logAdminAction(admin, `Deleted listing “${listing.title}”`, { listingId: listing.id });
}

export async function bulkUpdateListings(admin, listings, changes, action) {
  const batch = writeBatch(db);
  listings.forEach((item) => batch.update(doc(db, "listings", item.id), changes));
  await batch.commit();
  await logAdminAction(admin, action, { listingIds: listings.map((item) => item.id) });
}

export async function updateUser(admin, id, changes, action) {
  await updateDoc(doc(db, "users", id), { ...changes, updatedAt: serverTimestamp() });
  await logAdminAction(admin, action, { userId: id });
}

export async function deleteUserAccount(admin, id, label) {
  await httpsCallable(functions, "adminDeleteUser")({ userId: id });
  await logAdminAction(admin, `Deleted user ${label}`, { userId: id });
}
