import { useEffect } from "react";
import { useSettings } from "../context/SettingsContext";
import { claimPageMeta, releasePageMeta } from "../lib/pageMetaState";

/**
 * Sets a unique document title and meta description for the current page.
 * Falls back to the configured website name for branding consistency and
 * restores the previous values on unmount.
 */
export function usePageMeta(title, description) {
  const { websiteName } = useSettings();

  useEffect(() => {
    claimPageMeta();
    const previousTitle = document.title;
    document.title = title ? `${title} | ${websiteName}` : websiteName;

    let meta = document.querySelector('meta[name="description"]');
    let createdMeta = false;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
      createdMeta = true;
    }
    const previousDescription = meta.getAttribute("content");
    if (description) meta.setAttribute("content", description);

    return () => {
      releasePageMeta();
      document.title = previousTitle;
      if (createdMeta) {
        meta.remove();
      } else if (previousDescription !== null) {
        meta.setAttribute("content", previousDescription);
      }
    };
  }, [title, description, websiteName]);
}
