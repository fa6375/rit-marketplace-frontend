import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { collection, documentId, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { useSaves } from "../hooks/useSocial";
import {
  createWishlistCollection,
  deleteWishlistCollection,
  DEFAULT_COLLECTION,
} from "../services/socialService";
import { friendlyError } from "../lib/errors";
import { ListingCard } from "../components/ListingCard";
import { ListingSkeletonGrid } from "../components/ListingSkeleton";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { FolderPlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
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

export default function SavedListings() {
  const { user } = useAuth();
  const { saves, collections, customCollections, loading, error } = useSaves();
  const [activeCollection, setActiveCollection] = useState(DEFAULT_COLLECTION.id);
  const [listingMap, setListingMap] = useState({});
  const [fetching, setFetching] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Load the listing documents behind the saves in batches of 10 (Firestore
  // `in` limit); missing docs (deleted listings) are shown as removed.
  useEffect(() => {
    const ids = [...new Set(saves.map((s) => s.listingId))].filter(
      (id) => !(id in listingMap)
    );
    if (!ids.length) return;
    let cancelled = false;
    (async () => {
      setFetching(true);
      try {
        const found = {};
        for (let i = 0; i < ids.length; i += 10) {
          const chunk = ids.slice(i, i + 10);
          const snap = await getDocs(
            query(collection(db, "listings"), where(documentId(), "in", chunk))
          );
          snap.docs.forEach((d) => (found[d.id] = { id: d.id, ...d.data() }));
          chunk.forEach((id) => {
            if (!(id in found)) found[id] = null; // listing was deleted
          });
        }
        if (!cancelled) setListingMap((m) => ({ ...m, ...found }));
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saves]);

  // If the active collection was deleted, fall back to the default.
  useEffect(() => {
    if (!collections.some((c) => c.id === activeCollection)) {
      setActiveCollection(DEFAULT_COLLECTION.id);
    }
  }, [collections, activeCollection]);

  const inCollection = useMemo(
    () => saves.filter((s) => (s.collectionId || DEFAULT_COLLECTION.id) === activeCollection),
    [saves, activeCollection]
  );
  const items = inCollection
    .map((s) => listingMap[s.listingId])
    .filter((l) => l); // hide deleted listings
  const removedCount = inCollection.filter((s) => listingMap[s.listingId] === null).length;

  const addCollection = async (e) => {
    e.preventDefault();
    if (creating || !newName.trim()) return;
    setCreating(true);
    try {
      const c = await createWishlistCollection(user.uid, newName);
      setNewName("");
      setActiveCollection(c.id);
      toast.success(`Collection "${c.name}" created`);
    } catch (err) {
      toast.error(
        err?.code === "already-exists"
          ? "You already have a collection with that name."
          : friendlyError(err)
      );
    } finally {
      setCreating(false);
    }
  };

  const removeCollection = async (c) => {
    setDeletingId(c.id);
    try {
      await deleteWishlistCollection(user.uid, c.id);
      toast.success(`Collection deleted — its listings moved to ${DEFAULT_COLLECTION.name}`);
      setActiveCollection(DEFAULT_COLLECTION.id);
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setDeletingId(null);
    }
  };

  const activeCustom = customCollections.find((c) => c.id === activeCollection);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#FF5A1F]">
          Your account
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 mt-2 leading-none">
          Saved listings
        </h1>
        <p className="text-gray-500 mt-3 leading-relaxed">
          Organize listings into collections. Use the heart on any listing to save it.
        </p>
      </motion.div>

      {/* Collection tabs + create */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        {collections.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCollection(c.id)}
            data-testid={`collection-tab-${c.id}`}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              activeCollection === c.id
                ? "bg-[#0A0A0A] text-white border-[#0A0A0A] dark:bg-[#FF5A1F] dark:border-[#FF5A1F]"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {c.name}
            <span className="ml-1.5 text-xs opacity-60">
              {saves.filter((s) => (s.collectionId || DEFAULT_COLLECTION.id) === c.id).length}
            </span>
          </button>
        ))}
        <form onSubmit={addCollection} className="flex items-center gap-1.5">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={40}
            placeholder="New collection…"
            data-testid="new-collection-input"
            className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 focus:border-[#FF5A1F] transition-all"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            aria-label="Create collection"
            data-testid="new-collection-btn"
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#FF5A1F] hover:bg-orange-50 disabled:opacity-40 transition-colors"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
          </button>
        </form>
        {activeCustom && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                data-testid="delete-collection-btn"
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-600 transition-colors ml-1"
                disabled={deletingId === activeCustom.id}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete collection
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{activeCustom.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  Saved listings in this collection will be moved to your{" "}
                  {DEFAULT_COLLECTION.name} — nothing will be unsaved.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => removeCollection(activeCustom)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="mt-8">
        {error ? (
          <ErrorState title="Couldn't load your saved listings" onRetry={() => window.location.reload()} />
        ) : loading || (fetching && !items.length) ? (
          <ListingSkeletonGrid count={4} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Nothing saved here yet"
            subtitle="Tap the heart on any listing to add it to this collection."
            ctaLabel="Browse listings"
            ctaTo="/"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="saved-grid">
              {items.map((l, i) => (
                <ListingCard key={l.id} listing={l} index={i} />
              ))}
            </div>
            {removedCount > 0 && (
              <p className="text-xs text-gray-400 mt-6">
                {removedCount} saved {removedCount === 1 ? "listing is" : "listings are"} no
                longer available and {removedCount === 1 ? "was" : "were"} hidden.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
