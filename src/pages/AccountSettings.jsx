import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { auth, db, storage } from "../lib/firebase";
import { useSettings } from "../context/SettingsContext";
import { friendlyError } from "../lib/errors";
import { Camera, Loader2, LogOut, UserCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AccountSettings() {
  const { user, profile, refreshUser } = useAuth();
  const { maximumUploadSize } = useSettings();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { logout } = useAuth();

  useEffect(() => {
    if (!loaded && profile) {
      setDisplayName(profile.displayName || user?.displayName || "");
      setBio(profile.bio || "");
      setLoaded(true);
    }
  }, [profile, user, loaded]);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (saving) return;
    const name = displayName.trim();
    if (!name) {
      toast.error("Display name can't be empty");
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: name,
        bio: bio.trim().slice(0, 240),
        updatedAt: serverTimestamp(),
      });
      if (auth.currentUser && auth.currentUser.displayName !== name) {
        await updateProfile(auth.currentUser, { displayName: name });
        await refreshUser();
      }
      toast.success("Profile updated");
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (file) => {
    if (!file || uploading) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > maximumUploadSize * 1024 * 1024) {
      toast.error(`Image is too large. Maximum upload size is ${maximumUploadSize} MB.`);
      return;
    }
    setUploading(true);
    try {
      const oldPath = profile?.photoPath;
      const path = `avatars/${user.uid}/${Date.now()}_${file.name}`;
      const sref = storageRef(storage, path);
      await uploadBytes(sref, file);
      const url = await getDownloadURL(sref);
      await updateDoc(doc(db, "users", user.uid), {
        photoURL: url,
        photoPath: path,
        updatedAt: serverTimestamp(),
      });
      if (oldPath) {
        try {
          await deleteObject(storageRef(storage, oldPath));
        } catch (e) {}
      }
      try {
        await updateProfile(auth.currentUser, { photoURL: url });
        await refreshUser();
      } catch (e) {}
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setUploading(false);
    }
  };

  const photo = profile?.photoURL || user?.photoURL;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#FF5A1F]">
          Settings
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 mt-2 leading-none">
          Account
        </h1>
      </motion.div>

      <form
        onSubmit={saveProfile}
        className="mt-10 bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 sm:p-8"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500">
            Public profile
          </h3>
          <Link
            to={`/seller/${user?.uid}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FF5A1F] hover:text-[#E04812]"
            data-testid="account-view-profile"
          >
            <UserCircle2 className="w-3.5 h-3.5" /> View public profile
          </Link>
        </div>

        {/* Photo */}
        <div className="mt-5 flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            data-testid="account-photo-btn"
            className="relative w-20 h-20 rounded-full bg-[#0A0A0A] text-white font-semibold text-2xl flex items-center justify-center overflow-hidden group shrink-0"
            aria-label="Change profile photo"
          >
            {photo ? (
              <img src={photo} alt="" className="w-full h-full object-cover" />
            ) : (
              (user?.displayName || user?.email || "?").slice(0, 2).toUpperCase()
            )}
            <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </span>
          </button>
          <div>
            <p className="text-sm font-medium text-gray-900">Profile photo</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Shown on your public profile and your listings.
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              uploadPhoto(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-5">
          <div>
            <Label>Display name</Label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              data-testid="account-name-input"
              className={inputCls}
            />
          </div>
          <Field label="Email" value={user?.email} testId="account-email" />
        </div>
        <div className="mt-5">
          <Label>Bio</Label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={240}
            placeholder="Tell buyers a little about yourself…"
            data-testid="account-bio-input"
            className={`${inputCls} resize-none`}
          />
          <p className="text-[11px] text-gray-400 mt-1 text-right">{bio.length}/240</p>
        </div>
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            data-testid="account-save-btn"
            className="inline-flex items-center gap-2 bg-[#FF5A1F] hover:bg-[#E04812] disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-full transition-colors text-sm"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save changes
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-500">
            Account details
          </h3>
          <div className="mt-4 grid sm:grid-cols-2 gap-5">
            <Field label="Verified" value={user?.emailVerified ? "Yes" : "No"} />
            <Field label="User ID" value={user?.uid} mono />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
            data-testid="account-logout-btn"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "mt-1.5 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 focus:border-[#FF5A1F] transition-all";

const Label = ({ children }) => (
  <label className="text-xs uppercase tracking-wider font-medium text-gray-500">
    {children}
  </label>
);

const Field = ({ label, value, mono, testId }) => (
  <div>
    <p className="text-xs uppercase tracking-wider font-medium text-gray-500">{label}</p>
    <p
      className={`mt-1 text-sm text-gray-900 break-all ${mono ? "font-mono" : ""}`}
      data-testid={testId}
    >
      {value}
    </p>
  </div>
);
