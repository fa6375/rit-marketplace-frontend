import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import MaintenancePage from "../MaintenancePage";

export function MaintenanceGate({ children }) {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    return onSnapshot(
      doc(db, "settings", "maintenance"),
      (snap) => setEnabled(Boolean(snap.data()?.enabled)),
      () => setEnabled(false)
    );
  }, []);

  const isAdminPage =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/login");

  if (!loading && enabled && !isAdmin && !isAdminPage) {
    return <MaintenancePage />;
  }

  return children;
}