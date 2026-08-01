import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { useFollowing } from "../hooks/useSocial";
import {
  followSeller,
  unfollowSeller,
  recordProfileView,
} from "../services/socialService";
import { responseMetrics } from "../services/offersService";
import { checkAchievements } from "../services/achievementsService";
import { friendlyError } from "../lib/errors";
import { ListingCard } from "../components/ListingCard";
import { ListingSkeletonGrid } from "../components/ListingSkeleton";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import {
  BadgeCheck,
  UserPlus,
  UserCheck,
  Share2,
  Loader2,
  Eye,
  Users,
  Package2,
  Clock,
  MessagesSquare,
  Star,
} from "lucide-react";
import { toast } from "sonner";

export default function SellerProfile() {
  const { uid } = useParams();
  const { user, profile: myProfile } = useAuth();
  const { followingIds } = useFollowing();
  const [seller, setSeller] = useState(undefined); // undefined = loading
  const [listings, setListings] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [tab, setTab] = useState("active");
  const isMe = user?.uid === uid;

  useEffect(() => {
    setSeller(undefined);
    setLoadError(false);
    const unsub = onSnapshot(
      doc(db, "users", uid),
      (snap) => setSeller(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      () => setLoadError(true)
    );
    return () => unsub();
  }, [uid]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "listings"), where("ownerId", "==", uid)),
      (snap) => {
        const arr = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setListings(arr);
      },
      () => setListings([])
    );
    return () => unsub();
  }, [uid]);

  useEffect(() => {
    return onSnapshot(
      query(collection(db, "userAchievements"), where("uid", "==", uid)),
      (snap) =>
        setAchievements(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (a.unlockedAt?.toMillis?.() ?? 0) - (b.unlockedAt?.toMillis?.() ?? 0))
        ),
      () => {}
    );
  }, [uid]);

  // Unique profile views — never counted for your own profile.
  useEffect(() => {
    if (uid && user?.uid) recordProfileView(uid, user.uid);
  }, [uid, user?.uid]);

  // Visiting your own profile re-checks achievements against real metrics.
  useEffect(() => {
    if (isMe && myProfile && listings) checkAchievements(user, myProfile, listings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMe, myProfile?.followersCount, listings?.length]);

  const isFollowing = followingIds.has(uid);

  const stats = useMemo(() => {
    const all = listings || [];
    const visible = all.filter((l) => !l.hidden);
    return {
      active: visible.filter((l) => !l.sold),
      sold: visible.filter((l) => l.sold),
      totalListingViews: all.reduce((n, l) => n + (Number(l.views) || 0), 0),
    };
  }, [listings]);

  const metrics = responseMetrics(seller);

  const toggleFollow = async () => {
    if (followBusy || !seller) return;
    setFollowBusy(true);
    try {
      if (isFollowing) {
        await unfollowSeller(user.uid, uid);
        toast.success(`Unfollowed ${seller.displayName || "seller"}`);
      } else {
        await followSeller(user, seller);
        toast.success(`Following ${seller.displayName || "seller"} — you'll be notified about new listings`);
      }
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setFollowBusy(false);
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/seller/${uid}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: seller?.displayName || "Seller profile", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Profile link copied to clipboard");
      }
    } catch (e) {
      if (e?.name !== "AbortError") toast.error("Couldn't share the profile link");
    }
  };

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto px-6">
        <ErrorState title="Couldn't load this profile" onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (seller === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF5A1F]" />
      </div>
    );
  }

  if (seller === null) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Profile not found</h2>
        <p className="text-gray-500 mt-2">This account may have been deleted.</p>
        <Link to="/" className="inline-block mt-6 text-[#FF5A1F] font-medium hover:text-[#E04812]">
          Back to marketplace
        </Link>
      </div>
    );
  }

  const memberSince =
    seller.createdAt?.toDate?.()?.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    }) || "—";
  const shown = tab === "active" ? stats.active : stats.sold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
    >
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-[#0A0A0A] text-white font-semibold text-2xl flex items-center justify-center overflow-hidden shrink-0">
            {seller.photoURL ? (
              <img src={seller.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              (seller.displayName || seller.email || "S").slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1
                className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900"
                data-testid="profile-name"
              >
                {seller.displayName || "Student"}
              </h1>
              <span
                className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-[#FF5A1F] bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full"
                data-testid="profile-verified-badge"
              >
                <BadgeCheck className="w-3.5 h-3.5" /> Verified student
              </span>
            </div>
            {seller.bio && (
              <p className="text-gray-600 mt-2 leading-relaxed max-w-xl whitespace-pre-wrap" data-testid="profile-bio">
                {seller.bio}
              </p>
            )}
            <p className="text-sm text-gray-400 mt-2">Member since {memberSince}</p>

            {achievements.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4" data-testid="profile-achievements">
                {achievements.map((a) => (
                  <span
                    key={a.id}
                    title={a.name}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full"
                  >
                    <span>{a.emoji || "🏆"}</span> {a.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex sm:flex-col gap-2 shrink-0">
            {!isMe && user && (
              <button
                onClick={toggleFollow}
                disabled={followBusy}
                data-testid="profile-follow-btn"
                className={`inline-flex items-center justify-center gap-2 font-medium px-5 py-2.5 rounded-full transition-colors text-sm ${
                  isFollowing
                    ? "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50"
                    : "bg-[#FF5A1F] hover:bg-[#E04812] text-white shadow-[0_8px_24px_rgba(255,90,31,0.25)]"
                }`}
              >
                {followBusy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4" /> Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Follow
                  </>
                )}
              </button>
            )}
            {isMe && (
              <Link
                to="/account"
                className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-900 font-medium px-5 py-2.5 rounded-full hover:bg-gray-50 transition-colors text-sm"
                data-testid="profile-edit-link"
              >
                Edit profile
              </Link>
            )}
            <button
              onClick={share}
              data-testid="profile-share-btn"
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-full hover:bg-gray-50 transition-colors text-sm"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-7 pt-6 border-t border-gray-100">
          <Stat icon={Package2} label="Active" value={stats.active.length} testId="profile-stat-active" />
          <Stat icon={Star} label="Sold" value={stats.sold.length} testId="profile-stat-sold" />
          <Stat icon={Users} label="Followers" value={Number(seller.followersCount) || 0} testId="profile-stat-followers" />
          <Stat icon={Eye} label="Profile views" value={Number(seller.profileViews) || 0} testId="profile-stat-views" />
          <Stat
            icon={MessagesSquare}
            label="Response rate"
            value={metrics.rate === null ? "—" : `${metrics.rate}%`}
            hint={metrics.rate === null ? "No offers yet" : `${metrics.responded} of ${metrics.received} offers`}
            testId="profile-stat-response-rate"
          />
          <Stat
            icon={Clock}
            label="Responds in"
            value={metrics.avgLabel || "—"}
            hint={metrics.avgLabel ? "average" : "No offers yet"}
            testId="profile-stat-response-time"
          />
        </div>
        <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" /> {stats.totalListingViews.toLocaleString()} total listing views
        </p>
      </div>

      {/* Listings */}
      <div className="mt-10">
        <div className="flex gap-2">
          {[
            ["active", `Active listings (${stats.active.length})`],
            ["sold", `Sold (${stats.sold.length})`],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              data-testid={`profile-tab-${id}`}
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

        <div className="mt-6">
          {listings === null ? (
            <ListingSkeletonGrid count={4} />
          ) : shown.length === 0 ? (
            <EmptyState
              title={tab === "active" ? "No active listings" : "Nothing sold yet"}
              subtitle={
                tab === "active"
                  ? "This seller doesn't have any listings for sale right now."
                  : "Sold items will appear here."
              }
              showCta={false}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="profile-listings-grid">
              {shown.map((l, i) => (
                <ListingCard key={l.id} listing={l} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const Stat = ({ icon: Icon, label, value, hint, testId }) => (
  <div className="bg-gray-50 rounded-xl border border-gray-100 p-4" data-testid={testId}>
    <div className="flex items-center gap-1.5 text-gray-400">
      <Icon className="w-3.5 h-3.5" />
      <p className="text-[10px] uppercase tracking-wider font-semibold">{label}</p>
    </div>
    <p className="text-xl font-semibold text-gray-900 mt-1.5">{value}</p>
    {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
  </div>
);
