import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import { CATEGORIES } from "../lib/categories";
import { ListingCard } from "../components/ListingCard";
import { EmptyState } from "../components/EmptyState";
import { ListingSkeletonGrid } from "../components/ListingSkeleton";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setListings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Firestore error:", err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return listings.filter((l) => {
      if (activeCategory !== "all" && l.category !== activeCategory) return false;
      if (!s) return true;
      return (
        l.title?.toLowerCase().includes(s) ||
        l.description?.toLowerCase().includes(s)
      );
    });
  }, [listings, search, activeCategory]);

  const hasNoListings = !loading && listings.length === 0;
  const hasNoResults = !loading && listings.length > 0 && filtered.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#FF5A1F]">
          Campus marketplace
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 mt-2 leading-none">
          Discover student listings.
        </h1>
        <p className="text-gray-500 mt-3 max-w-xl leading-relaxed">
          Browse items from verified students on your campus. New posts appear
          here in real time.
        </p>
      </motion.div>

      {/* Search */}
      <div className="mt-8">
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings..."
            data-testid="dashboard-search-input"
            className="w-full bg-white border border-gray-200 rounded-full pl-11 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 focus:border-[#FF5A1F] transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              aria-label="Clear search"
              data-testid="dashboard-search-clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mt-5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
          <CategoryPill
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            testId="category-pill-all"
          >
            All
          </CategoryPill>
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <CategoryPill
                key={c.id}
                active={activeCategory === c.id}
                onClick={() => setActiveCategory(c.id)}
                testId={`category-pill-${c.id}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {c.label}
              </CategoryPill>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-10">
        {loading ? (
          <ListingSkeletonGrid />
        ) : hasNoListings ? (
          <EmptyState />
        ) : hasNoResults ? (
          <EmptyState
            title="No listings match your filters"
            subtitle="Try a different category or clear your search."
            showCta={false}
          />
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            data-testid="listings-grid"
          >
            {filtered.map((l, i) => (
              <ListingCard key={l.id} listing={l} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const CategoryPill = ({ children, active, onClick, testId }) => (
  <button
    onClick={onClick}
    data-testid={testId}
    className={`inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${
      active
        ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
    }`}
  >
    {children}
  </button>
);
