import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";

/**
 * Shared layout for legal and informational pages (Privacy, Terms,
 * Guidelines, About, Contact, FAQ). Keeps typography, spacing and motion
 * consistent with the rest of the app and handles per-page SEO metadata.
 */
export const LegalPageLayout = ({
  eyebrow,
  title,
  intro,
  lastUpdated,
  metaTitle,
  metaDescription,
  children,
  testId,
}) => {
  usePageMeta(metaTitle || title, metaDescription || intro);

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
      data-testid={testId}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl"
      >
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#FF5A1F]">
            {eyebrow}
          </p>
        )}
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 mt-2 leading-tight">
          {title}
        </h1>
        {intro && (
          <p className="text-gray-500 mt-3 leading-relaxed">{intro}</p>
        )}
        {lastUpdated && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-500">
            <CalendarDays className="w-3.5 h-3.5 text-[#FF5A1F]" />
            Last updated: {lastUpdated}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="mt-10 max-w-3xl"
      >
        {children}
      </motion.div>
    </div>
  );
};

/** A titled section within a legal page (renders an H2 + body copy). */
export const LegalSection = ({ title, children }) => (
  <section className="mt-8 first:mt-0">
    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
      {title}
    </h2>
    <div className="mt-3 space-y-3 text-sm sm:text-[15px] leading-relaxed text-gray-600">
      {children}
    </div>
  </section>
);

/** A styled bullet list used inside legal sections. */
export const LegalList = ({ items }) => (
  <ul className="space-y-2">
    {items.map((item, i) => (
      <li key={i} className="flex gap-3">
        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF5A1F]" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);
