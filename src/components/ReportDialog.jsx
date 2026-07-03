import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Flag, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

// Category options depend on what is being reported
export const GENERAL_REPORT_CATEGORIES = [
  { id: "bug", label: "Bug or technical issue" },
  { id: "fraud", label: "Fraud or scam" },
  { id: "user-behavior", label: "User behavior" },
  { id: "account", label: "Account issue" },
  { id: "suggestion", label: "Suggestion / feedback" },
  { id: "other", label: "Other" },
];

export const LISTING_REPORT_CATEGORIES = [
  { id: "scam", label: "Scam or fraud" },
  { id: "prohibited", label: "Prohibited or illegal item" },
  { id: "misleading", label: "Misleading title or description" },
  { id: "offensive", label: "Offensive content" },
  { id: "wrong-category", label: "Wrong category" },
  { id: "spam", label: "Spam or duplicate listing" },
  { id: "other", label: "Other" },
];

export const getReportCategoryLabel = (id) =>
  [...GENERAL_REPORT_CATEGORIES, ...LISTING_REPORT_CATEGORIES].find(
    (c) => c.id === id
  )?.label || id || "Other";

const inputCls =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 focus:border-[#FF5A1F] transition-all";

/**
 * ReportDialog — controlled dialog for submitting reports.
 * Pass a `listing` to report a specific listing; omit it for a general report.
 */
export function ReportDialog({ open, onOpenChange, listing = null }) {
  const { user } = useAuth();
  const isListingReport = Boolean(listing);
  const categories = isListingReport
    ? LISTING_REPORT_CATEGORIES
    : GENERAL_REPORT_CATEGORIES;

  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setCategory("");
    setDescription("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!category) {
      toast.error("Please choose a category");
      return;
    }
    if (!description.trim()) {
      toast.error("Please describe the issue");
      return;
    }
    setBusy(true);
    try {
      await addDoc(collection(db, "reports"), {
        type: isListingReport ? "listing" : "general",
        category,
        categoryLabel: getReportCategoryLabel(category),
        reason: description.trim(),
        status: "pending",
        // Reporter info (shown to admins only — Firestore rules restrict reads)
        reporterId: user.uid,
        reporterName: user.displayName || "",
        reporterEmail: user.email || "",
        // Listing / seller info when reporting a listing
        ...(isListingReport
          ? {
              listingId: listing.id,
              listingTitle: listing.title || "",
              sellerId: listing.ownerId || "",
              sellerName: listing.ownerName || "",
              sellerEmail: listing.ownerEmail || "",
            }
          : {}),
        createdAt: serverTimestamp(),
      });
      toast.success("Report sent. Our admins will review it shortly — thank you!");
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.message || "Could not send the report. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl" data-testid="report-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-[#FF5A1F]" />
            {isListingReport ? "Report this listing" : "Send a report"}
          </DialogTitle>
          <DialogDescription>
            {isListingReport
              ? `Reporting "${listing?.title}". Your report goes straight to the admins.`
              : "Something wrong, suspicious, or worth improving? Tell the admins — general or specific, anything goes."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 mt-2" data-testid="report-form">
          <div>
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              data-testid="report-category-select"
              className={`${inputCls} mt-1.5 appearance-none`}
            >
              <option value="" disabled>
                Choose a category…
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              maxLength={1000}
              placeholder={
                isListingReport
                  ? "What looks suspicious or wrong about this listing?"
                  : "Describe the issue, the user involved, or your suggestion…"
              }
              data-testid="report-description-input"
              className={`${inputCls} mt-1.5 resize-none`}
            />
            <p className="text-[11px] text-gray-400 mt-1 text-right">
              {description.length}/1000
            </p>
          </div>

          <button
            type="submit"
            disabled={busy}
            data-testid="report-submit-btn"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#FF5A1F] hover:bg-[#E04812] disabled:opacity-60 text-white font-medium py-3 rounded-full transition-colors"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" /> Send report
              </>
            )}
          </button>
          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
            Your name and email are included so admins can follow up. Reports
            are visible to administrators only.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
