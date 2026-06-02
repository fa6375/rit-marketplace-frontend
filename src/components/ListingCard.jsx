import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getCategoryLabel } from "../lib/categories";
import { ImageOff } from "lucide-react";

export const ListingCard = ({ listing, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
    >
      <Link
        to={`/listing/${listing.id}`}
        data-testid={`listing-card-${listing.id}`}
        className="group block bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-[#FF5A1F]/20 transition-all duration-300 overflow-hidden"
      >
        <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ImageOff className="w-10 h-10" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-gray-800 border border-gray-200">
              {getCategoryLabel(listing.category)}
            </span>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-gray-900 text-base tracking-tight line-clamp-1 flex-1">
              {listing.title}
            </h3>
            <span
              className="text-[#FF5A1F] font-semibold text-base whitespace-nowrap"
              data-testid={`listing-price-${listing.id}`}
            >
              ${Number(listing.price).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};
