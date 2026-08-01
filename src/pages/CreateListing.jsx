import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit as qLimit,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { DragDropImage } from "../components/DragDropImage";
import { useCategories } from "../hooks/useCategories";
import { useLocations } from "../hooks/useSocial";
import { useSettings } from "../context/SettingsContext";
import { enabledTypes, CONDITIONS } from "../lib/listingTypes";
import { getFollowerIds } from "../services/socialService";
import { notifyMany } from "../services/notificationsService";
import { friendlyError } from "../lib/errors";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const PRICE_HISTORY_CAP = 20;

export default function CreateListing({ editMode = false }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { categories } = useCategories();
  const { locations } = useLocations();
  const settings = useSettings();
  const { maximumUploadSize, maximumListingsPerUser } = settings;
  const types = enabledTypes(settings);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("product");
  const [condition, setCondition] = useState("good");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [existingImagePath, setExistingImagePath] = useState(null);
  const [existing, setExisting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(editMode);

  useEffect(() => {
    if (!editMode || !id) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "listings", id));
        if (!snap.exists()) {
          toast.error("Listing not found");
          navigate("/");
          return;
        }
        const data = snap.data();
        if (data.ownerId !== user?.uid) {
          toast.error("You can only edit your own listings");
          navigate("/");
          return;
        }
        setExisting(data);
        setTitle(data.title || "");
        setDescription(data.description || "");
        setPrice(String(data.price ?? ""));
        setCategory(data.category || "");
        setType(data.type || "product");
        setCondition(data.condition || "good");
        setLocation(data.location || "");
        setContact(data.contact || "");
        setExistingImage(data.imageUrl || null);
        setExistingImagePath(data.imagePath || null);
      } catch (e) {
        toast.error(friendlyError(e));
      } finally {
        setLoadingDoc(false);
      }
    })();
  }, [editMode, id, user, navigate]);

  useEffect(() => {
    if (!category && categories.length) setCategory(categories[0].id);
  }, [categories, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!title.trim() || !description.trim() || !price || !contact.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      toast.error("Enter a valid price");
      return;
    }
    if (!editMode && !image) {
      toast.error("Please add an image");
      return;
    }
    if (image && typeof image !== "string" && image.size > maximumUploadSize * 1024 * 1024) {
      toast.error(`Image is too large. Maximum upload size is ${maximumUploadSize} MB.`);
      return;
    }

    setBusy(true);
    try {
      if (!editMode) {
        const mine = await getDocs(
          query(collection(db, "listings"), where("ownerId", "==", user.uid))
        );
        if (mine.size >= maximumListingsPerUser) {
          toast.error(
            `You've reached the limit of ${maximumListingsPerUser} listings. Delete an old listing to post a new one.`
          );
          setBusy(false);
          return;
        }
      }

      let imageUrl = existingImage;
      let imagePath = existingImagePath;

      if (image && typeof image !== "string") {
        if (editMode && existingImagePath) {
          try {
            await deleteObject(storageRef(storage, existingImagePath));
          } catch (e) {}
        }
        const path = `listings/${user.uid}/${Date.now()}_${image.name}`;
        const sref = storageRef(storage, path);
        await uploadBytes(sref, image);
        imageUrl = await getDownloadURL(sref);
        imagePath = path;
      }

      const locationName = locations.find((l) => l.id === location)?.name || "";
      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        category,
        type,
        condition: type === "product" ? condition : null,
        location: location || null,
        locationName: location ? locationName : "",
        contact: contact.trim(),
        imageUrl,
        imagePath,
        ...(image && typeof image !== "string" ? { imageSize: image.size } : {}),
        ownerId: user.uid,
        ownerEmail: user.email,
        ownerName: user.displayName || user.email?.split("@")[0] || "Student",
        ownerPhotoURL: profile?.photoURL || user.photoURL || "",
        updatedAt: serverTimestamp(),
      };

      if (editMode && id) {
        // Track every legitimate price change in the listing's history.
        const oldPrice = Number(existing?.price);
        if (Number.isFinite(oldPrice) && oldPrice !== priceNum) {
          const history = Array.isArray(existing?.priceHistory) ? existing.priceHistory : [];
          payload.priceHistory = [...history, { price: priceNum, at: Timestamp.now() }].slice(
            -PRICE_HISTORY_CAP
          );
          payload.originalPrice = Number(existing?.originalPrice) || oldPrice;
        }
        await updateDoc(doc(db, "listings", id), payload);
        // Alert everyone who saved this listing when the price drops.
        if (Number.isFinite(oldPrice) && priceNum < oldPrice) {
          try {
            const saversSnap = await getDocs(
              query(collection(db, "saves"), where("listingId", "==", id), qLimit(500))
            );
            const savers = saversSnap.docs.map((d) => d.data().uid).filter((u) => u !== user.uid);
            await notifyMany(savers, {
              type: "price-drop",
              title: "Price drop on a saved listing",
              body: `"${payload.title}" dropped from €${oldPrice.toLocaleString()} to €${priceNum.toLocaleString()}.`,
              link: `/listing/${id}`,
            });
          } catch (e) {}
        }
        toast.success("Listing updated");
        navigate(`/listing/${id}`);
      } else {
        const docRef = await addDoc(collection(db, "listings"), {
          ...payload,
          originalPrice: priceNum,
          priceHistory: [{ price: priceNum, at: Timestamp.now() }],
          views: 0,
          savesCount: 0,
          offersCount: 0,
          sold: false,
          createdAt: serverTimestamp(),
        });
        // Let followers know about the new listing.
        try {
          const followers = await getFollowerIds(user.uid);
          await notifyMany(
            followers.filter((f) => f !== user.uid),
            {
              type: "new-listing",
              title: `${payload.ownerName} posted a new listing`,
              body: `"${payload.title}" — €${priceNum.toLocaleString()}`,
              link: `/listing/${docRef.id}`,
            }
          );
        } catch (e) {}
        toast.success("Listing posted");
        navigate(`/listing/${docRef.id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  if (loadingDoc) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF5A1F]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
        data-testid="create-back-btn"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#FF5A1F]">
          {editMode ? "Edit listing" : "New listing"}
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mt-2">
          {editMode ? "Update your listing" : "Post something new"}
        </h1>
        <p className="text-gray-500 mt-2 leading-relaxed">
          Add a clear photo, a short title and the price. Listings appear instantly for
          everyone.
        </p>
      </motion.div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6"
        data-testid="create-listing-form"
      >
        <div>
          <Label>Photo</Label>
          <div className="mt-2">
            <DragDropImage
              value={image || existingImage}
              onChange={(f) => {
                setImage(f);
                if (!f) setExistingImage(null);
              }}
            />
          </div>
        </div>

        {types.length > 1 && (
          <div>
            <Label>Listing type</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {types.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    data-testid={`create-type-${t.id}`}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      type === t.id
                        ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Title" required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={80}
              placeholder="e.g. Calculus textbook (3rd ed.)"
              data-testid="create-title-input"
              className={inputCls}
            />
          </Field>
          <Field label={type === "job" ? "Pay / rate (EUR)" : "Price (EUR)"} required>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="0"
              data-testid="create-price-input"
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Category" required>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              data-testid="create-category-select"
              className={`${inputCls} appearance-none`}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.label}
                </option>
              ))}
            </select>
          </Field>
          {type === "product" ? (
            <Field label="Condition" required>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                data-testid="create-condition-select"
                className={`${inputCls} appearance-none`}
              >
                {CONDITIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <div className="hidden sm:block" />
          )}
        </div>

        <Field label="Pickup location">
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            data-testid="create-location-select"
            className={`${inputCls} appearance-none`}
          >
            <option value="">Not specified</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Description" required>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            maxLength={500}
            placeholder="Condition, details, pickup location..."
            data-testid="create-description-input"
            className={`${inputCls} resize-none`}
          />
        </Field>

        <Field label="Contact info" required>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            placeholder="Email, phone or Instagram handle"
            data-testid="create-contact-input"
            className={inputCls}
          />
        </Field>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-full border border-gray-200 bg-white text-gray-900 font-medium hover:bg-gray-50 transition-colors"
            data-testid="create-cancel-btn"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={busy}
            data-testid="create-submit-btn"
            className="inline-flex items-center justify-center gap-2 bg-[#FF5A1F] hover:bg-[#E04812] disabled:opacity-60 text-white font-medium px-7 py-3 rounded-full transition-colors shadow-[0_8px_24px_rgba(255,90,31,0.25)]"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {editMode ? "Save changes" : "Publish listing"}
          </motion.button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 focus:border-[#FF5A1F] transition-all";

const Label = ({ children }) => (
  <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
    {children}
  </label>
);

const Field = ({ label, required, children }) => (
  <div>
    <Label>
      {label}
      {required && <span className="text-[#FF5A1F] ml-0.5">*</span>}
    </Label>
    <div className="mt-1.5">{children}</div>
  </div>
);
