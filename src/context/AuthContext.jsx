import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Reload to get latest emailVerified status
        try {
          await u.reload();
        } catch (e) {}
        setUser(auth.currentUser);
      } else {
        setUser(null);
        setProfile(null);
        setProfileReady(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setProfileReady(false);
      return;
    }
    setProfileReady(false);
    return onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setProfileReady(true);
      },
      () => setProfileReady(true)
    );
  }, [user?.uid]);

  const ensureUserDoc = async (u, extra = {}) => {
    const ref = doc(db, "users", u.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: u.uid,
        email: u.email,
        displayName: extra.displayName || u.displayName || "",
        photoURL: u.photoURL || "",
        role: "user",
        status: "active",
        createdAt: serverTimestamp(),
      });
    }
  };

  const signup = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    await sendEmailVerification(cred.user);
    await ensureUserDoc(cred.user, { displayName });
    setUser(auth.currentUser);
    return cred.user;
  };

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserDoc(cred.user);
    setUser(auth.currentUser);
    // Fetch the Firestore profile right away so callers can react to
    // the account's role (admin) and status (banned / suspended).
    let userProfile = null;
    try {
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (snap.exists()) userProfile = { id: snap.id, ...snap.data() };
    } catch (e) {}
    return { user: cred.user, profile: userProfile };
  };

  const logout = () => signOut(auth);

  const resendVerification = async () => {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser);
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    }
  };

  const value = {
    user,
    profile,
    profileReady,
    isAdmin: profile?.role === "admin",
    loading,
    signup,
    login,
    logout,
    resendVerification,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
