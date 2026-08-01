import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { responseMetrics } from "../services/offersService";
import { ErrorState } from "../components/ErrorState";
import { Eye, Heart, HandCoins, Users, UserSearch, Loader2 } from "lucide-react";

/**
 * Seller analytics — every number on this page comes from real stored
 * events: `views`, `saves`, `offers`, and `follows` documents plus live
 * counters on the user profile. Nothing is estimated or faked.
 */

const RANGES = [
  ["daily", "Daily", 14, 1],
  ["weekly", "Weekly", 12, 7],
  ["monthly", "Monthly", 12, 30],
];

const bucketize = (docs, rangeDays, buckets, bucketDays) => {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  const out = [];
  for (let i = buckets - 1; i >= 0; i--) {
    const end = new Date(now.getTime() - i * bucketDays * 86400000);
    const start = new Date(end.getTime() - bucketDays * 86400000 + 1);
    const count = docs.filter((d) => {
      const t = d.createdAt?.toMillis?.();
      return t && t >= start.getTime() && t <= end.getTime();
    }).length;
    out.push({
      name:
        bucketDays === 1
          ? end.toLocaleDateString(undefined, { month: "short", day: "numeric" })
          : bucketDays === 7
          ? `wk of ${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
          : end.toLocaleDateString(undefined, { month: "short" }),
      count,
    });
  }
  return out;
};

export default function SellerAnalytics() {
  const { user, profile } = useAuth();
  const [views, setViews] = useState(null);
  const [saves, setSaves] = useState(null);
  const [offers, setOffers] = useState(null);
  const [follows, setFollows] = useState(null);
  const [error, setError] = useState(false);
  const [range, setRange] = useState("daily");

  useEffect(() => {
    if (!user?.uid) return;
    const subs = [
      ["views", "ownerId", setViews],
      ["saves", "sellerId", setSaves],
      ["offers", "sellerId", setOffers],
      ["follows", "sellerId", setFollows],
    ].map(([coll, field, setter]) =>
      onSnapshot(
        query(collection(db, coll), where(field, "==", user.uid)),
        (snap) => setter(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
        () => setError(true)
      )
    );
    return () => subs.forEach((u) => u());
  }, [user?.uid]);

  const loading = [views, saves, offers, follows].some((x) => x === null);
  const [, , buckets, bucketDays] = RANGES.find((r) => r[0] === range);

  const charts = useMemo(() => {
    if (loading) return [];
    return [
      ["Listing views", views, "#FF5A1F", Eye],
      ["Wishlist saves", saves, "#f43f5e", Heart],
      ["Offers received", offers, "#38bdf8", HandCoins],
      ["Followers gained", follows, "#a78bfa", Users],
    ].map(([title, docs, color, icon]) => ({
      title,
      color,
      icon,
      total: docs.length,
      data: bucketize(docs, buckets * bucketDays, buckets, bucketDays),
    }));
  }, [loading, views, saves, offers, follows, buckets, bucketDays]);

  const metrics = responseMetrics(profile);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6">
        <ErrorState title="Couldn't load your analytics" onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#FF5A1F]">
          Your account
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 mt-2 leading-none">
          Seller analytics
        </h1>
        <p className="text-gray-500 mt-3 leading-relaxed">
          Real engagement with your listings and profile — nothing here is estimated.
        </p>
      </motion.div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF5A1F]" />
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8">
            <Stat icon={Eye} label="Listing views" value={views.length} />
            <Stat icon={UserSearch} label="Profile views" value={Number(profile?.profileViews) || 0} />
            <Stat icon={Heart} label="Saves" value={saves.length} />
            <Stat icon={HandCoins} label="Offers" value={offers.length} />
            <Stat icon={Users} label="Followers" value={Number(profile?.followersCount) || 0} />
            <Stat
              icon={HandCoins}
              label="Response rate"
              value={metrics.rate === null ? "—" : `${metrics.rate}%`}
              hint={metrics.avgLabel ? `~${metrics.avgLabel} avg` : "No offers yet"}
            />
          </div>

          {/* Range toggle */}
          <div className="mt-8 flex gap-2">
            {RANGES.map(([id, label]) => (
              <button
                key={id}
                onClick={() => setRange(id)}
                data-testid={`analytics-range-${id}`}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  range === id
                    ? "bg-[#0A0A0A] text-white border-[#0A0A0A] dark:bg-[#FF5A1F] dark:border-[#FF5A1F]"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2 mt-6">
            {charts.map(({ title, color, icon: Icon, data, total }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-5"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color }} /> {title}
                  </h2>
                  <span className="text-sm text-gray-400">{total.toLocaleString()} total</span>
                </div>
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id={`g-${title}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stopColor={color} stopOpacity={0.35} />
                          <stop offset="1" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: "#fff",
                          border: "1px solid #f1f5f9",
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                      />
                      <Area type="monotone" dataKey="count" stroke={color} strokeWidth={2} fill={`url(#g-${title})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const Stat = ({ icon: Icon, label, value, hint }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-4">
    <div className="flex items-center gap-1.5 text-gray-400">
      <Icon className="w-3.5 h-3.5" />
      <p className="text-[10px] uppercase tracking-wider font-semibold">{label}</p>
    </div>
    <p className="text-xl font-semibold text-gray-900 mt-1.5">{value}</p>
    {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
  </div>
);
