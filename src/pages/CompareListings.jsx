import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useCompare, MAX_COMPARE } from "../context/CompareContext";
import { getCategoryLabel } from "../lib/categories";
import { getConditionLabel } from "../lib/listingTypes";
import { ErrorState } from "../components/ErrorState";
import { ArrowLeft, ImageOff, Loader2, X, Eye, Heart } from "lucide-react";

export default function CompareListings() {
  const [params] = useSearchParams();
  const { toggleCompare } = useCompare();
  const navigate = useNavigate();
  const ids = useMemo(
    () =>
      [...new Set((params.get("ids") || "").split(",").filter(Boolean))].slice(
        0,
        MAX_COMPARE
      ),
    [params]
  );
  const [items, setItems] = useState(null);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!ids.length) {
      setItems([]);
      return;
    }
    let cancelled = false;
    setItems(null);
    setError(false);
    (async () => {
      try {
        const snaps = await Promise.all(ids.map((id) => getDoc(doc(db, "listings", id))));
        if (cancelled) return;
        setItems(
          snaps
            .filter((s) => s.exists())
            .map((s) => ({ id: s.id, ...s.data() }))
        );
      } catch (e) {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ids, retryKey]);

  const remove = (id) => {
    toggleCompare(id);
    const rest = ids.filter((x) => x !== id);
    navigate(rest.length ? `/compare?ids=${rest.join(",")}` : "/", { replace: true });
  };

  const fmtDate = (ts) =>
    ts?.toDate?.()?.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) || "—";

  const rows = [
    ["Price", (l) => <span className="font-semibold text-[#FF5A1F]">€{Number(l.price).toLocaleString()}</span>],
    ["Condition", (l) => getConditionLabel(l.condition)],
    ["Category", (l) => getCategoryLabel(l.category)],
    ["Seller", (l) => (
      <Link to={`/seller/${l.ownerId}`} className="text-gray-900 font-medium hover:text-[#FF5A1F]">
        {l.ownerName || "Student"}
      </Link>
    )],
    ["Location", (l) => l.locationName || "—"],
    ["Posted", (l) => fmtDate(l.createdAt)],
    ["Views", (l) => (
      <span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-gray-400" />{Number(l.views) || 0}</span>
    )],
    ["Saves", (l) => (
      <span className="inline-flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-gray-400" />{Number(l.savesCount) || 0}</span>
    )],
    ["Status", (l) =>
      l.sold ? (
        <span className="text-gray-500 font-medium">Sold</span>
      ) : (
        <span className="text-emerald-600 font-medium">Available</span>
      ),
    ],
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
        data-testid="compare-back-btn"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#FF5A1F]">
          Side by side
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 mt-2 leading-none">
          Compare listings
        </h1>
      </motion.div>

      <div className="mt-8">
        {error ? (
          <ErrorState title="Couldn't load the comparison" onRetry={() => setRetryKey((k) => k + 1)} />
        ) : items === null ? (
          <div className="min-h-[30vh] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF5A1F]" />
          </div>
        ) : items.length < 2 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-900">Not enough listings to compare</h2>
            <p className="text-gray-500 mt-2 text-sm">
              {items.length === 1
                ? "One of the selected listings is no longer available."
                : "Select at least two listings from the marketplace using the compare button on any card."}
            </p>
            <Link to="/" className="inline-block mt-5 text-[#FF5A1F] font-medium hover:text-[#E04812]">
              Back to marketplace
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm" data-testid="compare-table">
              <thead>
                <tr>
                  <th className="p-4 w-32" />
                  {items.map((l) => (
                    <th key={l.id} className="p-4 text-left align-top">
                      <div className="relative">
                        <button
                          onClick={() => remove(l.id)}
                          aria-label="Remove from comparison"
                          data-testid={`compare-remove-${l.id}`}
                          className="absolute -top-1 -right-1 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <Link to={`/listing/${l.id}`} className="block group">
                          <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center text-gray-300">
                            {l.imageUrl ? (
                              <img
                                src={l.imageUrl}
                                alt={l.title}
                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                              />
                            ) : (
                              <ImageOff className="w-8 h-8" />
                            )}
                          </div>
                          <p className="font-semibold text-gray-900 mt-3 line-clamp-2 leading-snug group-hover:text-[#FF5A1F] transition-colors">
                            {l.title}
                          </p>
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, render]) => (
                  <tr key={label} className="border-t border-gray-50">
                    <td className="p-4 text-[10px] uppercase tracking-wider font-semibold text-gray-400 align-top">
                      {label}
                    </td>
                    {items.map((l) => (
                      <td key={l.id} className="p-4 text-gray-700 align-top">
                        {render(l)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
