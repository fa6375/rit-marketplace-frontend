import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import {
  acceptCounter,
  respondToOffer,
  withdrawOffer,
} from "../services/offersService";
import { friendlyError } from "../lib/errors";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import {
  HandCoins,
  Check,
  X,
  ArrowLeftRight,
  Clock,
  ChevronDown,
  Loader2,
  ImageOff,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_STYLES = {
  pending: "bg-orange-50 border-orange-100 text-[#FF5A1F]",
  countered: "bg-blue-50 border-blue-100 text-blue-600",
  accepted: "bg-emerald-50 border-emerald-100 text-emerald-600",
  rejected: "bg-red-50 border-red-100 text-red-500",
  expired: "bg-gray-50 border-gray-100 text-gray-400",
  withdrawn: "bg-gray-50 border-gray-100 text-gray-400",
};

const STATUS_LABELS = {
  pending: "Pending",
  countered: "Countered",
  accepted: "Accepted",
  rejected: "Declined",
  expired: "Expired",
  withdrawn: "Withdrawn",
};

const sortByUpdated = (a, b) =>
  (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0);

export default function Offers() {
  const { user } = useAuth();
  const [tab, setTab] = useState("received");
  const [received, setReceived] = useState(null);
  const [sent, setSent] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub1 = onSnapshot(
      query(collection(db, "offers"), where("sellerId", "==", user.uid)),
      (snap) => setReceived(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(sortByUpdated)),
      () => setError(true)
    );
    const unsub2 = onSnapshot(
      query(collection(db, "offers"), where("buyerId", "==", user.uid)),
      (snap) => setSent(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(sortByUpdated)),
      () => setError(true)
    );
    return () => {
      unsub1();
      unsub2();
    };
  }, [user?.uid]);

  const items = tab === "received" ? received : sent;
  const pendingReceived = useMemo(
    () => (received || []).filter((o) => ["pending", "countered"].includes(o.status)).length,
    [received]
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#FF5A1F]">
          Negotiations
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 mt-2 leading-none">
          Offers
        </h1>
        <p className="text-gray-500 mt-3 leading-relaxed">
          Accept, decline, or counter offers on your listings — and track the ones you've
          sent.
        </p>
      </motion.div>

      <div className="mt-8 flex gap-2">
        {[
          ["received", `Received${pendingReceived ? ` (${pendingReceived} open)` : ""}`],
          ["sent", "Sent"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            data-testid={`offers-tab-${id}`}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              tab === id
                ? "bg-[#0A0A0A] text-white border-[#0A0A0A] dark:bg-[#FF5A1F] dark:border-[#FF5A1F]"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {error ? (
          <ErrorState title="Couldn't load your offers" onRetry={() => window.location.reload()} />
        ) : items === null ? (
          <div className="min-h-[30vh] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF5A1F]" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title={tab === "received" ? "No offers received yet" : "You haven't made any offers"}
            subtitle={
              tab === "received"
                ? "Offers buyers make on your listings will show up here."
                : "Find something you like and tap “Make an offer”."
            }
            ctaLabel="Browse listings"
            ctaTo="/"
            showCta={tab === "sent"}
          />
        ) : (
          items.map((o) => <OfferCard key={o.id} offer={o} role={tab} user={user} />)
        )}
      </div>
    </div>
  );
}

function OfferCard({ offer, role, user }) {
  const [busy, setBusy] = useState(null);
  const [countering, setCountering] = useState(false);
  const [counterValue, setCounterValue] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const isOpen = ["pending", "countered"].includes(offer.status);

  const run = async (key, fn, successMsg) => {
    if (busy) return;
    setBusy(key);
    try {
      await fn();
      if (successMsg) toast.success(successMsg);
      setCountering(false);
      setCounterValue("");
    } catch (e) {
      toast.error(e?.code === "invalid-amount" || e?.code === "failed-precondition" ? e.message : friendlyError(e));
    } finally {
      setBusy(null);
    }
  };

  const otherName = role === "received" ? offer.buyerName : offer.sellerName;
  const history = Array.isArray(offer.history) ? [...offer.history].reverse() : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-5"
      data-testid={`offer-card-${offer.id}`}
    >
      <div className="flex gap-4">
        <Link
          to={`/listing/${offer.listingId}`}
          className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center text-gray-300"
        >
          {offer.listingImage ? (
            <img src={offer.listingImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageOff className="w-5 h-5" />
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/listing/${offer.listingId}`}
              className="font-semibold text-gray-900 hover:text-[#FF5A1F] transition-colors truncate"
            >
              {offer.listingTitle}
            </Link>
            <span
              className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[offer.status] || STATUS_STYLES.expired}`}
              data-testid={`offer-status-${offer.id}`}
            >
              {STATUS_LABELS[offer.status] || offer.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {role === "received" ? "From" : "To"}{" "}
            <Link
              to={`/seller/${role === "received" ? offer.buyerId : offer.sellerId}`}
              className="font-medium text-gray-700 hover:text-[#FF5A1F]"
            >
              {otherName || "Student"}
            </Link>
            {" · asking €"}
            {Number(offer.listingPrice).toLocaleString()}
          </p>
          <div className="mt-2 flex items-baseline gap-3 flex-wrap">
            <span className="text-xl font-semibold text-[#FF5A1F]">
              €{Number(offer.amount).toLocaleString()}
            </span>
            {offer.status === "countered" && offer.counterAmount != null && (
              <span className="text-sm font-medium text-blue-600">
                counter: €{Number(offer.counterAmount).toLocaleString()}
              </span>
            )}
          </div>
          {offer.message && (
            <p className="text-sm text-gray-600 mt-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 leading-relaxed">
              "{offer.message}"
            </p>
          )}

          {/* Actions */}
          {role === "received" && isOpen && (
            <div className="mt-3 flex flex-wrap gap-2">
              <ActionBtn
                busy={busy === "accept"}
                onClick={() =>
                  run("accept", () => respondToOffer(user, offer, "accept"), "Offer accepted — the buyer has been notified")
                }
                testId={`offer-accept-${offer.id}`}
                className="bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100"
              >
                <Check className="w-3.5 h-3.5" /> Accept
              </ActionBtn>
              <ActionBtn
                busy={busy === "reject"}
                onClick={() => run("reject", () => respondToOffer(user, offer, "reject"), "Offer declined")}
                testId={`offer-reject-${offer.id}`}
                className="bg-red-50 border-red-100 text-red-600 hover:bg-red-100"
              >
                <X className="w-3.5 h-3.5" /> Decline
              </ActionBtn>
              {!countering ? (
                <ActionBtn
                  onClick={() => setCountering(true)}
                  testId={`offer-counter-${offer.id}`}
                  className="bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" /> Counter
                </ActionBtn>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(
                      "counter",
                      () => respondToOffer(user, offer, "counter", counterValue),
                      "Counter offer sent"
                    );
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    autoFocus
                    value={counterValue}
                    onChange={(e) => setCounterValue(e.target.value)}
                    placeholder="Counter €"
                    data-testid={`offer-counter-input-${offer.id}`}
                    className="w-28 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 focus:border-[#FF5A1F]"
                  />
                  <ActionBtn
                    type="submit"
                    busy={busy === "counter"}
                    testId={`offer-counter-send-${offer.id}`}
                    className="bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100"
                  >
                    Send
                  </ActionBtn>
                  <button
                    type="button"
                    onClick={() => setCountering(false)}
                    className="text-xs text-gray-400 hover:text-gray-700 px-1"
                  >
                    Cancel
                  </button>
                </form>
              )}
              <ActionBtn
                busy={busy === "expire"}
                onClick={() => run("expire", () => respondToOffer(user, offer, "expire"), "Offer expired")}
                testId={`offer-expire-${offer.id}`}
                className="bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"
              >
                <Clock className="w-3.5 h-3.5" /> Expire
              </ActionBtn>
            </div>
          )}
          {role === "sent" && isOpen && (
            <div className="mt-3 flex flex-wrap gap-2">
              {offer.status === "countered" && (
                <ActionBtn
                  busy={busy === "acceptCounter"}
                  onClick={() =>
                    run(
                      "acceptCounter",
                      () => acceptCounter(user, offer),
                      "Counter accepted — contact the seller to arrange pickup"
                    )
                  }
                  testId={`offer-accept-counter-${offer.id}`}
                  className="bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100"
                >
                  <Check className="w-3.5 h-3.5" /> Accept counter €
                  {Number(offer.counterAmount).toLocaleString()}
                </ActionBtn>
              )}
              <ActionBtn
                busy={busy === "withdraw"}
                onClick={() => run("withdraw", () => withdrawOffer(user, offer), "Offer withdrawn")}
                testId={`offer-withdraw-${offer.id}`}
                className="bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"
              >
                <X className="w-3.5 h-3.5" /> Withdraw
              </ActionBtn>
            </div>
          )}

          {/* History */}
          {history.length > 1 && (
            <div className="mt-3">
              <button
                onClick={() => setHistoryOpen((o) => !o)}
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
                data-testid={`offer-history-toggle-${offer.id}`}
              >
                <HandCoins className="w-3.5 h-3.5" /> Offer history ({history.length})
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${historyOpen ? "rotate-180" : ""}`} />
              </button>
              {historyOpen && (
                <div className="mt-2 border-l-2 border-gray-100 pl-3 space-y-1.5">
                  {history.map((h, i) => (
                    <p key={i} className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700 capitalize">
                        {h.by === "buyer" ? offer.buyerName || "Buyer" : offer.sellerName || "Seller"}
                      </span>{" "}
                      {h.action === "offered" && `offered €${Number(h.amount).toLocaleString()}`}
                      {h.action === "counter" && `countered €${Number(h.amount).toLocaleString()}`}
                      {h.action === "accept" && "accepted the offer"}
                      {h.action === "accepted-counter" && `accepted the counter of €${Number(h.amount).toLocaleString()}`}
                      {h.action === "reject" && "declined the offer"}
                      {h.action === "expire" && "let the offer expire"}
                      {h.action === "withdrew" && "withdrew the offer"}
                      <span className="text-gray-300">
                        {" · "}
                        {h.at?.toDate?.()?.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        }) || ""}
                      </span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const ActionBtn = ({ children, busy, className = "", testId, ...props }) => (
  <button
    {...props}
    disabled={busy}
    data-testid={testId}
    className={`inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${className}`}
  >
    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : children}
  </button>
);
