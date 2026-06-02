import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
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
import { CATEGORIES } from "../lib/categories";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

export default function CreateListing({ editMode = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [contact, setContact] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [existingImagePath, setExistingImagePath] = useState(null);
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
        setTitle(data.title || "");
        setDescription(data.description || "");
        setPrice(String(data.price ?? ""));
        setCategory(data.category || CATEGORIES[0].id);
        setContact(data.contact || "");
        setExistingImage(data.imageUrl || null);
        setExistingImagePath(data.imagePath || null);
      } catch (e) {
        toast.error("Failed to load listing");
      } finally {
        setLoadingDoc(false);
      }
    })();
  }, [editMode, id, user, navigate]);

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

    setBusy(true);
    try {
      let imageUrl = existingImage;
      let imagePath = existingImagePath;

      if (image && typeof image !== "string") {
        // Delete old image if exists when editing
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

      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        category,
        contact: contact.trim(),
        imageUrl,
        imagePath,
        ownerId: user.uid,
        ownerEmail: user.email,
        ownerName: user.displayName || user.email?.split("@")[0] || "Student",
        updatedAt: serverTimestamp(),
      };

      if (editMode && id) {
        await updateDoc(doc(db, "listings", id), payload);
        toast.success("Listing updated");
        navigate(`/listing/${id}`);
      } else {
        const docRef = await addDoc(collection(db, "listings"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success("Listing posted");
        navigate(`/listing/${docRef.id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to save listing");
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
          Add a clear photo, a short title and the price. Listings appear
          instantly for everyone.
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
          <Field label="Price (USD)" required>
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

        <Field label="Category" required>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            data-testid="create-category-select"
            className={`${inputCls} appearance-none`}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
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
