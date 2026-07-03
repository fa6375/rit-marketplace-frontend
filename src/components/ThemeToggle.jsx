import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/**
 * variant "dark-surface": for use on always-dark surfaces (main navbar).
 * variant "auto": adapts to the current theme (light pages like the auth page).
 */
export const ThemeToggle = ({ className = "", variant = "dark-surface" }) => {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  const styles =
    variant === "auto"
      ? "border-gray-200 bg-white/90 text-gray-700 hover:bg-gray-100 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
      : "border-white/15 bg-white/10 text-white hover:bg-white/20";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      data-testid="theme-toggle"
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${styles} ${className}`}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};
