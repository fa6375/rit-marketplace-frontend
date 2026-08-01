import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { useCategories } from "../hooks/useCategories";
import { useLocations, useSaves } from "../hooks/useSocial";
import { useSettings } from "../context/SettingsContext";
import { ListingCard } from "../components/ListingCard";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { ListingSkeletonGrid } from "../components/ListingSkeleton";
import { buildSuggestions, discoverListings, trendingListings } from "../lib/ranking";
import { enabledTypes } from "../lib/listingTypes";
import {
  Search,
  X,
  Flame,
  Compass,
  MapPin,
  Tag,
  User,
  Package,
  CornerDownLeft,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeType, setActiveType] = useState("all");
  const [activeLocation, setActiveLocation] = useState("all");
  const { categories } = useCategories();
  const { locations } = useLocations();
  const { saves } = useSaves();
  const settings = useSettings();
  const { homepageHeroText } = settings;
  const types = enabledTypes(settings);
  const navigate = useNavigate();

  // Search suggestions state
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const searchWrapRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setListings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Firestore error:", err);
        setLoadError(true);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [retryKey]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const onClick = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSuggestOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const suggestions = useMemo(
    () => buildSuggestions(search, { listings, categories }),
    [search, listings, categories]
  );

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return listings.filter((l) => {
      if (l.hidden) return false;
      if (activeCategory !== "all" && l.category !== activeCategory) return false;
      if (activeType !== "all" && (l.type || "product") !== activeType) return false;
      if (activeLocation !== "all" && l.location !== activeLocation) return false;
      if (!s) return true;
      return (
        l.title?.toLowerCase().includes(s) ||
        l.description?.toLowerCase().includes(s) ||
        l.ownerName?.toLowerCase().includes(s) ||
        l.locationName?.toLowerCase().includes(s)
      );
    });
  }, [listings, search, activeCategory, activeType, activeLocation]);

  const trending = useMemo(() => trendingListings(listings, 4), [listings]);
  const discover = useMemo(() => {
    if (!user?.uid) return [];
    const preferred = [
      ...new Set(
        saves
          .map((s) => listings.find((l) => l.id === s.listingId)?.category)
          .filter(Boolean)
      ),
    ];
    return discoverListings(listings, user.uid, preferred, 4);
  }, [listings, saves, user?.uid]);

  const noFiltersActive =
    !search.trim() && activeCategory === "all" && activeType === "all" && activeLocation === "all";
  const hasNoListings = !loading && !loadError && listings.length === 0;
  const hasNoResults = !loading && !loadError && listings.length > 0 && filtered.length === 0;

  const applySuggestion = (sug) => {
    setSuggestOpen(false);
    setHighlight(-1);
    if (sug.kind === "listing") navigate(`/listing/${sug.id}`);
    else if (sug.kind === "seller") navigate(`/seller/${sug.id}`);
    else if (sug.kind === "category") {
      setActiveCategory(sug.id);
      setSearch("");
    }
  };

  const onSearchKeyDown = (e) => {
    if (!suggestOpen || !suggestions.length) {
      if (e.key === "Escape") setSuggestOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
    } else if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      applySuggestion(suggestions[highlight]);
    } else if (e.key === "Escape") {
      setSuggestOpen(false);
      setHighlight(-1);
    }
  };

  const SUG_ICON = { listing: Package, category: Tag, seller: User };

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
          {homepageHeroText || "Discover student listings."}
        </h1>
        <p className="text-gray-500 mt-3 max-w-xl leading-relaxed">
          Browse items from verified students on your campus. New posts appear here in
          real time.
        </p>
      </motion.div>

      {/* Search + suggestions */}
      <div className="mt-8">
        <div className="relative max-w-xl" ref={searchWrapRef}>
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSuggestOpen(true);
              setHighlight(-1);
            }}
            onFocus={() => setSuggestOpen(true)}
            onKeyDown={onSearchKeyDown}
            placeholder="Search listings, sellers, categories..."
            data-testid="dashboard-search-input"
            role="combobox"
            aria-expanded={suggestOpen && suggestions.length > 0}
            aria-autocomplete="list"
            className="w-full bg-white border border-gray-200 rounded-full pl-11 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 focus:border-[#FF5A1F] transition-all"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setSuggestOpen(false);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              aria-label="Clear search"
              data-testid="dashboard-search-clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {suggestOpen && suggestions.length > 0 && (
            <div
              className="absolute z-30 mt-2 w-full bg-white rounded-2xl border border-gray-100 shadow-[0_12px_32px_rgba(0,0,0,0.08)] overflow-hidden"
              data-testid="search-suggestions"
              role="listbox"
            >
              {suggestions.map((sug, i) => {
                const Icon = SUG_ICON[sug.kind] || Package;
                return (
                  <button
                    key={`${sug.kind}-${sug.id}`}
                    onClick={() => applySuggestion(sug)}
                    onMouseEnter={() => setHighlight(i)}
                    role="option"
                    aria-selected={highlight === i}
                    data-testid={`suggestion-${sug.kind}-${sug.id}`}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      highlight === i ? "bg-orange-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="flex-1 min-w-0 truncate text-gray-900">{sug.label}</span>
                    <span className="text-[11px] text-gray-400 shrink-0 uppercase tracking-wider">
                      {sug.kind === "listing" && sug.price != null
                        ? `€${Number(sug.price).toLocaleString()}`
                        : sug.kind}
                    </span>
                    {highlight === i && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Type pills (campus services) */}
        {types.length > 1 && (
          <div className="flex gap-2 mt-5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            <FilterPill active={activeType === "all"} onClick={() => setActiveType("all")} testId="type-pill-all">
              All types
            </FilterPill>
            {types.map((t) => {
              const Icon = t.icon;
              return (
                <FilterPill
                  key={t.id}
                  active={activeType === t.id}
                  onClick={() => setActiveType(t.id)}
                  testId={`type-pill-${t.id}`}
                >
                  <Icon className="w-3.5 h-3.5" /> {t.label}
                </FilterPill>
              );
            })}
          </div>
        )}

        {/* Category pills */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
          <FilterPill
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            testId="category-pill-all"
          >
            All
          </FilterPill>
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <FilterPill
                key={c.id}
                active={activeCategory === c.id}
                onClick={() => setActiveCategory(c.id)}
                testId={`category-pill-${c.id}`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {c.name || c.label}
              </FilterPill>
            );
          })}
        </div>

        {/* Location filter */}
        <div className="mt-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={activeLocation}
            onChange={(e) => setActiveLocation(e.target.value)}
            data-testid="location-filter"
            className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 focus:border-[#FF5A1F] transition-all appearance-none pr-8"
          >
            <option value="all">All locations</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          {activeLocation !== "all" && (
            <button
              onClick={() => setActiveLocation("all")}
              className="text-xs text-gray-400 hover:text-gray-700"
              data-testid="location-filter-clear"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Trending + Discover — shown only on the unfiltered homepage */}
      {!loading && !loadError && noFiltersActive && trending.length >= 2 && (
        <Section
          icon={Flame}
          title="Trending now"
          subtitle="What students are viewing, saving, and bidding on."
          testId="trending-section"
        >
          {trending.map((l, i) => (
            <ListingCard key={l.id} listing={l} index={i} />
          ))}
        </Section>
      )}
      {!loading && !loadError && noFiltersActive && discover.length >= 2 && (
        <Section
          icon={Compass}
          title="Discover today"
          subtitle="Fresh picks for you — updated every day."
          testId="discover-section"
        >
          {discover.map((l, i) => (
            <ListingCard key={l.id} listing={l} index={i} />
          ))}
        </Section>
      )}

      {/* Grid */}
      <div className="mt-10">
        {noFiltersActive && !loading && !loadError && listings.length > 0 && (
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 mb-5">
            Latest listings
          </h2>
        )}
        {loading ? (
          <ListingSkeletonGrid />
        ) : loadError ? (
          <ErrorState
            title="Couldn't load listings"
            onRetry={() => setRetryKey((k) => k + 1)}
          />
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
            {[...filtered]
              .sort((a, b) => Number(b.featured) - Number(a.featured))
              .map((l, i) => (
                <ListingCard key={l.id} listing={l} index={i} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

const Section = ({ icon: Icon, title, subtitle, children, testId }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="mt-12"
    data-testid={testId}
  >
    <div className="flex items-center gap-2">
      <span className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
        <Icon className="w-4 h-4 text-[#FF5A1F]" />
      </span>
      <h2 className="text-xl font-semibold tracking-tight text-gray-900">{title}</h2>
    </div>
    <p className="text-sm text-gray-500 mt-1 ml-10">{subtitle}</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-5">{children}</div>
  </motion.div>
);

const FilterPill = ({ children, active, onClick, testId }) => (
  <button
    onClick={onClick}
    data-testid={testId}
    className={`inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${
      active
        ? "bg-[#0A0A0A] text-white border-[#0A0A0A] dark:bg-[#FF5A1F] dark:border-[#FF5A1F]"
        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
    }`}
  >
    {children}
  </button>
);
