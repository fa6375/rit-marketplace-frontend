import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export const EmptyState = ({
  title = "No listings yet",
  subtitle = "Be the first student to post something on the marketplace.",
  ctaLabel = "Create a listing",
  ctaTo = "/create",
  showCta = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 sm:py-24 px-6 text-center"
      data-testid="empty-state"
    >
      <div className="w-44 h-44 sm:w-56 sm:h-56 mb-6">
        <img
          src="https://static.prod-images.emergentagent.com/jobs/a3285b10-36bd-49b9-9338-07c91fd858fa/images/ec66d9bbcab4b5490808ebc7ecf2f0f8649d94b6c2ae26067ab4da8d2de56103.png"
          alt="Empty marketplace"
          className="w-full h-full object-contain"
        />
      </div>
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
        {title}
      </h2>
      <p className="text-gray-500 mt-2 max-w-md leading-relaxed">{subtitle}</p>
      {showCta && (
        <Link to={ctaTo} className="mt-7" data-testid="empty-state-cta">
          <button className="inline-flex items-center gap-2 bg-[#FF5A1F] hover:bg-[#E04812] text-white px-6 py-3 rounded-full font-medium transition-colors shadow-[0_8px_24px_rgba(255,90,31,0.25)]">
            <Plus className="w-4 h-4" />
            {ctaLabel}
          </button>
        </Link>
      )}
    </motion.div>
  );
};
