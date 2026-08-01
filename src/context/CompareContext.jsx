import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const CompareContext = createContext({
  compareIds: [],
  toggleCompare: () => {},
  clearCompare: () => {},
  isCompared: () => false,
});

export const useCompare = () => useContext(CompareContext);

export const MAX_COMPARE = 4;
const STORAGE_KEY = "compareIds";

export const CompareProvider = ({ children }) => {
  const [compareIds, setCompareIds] = useState(() => {
    try {
      const raw = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
      return Array.isArray(raw) ? raw.filter((x) => typeof x === "string").slice(0, MAX_COMPARE) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(compareIds));
    } catch (e) {}
  }, [compareIds]);

  const toggleCompare = useCallback((id) => {
    setCompareIds((ids) => {
      if (ids.includes(id)) return ids.filter((x) => x !== id);
      if (ids.length >= MAX_COMPARE) {
        toast.info(`You can compare up to ${MAX_COMPARE} listings at once.`);
        return ids;
      }
      return [...ids, id];
    });
  }, []);

  const clearCompare = useCallback(() => setCompareIds([]), []);
  const isCompared = useCallback((id) => compareIds.includes(id), [compareIds]);

  return (
    <CompareContext.Provider value={{ compareIds, toggleCompare, clearCompare, isCompared }}>
      {children}
    </CompareContext.Provider>
  );
};
