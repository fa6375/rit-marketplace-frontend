import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { ListingCard } from "../components/ListingCard";
import { EmptyState } from "../components/EmptyState";
import { ListingSkeletonGrid } from "../components/ListingSkeleton";
import { motion } from "framer-motion";

export default function MyListings() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // Avoid composite index requirement: filter by ownerId only, sort client-side
    const q = query(
      collection(db, "listings"),
      where("ownerId", "==", user.uid),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        arr.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });
        setItems(arr);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#FF5A1F]">
          Your account
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 mt-2 leading-none">
          My listings
        </h1>
        <p className="text-gray-500 mt-3 leading-relaxed">
          Manage everything you've posted.
        </p>
      </motion.div>

      <div className="mt-10">
        {loading ? (
          <ListingSkeletonGrid count={4} />
        ) : items.length === 0 ? (
          <EmptyState
            title="You haven't posted anything yet"
            subtitle="Your listings will show up here once you publish them."
            ctaLabel="Create your first listing"
          />
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            data-testid="my-listings-grid"
          >
            {items.map((l, i) => (
              <ListingCard key={l.id} listing={l} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
