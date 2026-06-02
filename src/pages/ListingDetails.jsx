import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  doc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import { ref as storageRef, deleteObject } from "firebase/storage";
import { db, storage } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { getCategoryLabel } from "../lib/categories";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { ArrowLeft, Pencil, Trash2, Mail, Loader2, ImageOff } from "lucide-react";
import { toast } from "sonner";

export default function ListingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "listings", id),
      (snap) => {
        if (snap.exists()) {
          setListing({ id: snap.id, ...snap.data() });
        } else {
          setListing(null);
        }
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, [id]);

  const handleDelete = async () => {
    if (!listing) return;
    setDeleting(true);
    try {
      if (listing.imagePath) {
        try {
          await deleteObject(storageRef(storage, listing.imagePath));
        } catch (e) {}
      }
      await deleteDoc(doc(db, "listings", listing.id));
      toast.success("Listing deleted");
      navigate("/");
    } catch (e) {
      toast.error("Failed to delete listing");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF5A1F]" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
          Listing not found
        </h2>
        <p className="text-gray-500 mt-2">
          It may have been removed by the owner.
        </p>
        <Link
          to="/"
          className="inline-block mt-6 text-[#FF5A1F] font-medium hover:text-[#E04812]"
        >
          Back to marketplace
        </Link>
      </div>
    );
  }

  const isOwner = user?.uid === listing.ownerId;
  const created =
    listing.createdAt?.toDate?.()?.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }) || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
    >
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
        data-testid="details-back-btn"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
            {listing.imageUrl ? (
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="w-full h-full object-cover"
                data-testid="details-image"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ImageOff className="w-12 h-12" />
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <span className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#FF5A1F]">
            {getCategoryLabel(listing.category)}
          </span>
          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mt-2 leading-tight"
            data-testid="details-title"
          >
            {listing.title}
          </h1>
          <p
            className="text-3xl font-semibold text-[#FF5A1F] mt-4"
            data-testid="details-price"
          >
            ${Number(listing.price).toLocaleString()}
          </p>
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500">
              Description
            </h3>
            <p className="text-gray-800 mt-2 whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </p>
          </div>

          <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500">
              Seller
            </h3>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0A0A0A] text-white font-semibold flex items-center justify-center text-sm">
                {(listing.ownerName || "S").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {listing.ownerName || "Student"}
                </p>
                <p className="text-xs text-gray-500">Posted {created}</p>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl p-3 border border-gray-100">
              <Mail className="w-4 h-4 mt-0.5 text-gray-500" />
              <span data-testid="details-contact" className="break-all">
                {listing.contact}
              </span>
            </div>
          </div>

          {isOwner && (
            <div
              className="mt-5 flex gap-3"
              data-testid="details-owner-actions"
            >
              <Link
                to={`/edit/${listing.id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-900 font-medium py-3 rounded-full hover:bg-gray-50 transition-colors"
                data-testid="details-edit-btn"
              >
                <Pencil className="w-4 h-4" /> Edit
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 rounded-full transition-colors border border-red-100"
                    data-testid="details-delete-btn"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The listing and its image
                      will be permanently removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="delete-cancel-btn">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleting}
                      data-testid="delete-confirm-btn"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
