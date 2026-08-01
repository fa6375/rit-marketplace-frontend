import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getCategoryLabel } from "../lib/categories";
import { getTypeLabel } from "../lib/listingTypes";
import { ImageOff, Eye, MapPin, Scale, TrendingDown } from "lucide-react";
import { SaveButton } from "./SaveButton";
import { useCompare } from "../context/CompareContext";

export const ListingCard = ({ listing, index = 0 }) => {
  const { toggleCompare, isCompared } = useCompare();
  const compared = isCompared(listing.id);
  const views = Number(listing.views) || 0;
  const priceDropped =
    Number(listing.originalPrice) > 0 &&
    Number(listing.price) < Number(listing.originalPrice);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
    >
      <Link
        to={`/listing/${listing.id}`}
        data-testid={`listing-card-${listing.id}`}
        className={`group block bg-white rounded-2xl border shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden ${
          compared
            ? "border-[#FF5A1F]/50 ring-1 ring-[#FF5A1F]/30"
            : "border-gray-100 hover:border-[#FF5A1F]/20"
        }`}
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
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-gray-800 border border-gray-200">
              {getCategoryLabel(listing.category)}
            </span>
            {listing.type && listing.type !== "product" && (
              <span className="text-[10px] uppercase tracking-[0.18em] font-semibold bg-[#0A0A0A]/85 backdrop-blur px-2.5 py-1 rounded-full text-white">
                {getTypeLabel(listing.type)}
              </span>
            )}
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleCompare(listing.id);
              }}
              aria-label={compared ? "Remove from comparison" : "Add to comparison"}
              data-testid={`compare-btn-${listing.id}`}
              className={`w-8 h-8 rounded-full backdrop-blur flex items-center justify-center border transition-all ${
                compared
                  ? "bg-[#FF5A1F] border-[#FF5A1F] text-white"
                  : "bg-white/90 border-gray-200 text-gray-500 hover:text-[#FF5A1F] opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
            <SaveButton listing={listing} />
          </div>
          {listing.sold && (
            <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
              <span className="text-xs uppercase tracking-[0.22em] font-semibold bg-white text-gray-900 px-4 py-1.5 rounded-full">
                Sold
              </span>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-gray-900 text-base tracking-tight line-clamp-1 flex-1">
              {listing.title}
            </h3>
            <span className="text-right whitespace-nowrap">
              <span
                className="text-[#FF5A1F] font-semibold text-base"
                data-testid={`listing-price-${listing.id}`}
              >
                €{Number(listing.price).toLocaleString()}
              </span>
              {priceDropped && (
                <span className="flex items-center justify-end gap-0.5 text-[11px] text-emerald-600 font-medium">
                  <TrendingDown className="w-3 h-3" />€
                  {Number(listing.originalPrice).toLocaleString()}
                </span>
              )}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
          {(listing.locationName || views > 0) && (
            <div className="flex items-center justify-between mt-3 text-[11px] text-gray-400">
              <span className="flex items-center gap-1 truncate">
                {listing.locationName && (
                  <>
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{listing.locationName}</span>
                  </>
                )}
              </span>
              {views > 0 && (
                <span className="flex items-center gap-1 shrink-0">
                  <Eye className="w-3 h-3" /> {views.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};
