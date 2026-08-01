import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

/**
 * ErrorState — the friendly full-section error UI used whenever a page or
 * panel fails to load. Mirrors the visual language of EmptyState.
 */
export const ErrorState = ({
  title = "Something went wrong",
  subtitle = "We couldn't complete your request. Please try again in a moment.",
  onRetry,
  compact = false,
}) => {
  const { supportEmail } = useSettings();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center text-center px-6 ${
        compact ? "py-10" : "py-20 sm:py-24"
      }`}
      data-testid="error-state"
    >
      <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mb-4">
        <AlertTriangle className="w-5 h-5 text-[#FF5A1F]" />
      </div>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
        {title}
      </h2>
      <p className="text-gray-500 mt-2 max-w-md leading-relaxed text-sm">
        {subtitle}
        {supportEmail && (
          <>
            {" "}
            If the problem continues, contact{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="text-[#FF5A1F] hover:text-[#E04812] font-medium"
            >
              support
            </a>
            .
          </>
        )}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          data-testid="error-state-retry"
          className="mt-6 inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 px-5 py-2.5 rounded-full font-medium text-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Try again
        </button>
      )}
    </motion.div>
  );
};
