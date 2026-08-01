import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
import { db, storage } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { DragDropImage } from "../components/DragDropImage";
import { friendlyError } from "../lib/errors";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LostFoundCreate() {
  const { user } = useAuth();
  const { maximumUploadSize } = useSettings();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lastSeenLocation, setLastSeenLocation] = useState("");
  const [dateLost, setDateLost] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!title.trim() || !description.trim() || !lastSeenLocation.trim() || !dateLost) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!contactMethod.trim() && !phone.trim()) {
      toast.error("Add a phone number or another way to reach you");
      return;
    }
    const cleanPhone = phone.trim();
    if (cleanPhone && !/^\+?[0-9\s\-()]{6,20}$/.test(cleanPhone)) {
      toast.error("That phone number doesn't look valid");
      return;
    }
    if (image && image.size > maximumUploadSize * 1024 * 1024) {
      toast.error(`Image is too large. Maximum upload size is ${maximumUploadSize} MB.`);
      return;
    }
    setBusy(true);
    try {
      let imageUrl = "";
      let imagePath = "";
      if (image) {
        imagePath = `lost-found/${user.uid}/${Date.now()}_${image.name}`;
        const sref = storageRef(storage, imagePath);
        await uploadBytes(sref, image);
        imageUrl = await getDownloadURL(sref);
      }
      await addDoc(collection(db, "lostItems"), {
        title: title.trim(),
        description: description.trim(),
        lastSeenLocation: lastSeenLocation.trim(),
        dateLost,
        contactMethod: contactMethod.trim(),
        phone: cleanPhone,
        imageUrl,
        imagePath,
        status: "missing",
        ownerId: user.uid,
        ownerName: user.displayName || user.email?.split("@")[0] || "Student",
        ownerEmail: user.email || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Posted — fingers crossed it turns up soon 🤞");
      navigate("/lost-found");
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
        data-testid="lostfound-back-btn"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#FF5A1F]">
          Lost &amp; Found
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mt-2">
          Report a lost item
        </h1>
        <p className="text-gray-500 mt-2 leading-relaxed">
          The more detail you add, the easier it is for someone to recognize your item and
          reach you.
        </p>
      </motion.div>

      <form
        onSubmit={submit}
        className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6"
        data-testid="lostfound-create-form"
      >
        <div>
          <Label>Photo (optional)</Label>
          <div className="mt-2">
            <DragDropImage value={image} onChange={setImage} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="What did you lose?" required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={80}
              placeholder="e.g. Black leather wallet"
              data-testid="lostfound-title-input"
              className={inputCls}
            />
          </Field>
          <Field label="Date lost" required>
            <input
              type="date"
              value={dateLost}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDateLost(e.target.value)}
              required
              data-testid="lostfound-date-input"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Last seen location" required>
          <input
            type="text"
            value={lastSeenLocation}
            onChange={(e) => setLastSeenLocation(e.target.value)}
            required
            maxLength={100}
            placeholder="e.g. Library, 2nd floor study area"
            data-testid="lostfound-location-input"
            className={inputCls}
          />
        </Field>

        <Field label="Description" required>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            maxLength={500}
            placeholder="Color, brand, stickers, contents — anything that helps identify it…"
            data-testid="lostfound-description-input"
            className={`${inputCls} resize-none`}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Phone number (optional)">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={20}
              placeholder="+994 …"
              data-testid="lostfound-phone-input"
              className={inputCls}
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              If provided, finders can call you directly from the post.
            </p>
          </Field>
          <Field label="Other contact method">
            <input
              type="text"
              value={contactMethod}
              onChange={(e) => setContactMethod(e.target.value)}
              maxLength={100}
              placeholder="Email or Instagram handle"
              data-testid="lostfound-contact-input"
              className={inputCls}
            />
          </Field>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-full border border-gray-200 bg-white text-gray-900 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={busy}
            data-testid="lostfound-submit-btn"
            className="inline-flex items-center justify-center gap-2 bg-[#FF5A1F] hover:bg-[#E04812] disabled:opacity-60 text-white font-medium px-7 py-3 rounded-full transition-colors shadow-[0_8px_24px_rgba(255,90,31,0.25)]"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Post lost item
          </motion.button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 focus:border-[#FF5A1F] transition-all";
const Label = ({ children }) => (
  <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">{children}</label>
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
