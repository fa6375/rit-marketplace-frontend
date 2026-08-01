import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  collection,
  doc,
  deleteDoc,
  getDocs,
  limit as qLimit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  increment,
} from "firebase/firestore";
import { ref as storageRef, deleteObject } from "firebase/storage";
import { db, storage } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { getCategoryLabel } from "../lib/categories";
import { getTypeLabel, getConditionLabel } from "../lib/listingTypes";
import { similarListings } from "../lib/ranking";
import { recordListingView } from "../services/socialService";
import { makeOffer } from "../services/offersService";
import { friendlyError } from "../lib/errors";
import { ListingCard } from "../components/ListingCard";
import { SaveButton } from "../components/SaveButton";
import { ReportDialog } from "../components/ReportDialog";
import { ErrorState } from "../components/ErrorState";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Loader2,
  ImageOff,
  Flag,
  Eye,
  MapPin,
  HandCoins,
  History,
  ChevronDown,
  BadgeCheck,
  TrendingDown,
  TrendingUp,
  Send,
} from "lucide-react";
import { toast } from "sonner";

const inputCls =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 focus:border-[#FF5A1F] transition-all";

export default function ListingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [similar, setSimilar] = useState([]);
  const [retryKey, setRetryKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    const unsub = onSnapshot(
      doc(db, "listings", id),
      (snap) => {
        setListing(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setLoading(false);
      },
      () => {
        setLoadError(true);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [id, retryKey]);

  // Count one unique view per signed-in visitor; owners never inflate views.
  useEffect(() => {
    if (listing?.id && user?.uid) recordListingView(listing, user.uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing?.id, user?.uid]);

  // Load candidates for the "Similar listings" strip (one bounded read).
  useEffect(() => {
    if (!listing?.category) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, "listings"),
            where("category", "==", listing.category),
            qLimit(24)
          )
        );
        if (cancelled) return;
        const candidates = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSimilar(similarListings(listing, candidates, 4));
      } catch (e) {
        if (!cancelled) setSimilar([]);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing?.id, listing?.category, listing?.price]);

  const priceHistory = useMemo(() => {
    const arr = Array.isArray(listing?.priceHistory) ? [...listing.priceHistory] : [];
    return arr.sort((a, b) => (b.at?.toMillis?.() ?? 0) - (a.at?.toMillis?.() ?? 0));
  }, [listing?.priceHistory]);

  const handleDelete = async () => {
    if (!listing || deleting) return;
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
      toast.error(friendlyError(e));
    } finally {
      setDeleting(false);
    }
  };

  const toggleSold = async () => {
    if (!listing) return;
    try {
      const nowSold = !listing.sold;
      await updateDoc(doc(db, "listings", listing.id), {
        sold: nowSold,
        soldAt: nowSold ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
      });
      if (nowSold) {
        try {
          await updateDoc(doc(db, "users", user.uid), { salesCount: increment(1) });
        } catch (e) {}
        toast.success("Marked as sold 🎉");
      } else {
        try {
          await updateDoc(doc(db, "users", user.uid), { salesCount: increment(-1) });
        } catch (e) {}
        toast.success("Listing is available again");
      }
    } catch (e) {
      toast.error(friendlyError(e));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF5A1F]" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto px-6">
        <ErrorState
          title="Couldn't load this listing"
          onRetry={() => setRetryKey((k) => k + 1)}
        />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
          Listing not found
        </h2>
        <p className="text-gray-500 mt-2">It may have been removed by the owner.</p>
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
  const views = Number(listing.views) || 0;
  const original = Number(listing.originalPrice) || 0;
  const current = Number(listing.price) || 0;
  const priceDropped = original > 0 && current < original;
  const priceRose = original > 0 && current > original;
  const lastChange = priceHistory[0]?.at?.toDate?.();

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
          <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 relative">
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
            {listing.sold && (
              <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                <span className="text-sm uppercase tracking-[0.22em] font-semibold bg-white text-gray-900 px-5 py-2 rounded-full">
                  Sold
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
            <span className="flex items-center gap-1.5" data-testid="details-views">
              <Eye className="w-4 h-4" /> {views.toLocaleString()}{" "}
              {views === 1 ? "view" : "views"}
            </span>
            {listing.locationName && (
              <span className="flex items-center gap-1.5" data-testid="details-location">
                <MapPin className="w-4 h-4" /> {listing.locationName}
              </span>
            )}
            {listing.condition && (
              <span data-testid="details-condition">
                Condition: {getConditionLabel(listing.condition)}
              </span>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#FF5A1F]">
              {getCategoryLabel(listing.category)}
            </span>
            {listing.type && listing.type !== "product" && (
              <span className="text-[10px] uppercase tracking-[0.22em] font-semibold text-gray-400">
                · {getTypeLabel(listing.type)}
              </span>
            )}
          </div>
          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mt-2 leading-tight"
            data-testid="details-title"
          >
            {listing.title}
          </h1>

          <div className="mt-4 flex items-end gap-3 flex-wrap">
            <p className="text-3xl font-semibold text-[#FF5A1F]" data-testid="details-price">
              {current.toLocaleString()} €
            </p>
            {priceDropped && (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full mb-1">
                <TrendingDown className="w-3.5 h-3.5" /> was {original.toLocaleString()} €
              </span>
            )}
            {priceRose && (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full mb-1">
                <TrendingUp className="w-3.5 h-3.5" /> was {original.toLocaleString()} €
              </span>
            )}
          </div>

          {priceHistory.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setHistoryOpen((o) => !o)}
                data-testid="details-price-history-toggle"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                <History className="w-3.5 h-3.5" /> Price history
                {lastChange && (
                  <span className="text-gray-400">
                    · updated {lastChange.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${historyOpen ? "rotate-180" : ""}`}
                />
              </button>
              {historyOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden"
                  data-testid="details-price-history"
                >
                  {priceHistory.map((h, i) => {
                    const next = priceHistory[i + 1];
                    const prev = next ? Number(next.price) : null;
                    const val = Number(h.price);
                    return (
                      <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                        <span className="text-gray-500">
                          {h.at?.toDate?.()?.toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }) || "—"}
                          {i === priceHistory.length - 1 && (
                            <span className="text-gray-400 text-xs ml-1.5">original</span>
                          )}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-gray-900">
                          {prev !== null &&
                            (val < prev ? (
                              <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                            ) : val > prev ? (
                              <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                            ) : null)}
                          €{val.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          )}

          <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500">
              Description
            </h3>
            <p className="text-gray-800 mt-2 whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </p>
          </div>

          <Link
            to={`/seller/${listing.ownerId}`}
            className="mt-4 block bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#FF5A1F]/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all group"
            data-testid="details-seller-link"
          >
            <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500">
              Seller
            </h3>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0A0A0A] text-white font-semibold flex items-center justify-center text-sm overflow-hidden">
                {listing.ownerPhotoURL ? (
                  <img src={listing.ownerPhotoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  (listing.ownerName || "S").slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                  {listing.ownerName || "Student"}
                  <BadgeCheck className="w-4 h-4 text-[#FF5A1F]" />
                </p>
                <p className="text-xs text-gray-500">Posted {created}</p>
              </div>
              <span className="text-xs font-medium text-[#FF5A1F] opacity-0 group-hover:opacity-100 transition-opacity">
                View profile →
              </span>
            </div>
            <div className="mt-4 flex items-start gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl p-3 border border-gray-100">
              <Mail className="w-4 h-4 mt-0.5 text-gray-500" />
              <span data-testid="details-contact" className="break-all">
                {listing.contact}
              </span>
            </div>
          </Link>

          {!isOwner && (
            <>
              <div className="mt-5 flex gap-3">
                <SaveButton listing={listing} variant="full" />
                <button
                  onClick={() => {
                    if (listing.sold) {
                      toast.info("This listing has already been sold.");
                      return;
                    }
                    setOfferOpen(true);
                  }}
                  data-testid="details-offer-btn"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#FF5A1F] hover:bg-[#E04812] disabled:opacity-60 text-white font-medium py-3 rounded-full transition-colors text-sm shadow-[0_8px_24px_rgba(255,90,31,0.25)]"
                  disabled={listing.sold}
                >
                  <HandCoins className="w-4 h-4" /> Make an offer
                </button>
              </div>
              <button
                onClick={() => setReportOpen(true)}
                data-testid="details-report-btn"
                className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 font-medium py-3 rounded-full transition-colors text-sm"
              >
                <Flag className="w-4 h-4" /> Report this listing
              </button>
            </>
          )}

          {isOwner && (
            <div className="mt-5 space-y-3" data-testid="details-owner-actions">
              <button
                onClick={toggleSold}
                data-testid="details-sold-toggle"
                className={`w-full inline-flex items-center justify-center gap-2 font-medium py-3 rounded-full transition-colors text-sm border ${
                  listing.sold
                    ? "bg-white border-gray-200 text-gray-900 hover:bg-gray-50"
                    : "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <BadgeCheck className="w-4 h-4" />
                {listing.sold ? "Mark as available" : "Mark as sold"}
              </button>
              <div className="flex gap-3">
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
                        This action cannot be undone. The listing and its image will be
                        permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-testid="delete-cancel-btn">Cancel</AlertDialogCancel>
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
            </div>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">
            Similar listings
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            More items you might be interested in.
          </p>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-5"
            data-testid="similar-listings"
          >
            {similar.map((l, i) => (
              <ListingCard key={l.id} listing={l} index={i} />
            ))}
          </div>
        </div>
      )}

      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} listing={listing} />
      <MakeOfferDialog open={offerOpen} onOpenChange={setOfferOpen} listing={listing} />
    </motion.div>
  );
}

function MakeOfferDialog({ open, onOpenChange, listing }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter a valid offer amount");
      return;
    }
    setBusy(true);
    try {
      await makeOffer(user, listing, value, message);
      toast.success("Offer sent — the seller has been notified");
      setAmount("");
      setMessage("");
      onOpenChange(false);
    } catch (err) {
      const custom = ["duplicate-offer", "own-listing", "sold", "invalid-amount"];
      toast.error(custom.includes(err?.code) ? err.message : friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl" data-testid="offer-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="w-4 h-4 text-[#FF5A1F]" /> Make an offer
          </DialogTitle>
          <DialogDescription>
            Offering on "{listing?.title}" — asking price €
            {Number(listing?.price).toLocaleString()}. The seller can accept, decline, or
            counter.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 mt-2" data-testid="offer-form">
          <div>
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
              Your offer (EUR)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0"
              data-testid="offer-amount-input"
              className={`${inputCls} mt-1.5`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Anything the seller should know…"
              data-testid="offer-message-input"
              className={`${inputCls} mt-1.5 resize-none`}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            data-testid="offer-submit-btn"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#FF5A1F] hover:bg-[#E04812] disabled:opacity-60 text-white font-medium py-3 rounded-full transition-colors"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send offer</>}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
