import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { ref as storageRef, deleteObject } from "firebase/storage";
import { db, storage } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { friendlyError } from "../lib/errors";
import { ErrorState } from "../components/ErrorState";
import { ListingSkeletonGrid } from "../components/ListingSkeleton";
import {
  Search,
  X,
  Plus,
  MapPin,
  CalendarDays,
  Phone,
  Mail,
  ImageOff,
  CheckCircle2,
  Trash2,
  SearchCheck,
} from "lucide-react";
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

export default function LostFound() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("missing");

  useEffect(() => {
    setError(false);
    setItems(null);
    const unsub = onSnapshot(
      query(collection(db, "lostItems")),
      (snap) =>
        setItems(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
        ),
      () => setError(true)
    );
    return () => unsub();
  }, [retryKey]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (items || []).filter((it) => {
      if (it.hidden) return false;
      if (statusFilter !== "all" && (it.status || "missing") !== statusFilter) return false;
      if (!s) return true;
      return (
        it.title?.toLowerCase().includes(s) ||
        it.description?.toLowerCase().includes(s) ||
        it.lastSeenLocation?.toLowerCase().includes(s)
      );
    });
  }, [items, search, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#FF5A1F]">
          Lost &amp; Found
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 mt-2 leading-none">
              Help items find their way home.
            </h1>
            <p className="text-gray-500 mt-3 max-w-xl leading-relaxed">
              Lost something on campus? Post it here. Found something? Search below and
              reach out to the owner.
            </p>
          </div>
          <Link to="/lost-found/new" data-testid="lostfound-create-link">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 bg-[#FF5A1F] hover:bg-[#E04812] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors shadow-[0_8px_24px_rgba(255,90,31,0.25)]"
            >
              <Plus className="w-4 h-4" /> Report a lost item
            </motion.button>
          </Link>
        </div>
      </motion.div>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative max-w-xl flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lost items — wallet, laptop, keys…"
            data-testid="lostfound-search-input"
            className="w-full bg-white border border-gray-200 rounded-full pl-11 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 focus:border-[#FF5A1F] transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {[
            ["missing", "Still missing"],
            ["found", "Found"],
            ["all", "All"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setStatusFilter(id)}
              data-testid={`lostfound-filter-${id}`}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                statusFilter === id
                  ? "bg-[#0A0A0A] text-white border-[#0A0A0A] dark:bg-[#FF5A1F] dark:border-[#FF5A1F]"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10">
        {error ? (
          <ErrorState title="Couldn't load Lost & Found" onRetry={() => setRetryKey((k) => k + 1)} />
        ) : items === null ? (
          <ListingSkeletonGrid count={4} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center px-6">
            <div className="w-14 h-14 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mb-4">
              <SearchCheck className="w-6 h-6 text-[#FF5A1F]" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
              {statusFilter === "found" ? "No recovered items yet" : "Nothing reported here"}
            </h2>
            <p className="text-gray-500 mt-2 max-w-md leading-relaxed">
              {statusFilter === "missing"
                ? "Great news — no one is missing anything right now. If you've lost something, report it above."
                : "Try a different search or status filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="lostfound-grid">
            {filtered.map((item, i) => (
              <LostItemCard key={item.id} item={item} index={i} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LostItemCard({ item, index, user }) {
  const [busy, setBusy] = useState(false);
  const isOwner = user?.uid === item.ownerId;
  const found = (item.status || "missing") === "found";
  const dateLost = item.dateLost || "";

  const markFound = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // Marking as found archives the post automatically — it moves to the
      // "Found" filter but stays fully searchable.
      await updateDoc(doc(db, "lostItems", item.id), {
        status: "found",
        foundAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Marked as found — so glad it made it back! 🎉");
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      if (item.imagePath) {
        try {
          await deleteObject(storageRef(storage, item.imagePath));
        } catch (e) {}
      }
      await deleteDoc(doc(db, "lostItems", item.id));
      toast.success("Post deleted");
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
      className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col"
      data-testid={`lostfound-card-${item.id}`}
    >
      <div className="aspect-[4/3] bg-gray-100 relative">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageOff className="w-10 h-10" />
          </div>
        )}
        <span
          className={`absolute top-3 left-3 text-[10px] uppercase tracking-[0.18em] font-semibold px-2.5 py-1 rounded-full border backdrop-blur ${
            found
              ? "bg-emerald-50/95 border-emerald-100 text-emerald-700"
              : "bg-white/95 border-orange-100 text-[#FF5A1F]"
          }`}
        >
          {found ? "Found" : "Still missing"}
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 tracking-tight line-clamp-1">{item.title}</h3>
        <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed flex-1">
          {item.description}
        </p>
        <div className="mt-3 space-y-1 text-xs text-gray-400">
          {item.lastSeenLocation && (
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" /> Last seen: {item.lastSeenLocation}
            </p>
          )}
          {dateLost && (
            <p className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 shrink-0" /> Lost on {dateLost}
            </p>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          {!found && item.phone && (
            <a
              href={`tel:${item.phone}`}
              data-testid={`lostfound-call-${item.id}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#FF5A1F] hover:bg-[#E04812] text-white text-xs font-medium py-2.5 rounded-full transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> Call owner
            </a>
          )}
          {!found && !item.phone && item.contactMethod && (
            <span
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-700 text-xs font-medium py-2.5 rounded-full break-all px-3"
              data-testid={`lostfound-contact-${item.id}`}
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{item.contactMethod}</span>
            </span>
          )}
          {isOwner && !found && (
            <button
              onClick={markFound}
              disabled={busy}
              data-testid={`lostfound-markfound-${item.id}`}
              className="inline-flex items-center justify-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs font-medium py-2.5 px-3.5 rounded-full transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Found it
            </button>
          )}
          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  aria-label="Delete post"
                  data-testid={`lostfound-delete-${item.id}`}
                  className="w-9 h-9 shrink-0 rounded-full bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                  disabled={busy}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The post and its photo will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={remove} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </motion.div>
  );
}
