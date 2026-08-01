import { useState } from "react";
import { Heart, FolderPlus, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useSaves } from "../hooks/useSocial";
import {
  createWishlistCollection,
  moveSave,
  saveListing,
  unsaveListing,
} from "../services/socialService";
import { friendlyError } from "../lib/errors";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

/**
 * SaveButton — heart toggle with a wishlist-collection picker.
 * `variant="card"` renders the floating circular button used on listing
 * cards; `variant="full"` renders the wide pill used on the details page.
 */
export function SaveButton({ listing, variant = "card" }) {
  const { user } = useAuth();
  const { savedIds, saveFor, collections } = useSaves();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  if (!user || user.uid === listing.ownerId) return null;
  const saved = savedIds.has(listing.id);
  const currentCollection = saveFor.get(listing.id)?.collectionId;

  const quickToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      if (saved) {
        await unsaveListing(user.uid, listing.id);
        toast.success("Removed from your wishlist");
      } else {
        await saveListing(user, listing);
        toast.success("Saved to Wishlist");
      }
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const pick = async (collectionId, name) => {
    if (busy) return;
    setBusy(true);
    try {
      if (saved) {
        await moveSave(user.uid, listing.id, collectionId);
        toast.success(`Moved to ${name}`);
      } else {
        await saveListing(user, listing, collectionId);
        toast.success(`Saved to ${name}`);
      }
      setOpen(false);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const addCollection = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (creating || !newName.trim()) return;
    setCreating(true);
    try {
      const c = await createWishlistCollection(user.uid, newName);
      setNewName("");
      await pick(c.id, c.name);
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

  const picker = (
    <PopoverContent
      align={variant === "card" ? "end" : "center"}
      className="w-64 rounded-xl border border-gray-200 p-2"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      data-testid="save-collection-picker"
    >
      <p className="px-2 pt-1 pb-2 text-[10px] uppercase tracking-[0.18em] font-semibold text-gray-400">
        Save to collection
      </p>
      <div className="max-h-52 overflow-y-auto">
        {collections.map((c) => (
          <button
            key={c.id}
            onClick={() => pick(c.id, c.name)}
            disabled={busy}
            data-testid={`save-collection-${c.id}`}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <span className="truncate">{c.name}</span>
            {saved && currentCollection === c.id && (
              <Check className="w-4 h-4 text-[#FF5A1F] shrink-0" />
            )}
          </button>
        ))}
      </div>
      <form onSubmit={addCollection} className="mt-1 flex items-center gap-1.5 border-t border-gray-100 pt-2 px-1">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          maxLength={40}
          placeholder="New collection…"
          data-testid="save-new-collection-input"
          className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 focus:border-[#FF5A1F]"
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          aria-label="Create collection"
          className="p-1.5 rounded-lg text-[#FF5A1F] hover:bg-orange-50 disabled:opacity-40 transition-colors"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
        </button>
      </form>
      {saved && (
        <button
          onClick={quickToggle}
          className="mt-1 w-full text-center text-xs text-red-500 hover:text-red-600 py-1.5"
        >
          Remove from wishlist
        </button>
      )}
    </PopoverContent>
  );

  if (variant === "full") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            data-testid="details-save-btn"
            className={`flex-1 inline-flex items-center justify-center gap-2 font-medium py-3 rounded-full transition-colors border text-sm ${
              saved
                ? "bg-orange-50 border-orange-100 text-[#FF5A1F]"
                : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Heart className={`w-4 h-4 ${saved ? "fill-[#FF5A1F]" : ""}`} />
            {saved ? "Saved" : "Save"}
          </button>
        </PopoverTrigger>
        {picker}
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          aria-label={saved ? "Manage saved listing" : "Save listing"}
          data-testid={`save-btn-${listing.id}`}
          data-tour="save-listing"
          className={`w-8 h-8 rounded-full backdrop-blur flex items-center justify-center border transition-all ${
            saved
              ? "bg-white/95 border-orange-200 text-[#FF5A1F]"
              : "bg-white/90 border-gray-200 text-gray-500 hover:text-[#FF5A1F]"
          }`}
        >
          {busy ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Heart className={`w-4 h-4 ${saved ? "fill-[#FF5A1F]" : ""}`} />
          )}
        </button>
      </PopoverTrigger>
      {picker}
    </Popover>
  );
}
