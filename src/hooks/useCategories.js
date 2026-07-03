import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import { CATEGORIES } from "../lib/categories";

const fallback = () =>
  CATEGORIES.map((c, order) => ({ id: c.id, name: c.label, icon: c.icon, order }));

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  // true when the categories actually live in Firestore (i.e. are editable)
  const [fromFirestore, setFromFirestore] = useState(false);

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "categories"), orderBy("order")),
        (snap) => {
          const values = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setFromFirestore(values.length > 0);
          setCategories(values.length ? values : fallback());
          setLoading(false);
        },
        () => {
          setFromFirestore(false);
          setCategories(fallback());
          setLoading(false);
        }
      ),
    []
  );
  return { categories, loading, fromFirestore };
}
