import {
  BookOpen,
  Cpu,
  Sofa,
  Lamp,
  Gamepad2,
  Shirt,
  Bike,
  Ticket,
  Package,
} from "lucide-react";

export const CATEGORIES = [
  { id: "books", label: "Books & Notes", icon: BookOpen },
  { id: "electronics", label: "Electronics", icon: Cpu },
  { id: "furniture", label: "Furniture", icon: Sofa },
  { id: "dorm", label: "Dorm Essentials", icon: Lamp },
  { id: "gaming", label: "Gaming", icon: Gamepad2 },
  { id: "clothing", label: "Clothing", icon: Shirt },
  { id: "transport", label: "Bikes & Transport", icon: Bike },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "other", label: "Other", icon: Package },
];

export const getCategoryLabel = (id) =>
  CATEGORIES.find((c) => c.id === id)?.label || "Other";
