import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Megaphone, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

// Original short lines — rotate under the greeting
const QUOTES = [
  "One student's clutter is another student's treasure.",
  "The best deals on campus are one message away.",
  "Buy smart, sell smarter, graduate richer.",
  "Every textbook deserves a second semester.",
  "Great things happen when students trade with students.",
  "Your dorm called — it wants less stuff and more cash.",
  "Small campus, big marketplace.",
  "Sell what you don't need, find what you do.",
  "A good deal today beats a full closet tomorrow.",
  "Trade local. Think global. Study hard.",
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

export const GreetingBanner = () => {
  const { announcement } = useSettings();
  const { user } = useAuth();
  // Start at a quote based on the day so it feels fresh each visit
  const startIndex = useMemo(
    () => new Date().getDate() % QUOTES.length,
    []
  );
  const [index, setIndex] = useState(startIndex);

  // Rotate quotes every 10 seconds
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % QUOTES.length), 10000);
    return () => clearInterval(t);
  }, []);

  // A custom announcement from Website Settings always takes priority
  if (announcement?.trim()) {
    return (
      <div
        className="w-full bg-orange-50 border-b border-orange-100 text-orange-900 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-300 px-4 py-2 text-center text-sm flex items-center justify-center gap-2"
        data-testid="announcement-banner"
      >
        <Megaphone className="w-4 h-4 shrink-0" />
        {announcement}
      </div>
    );
  }

  const firstName = (user?.displayName || "").trim();
  const greeting = getGreeting();

  return (
    <div
      className="w-full bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-b border-orange-100 dark:from-orange-500/10 dark:via-amber-500/5 dark:to-orange-500/10 dark:border-orange-500/20 px-4 py-2 overflow-hidden"
      data-testid="greeting-banner"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-sm text-center">
        <span className="flex items-center gap-1.5 text-gray-800 dark:text-orange-200 whitespace-nowrap">
          <Sparkles className="w-4 h-4 text-[#FF5A1F] shrink-0" />
          {greeting}
          {firstName ? (
            <>
              ,{" "}
              <span className="font-semibold text-[#FF5A1F]">{firstName}</span>{" "}
              <span aria-hidden>👋</span>
            </>
          ) : (
            "!"
          )}
        </span>
        <span className="hidden sm:inline text-orange-200 dark:text-orange-500/30">•</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="italic text-gray-500 dark:text-gray-400"
          >
            "{QUOTES[index]}"
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};
