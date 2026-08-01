import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Scale, X } from "lucide-react";
import { useCompare } from "../context/CompareContext";

/** Floating pill that appears whenever the user selects listings to compare. */
export function CompareBar() {
  const { compareIds, clearCompare } = useCompare();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {compareIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40"
          data-testid="compare-bar"
        >
          <div className="flex items-center gap-3 bg-[#0A0A0A] text-white rounded-full pl-5 pr-2 py-2 shadow-[0_12px_32px_rgba(0,0,0,0.3)]">
            <span className="text-sm font-medium whitespace-nowrap">
              {compareIds.length} selected
            </span>
            <button
              onClick={() => navigate(`/compare?ids=${compareIds.join(",")}`)}
              disabled={compareIds.length < 2}
              data-testid="compare-bar-open"
              className="inline-flex items-center gap-1.5 bg-[#FF5A1F] hover:bg-[#E04812] disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-full transition-colors"
            >
              <Scale className="w-3.5 h-3.5" /> Compare
            </button>
            <button
              onClick={clearCompare}
              aria-label="Clear comparison"
              data-testid="compare-bar-clear"
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {compareIds.length < 2 && (
            <p className="text-center text-[11px] text-gray-500 mt-1.5">
              Select at least 2 listings to compare
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
