import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export function useMaintenance() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    return onSnapshot(
      doc(db, "settings", "maintenance"),
      (snap) => setEnabled(Boolean(snap.data()?.enabled)),
      () => setEnabled(false)
    );
  }, []);
  return enabled;
}
