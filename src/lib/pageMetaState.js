// Tracks how many mounted pages have claimed the document title so the
// global SettingsContext title-sync knows to back off while a page-level
// override is active.
let overrideCount = 0;

export const claimPageMeta = () => {
  overrideCount += 1;
};

export const releasePageMeta = () => {
  overrideCount = Math.max(0, overrideCount - 1);
};

export const hasPageMetaOverride = () => overrideCount > 0;
