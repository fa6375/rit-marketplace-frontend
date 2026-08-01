import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { DEFAULT_COLLECTION } from "../services/socialService";
import { DEFAULT_LOCATIONS } from "../lib/listingTypes";

const sortByCreated = (a, b) =>
  (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);

/** Admin-managed pickup locations with a sensible fallback. */
export function useLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromFirestore, setFromFirestore] = useState(false);
  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "locations"), orderBy("order")),
        (snap) => {
          const values = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setFromFirestore(values.length > 0);
          setLocations(
            values.length
              ? values
              : DEFAULT_LOCATIONS.map((name, order) => ({
                  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                  name,
                  order,
                }))
          );
          setLoading(false);
        },
        () => {
          setFromFirestore(false);
          setLocations(
            DEFAULT_LOCATIONS.map((name, order) => ({
              id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              name,
              order,
            }))
          );
          setLoading(false);
        }
      ),
    []
  );
  return { locations, loading, fromFirestore };
}

/** The signed-in user's saved listings and wishlist collections, live. */
export function useSaves() {
  const { user } = useAuth();
  const [saves, setSaves] = useState([]);
  const [customCollections, setCustomCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      setSaves([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      query(collection(db, "saves"), where("uid", "==", user.uid)),
      (snap) => {
        setSaves(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(sortByCreated));
        setError(null);
        setLoading(false);
      },
      (e) => {
        setError(e);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setCustomCollections([]);
      return;
    }
    return onSnapshot(
      query(collection(db, "wishlistCollections"), where("ownerId", "==", user.uid)),
      (snap) =>
        setCustomCollections(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0))
        ),
      () => {}
    );
  }, [user?.uid]);

  const collections = useMemo(
    () => [DEFAULT_COLLECTION, ...customCollections.map((c) => ({ id: c.id, name: c.name }))],
    [customCollections]
  );
  const savedIds = useMemo(() => new Set(saves.map((s) => s.listingId)), [saves]);
  const saveFor = useMemo(() => {
    const m = new Map();
    saves.forEach((s) => m.set(s.listingId, s));
    return m;
  }, [saves]);

  return { saves, savedIds, saveFor, collections, customCollections, loading, error };
}

/** Live notifications for the signed-in user. */
export function useNotifications() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user?.uid) {
      setItems([]);
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(
      query(collection(db, "notifications"), where("userId", "==", user.uid)),
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(sortByCreated).slice(0, 60));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [user?.uid]);
  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);
  return { notifications: items, unread, loading };
}

/** Sellers the signed-in user follows, live. */
export function useFollowing() {
  const { user } = useAuth();
  const [following, setFollowing] = useState([]);
  useEffect(() => {
    if (!user?.uid) {
      setFollowing([]);
      return;
    }
    return onSnapshot(
      query(collection(db, "follows"), where("followerId", "==", user.uid)),
      (snap) => setFollowing(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => {}
    );
  }, [user?.uid]);
  const followingIds = useMemo(() => new Set(following.map((f) => f.sellerId)), [following]);
  return { following, followingIds };
}
