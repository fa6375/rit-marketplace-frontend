import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import { CATEGORIES } from "../lib/categories";

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => onSnapshot(query(collection(db, "categories"), orderBy("order")), (snap) => {
    const values = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setCategories(values.length ? values : CATEGORIES.map((c, order) => ({ id: c.id, name: c.label, order })));
    setLoading(false);
  }, () => { setCategories(CATEGORIES.map((c, order) => ({ id: c.id, name: c.label, order }))); setLoading(false); }), []);
  return { categories, loading };
}
