import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../lib/firebase";

export function useCollection(name, ...constraints) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const q = query(collection(db, name), ...constraints);
    return onSnapshot(q, (snapshot) => {
      setData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      setLoading(false);
    }, (reason) => { setError(reason); setLoading(false); });
  // Firebase query constraints are constructed by callers; resubscribing on each
  // render would create a loop, while the collection name identifies the stream.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);
  return { data, loading, error };
}
