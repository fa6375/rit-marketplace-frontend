import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Plus, LogOut, User, Package2, Store } from "lucide-react";
import { motion } from "framer-motion";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = (user?.displayName || user?.email || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className="sticky top-0 z-50 bg-[#0A0A0A] border-b border-white/10"
      data-testid="main-navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2 group"
            data-testid="navbar-logo-link"
          >
            <motion.div
              whileHover={{ rotate: -8 }}
              className="w-8 h-8 rounded-lg bg-[#FF5A1F] flex items-center justify-center"
            >
              <Store className="w-4 h-4 text-white" strokeWidth={2.5} />
            </motion.div>
            <span className="text-white font-semibold tracking-tight text-lg">
              Marketplace
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/create" data-testid="navbar-create-listing-link">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-[#FF5A1F] hover:bg-[#E04812] text-white text-sm font-medium px-4 sm:px-5 py-2 rounded-full transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Post a listing</span>
                <span className="sm:hidden">Post</span>
              </motion.button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/60 rounded-full"
                data-testid="navbar-profile-trigger"
                aria-label="Open profile menu"
              >
                <div className="w-9 h-9 rounded-full bg-white text-[#0A0A0A] font-semibold text-sm flex items-center justify-center hover:bg-gray-200 transition-colors">
                  {initials}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 rounded-xl border border-gray-200"
                data-testid="navbar-profile-menu"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-gray-900 truncate">
                      {user?.displayName || "Student"}
                    </span>
                    <span
                      className="text-xs text-gray-500 truncate"
                      data-testid="navbar-profile-email"
                    >
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/my-listings")}
                  className="cursor-pointer"
                  data-testid="navbar-my-listings-item"
                >
                  <Package2 className="w-4 h-4 mr-2" /> My listings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/account")}
                  className="cursor-pointer"
                  data-testid="navbar-account-item"
                >
                  <User className="w-4 h-4 mr-2" /> Account settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-700"
                  data-testid="navbar-logout-item"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
