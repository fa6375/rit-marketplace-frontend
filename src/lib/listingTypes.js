import {
  ShoppingBag,
  GraduationCap,
  Wrench,
  CalendarDays,
  Briefcase,
  Home,
} from "lucide-react";

/**
 * Listing types extend the marketplace beyond physical products.
 * Admins can enable/disable each type from Website Settings; the create
 * form, dashboard filters, and search all react to the same config.
 */
export const LISTING_TYPES = [
  { id: "product", label: "Product", icon: ShoppingBag },
  { id: "tutoring", label: "Tutoring", icon: GraduationCap },
  { id: "service", label: "Service", icon: Wrench },
  { id: "event", label: "Event", icon: CalendarDays },
  { id: "job", label: "Job", icon: Briefcase },
  { id: "roommate", label: "Roommate", icon: Home },
];

export const getTypeLabel = (id) =>
  LISTING_TYPES.find((t) => t.id === id)?.label || "Product";

export const getTypeIcon = (id) =>
  LISTING_TYPES.find((t) => t.id === id)?.icon || ShoppingBag;

/** Types currently enabled by admins (product can never be disabled). */
export const enabledTypes = (settings) =>
  LISTING_TYPES.filter(
    (t) => t.id === "product" || settings?.listingTypes?.[t.id] !== false
  );

export const CONDITIONS = [
  { id: "new", label: "New" },
  { id: "like-new", label: "Like new" },
  { id: "good", label: "Good" },
  { id: "fair", label: "Fair" },
];

export const getConditionLabel = (id) =>
  CONDITIONS.find((c) => c.id === id)?.label || "—";

/** Fallback pickup locations until admins customize them in the panel. */
export const DEFAULT_LOCATIONS = [
  "Main Campus",
  "Library",
  "Student Center",
  "Dorms — North",
  "Dorms — South",
  "Engineering Building",
  "Sports Complex",
  "Off Campus",
];
