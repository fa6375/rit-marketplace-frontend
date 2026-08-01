/**
 * Pure ranking helpers — trending, similarity, and the daily Discover feed.
 * All functions operate on already-loaded listing arrays so they add zero
 * extra Firestore reads.
 */

const ageDays = (listing) => {
  const t = listing.createdAt?.toMillis?.();
  if (!t) return 999;
  return (Date.now() - t) / 86400000;
};

export const isVisible = (l) => !l.hidden;
export const isBuyable = (l) => !l.hidden && !l.sold;

/** Trending score: engagement weighted by recency decay. */
export function trendingScore(l) {
  const views = Number(l.views) || 0;
  const saves = Number(l.savesCount) || 0;
  const offers = Number(l.offersCount) || 0;
  const engagement = views * 1 + saves * 3 + offers * 5;
  const recency = Math.exp(-ageDays(l) / 7) * 10; // fresh posts get a boost
  return engagement * Math.exp(-ageDays(l) / 21) + recency;
}

export function trendingListings(listings, count = 4) {
  return listings
    .filter(isBuyable)
    .map((l) => ({ l, s: trendingScore(l) }))
    .filter((x) => x.s > 0.5)
    .sort((a, b) => b.s - a.s)
    .slice(0, count)
    .map((x) => x.l);
}

/* ------------------------------------------------------------------ */

const STOP = new Set(["the", "and", "for", "with", "new", "used", "a", "an", "of", "in", "on"]);
const tokens = (text = "") =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

/** Similarity: category, price range, title keywords, location, type. */
export function similarListings(target, listings, count = 4) {
  if (!target) return [];
  const targetTokens = new Set(tokens(target.title));
  const price = Number(target.price) || 0;
  return listings
    .filter((l) => l.id !== target.id && isBuyable(l))
    .map((l) => {
      let score = 0;
      if (l.category && l.category === target.category) score += 3;
      const p = Number(l.price) || 0;
      if (price > 0 && p > 0 && Math.abs(p - price) / price <= 0.4) score += 2;
      const overlap = tokens(l.title).filter((w) => targetTokens.has(w)).length;
      score += Math.min(3, overlap);
      if (l.location && l.location === target.location) score += 1;
      if (l.type && l.type === target.type) score += 1;
      return { l, score };
    })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((x) => x.l);
}

/* ------------------------------------------------------------------ */

// Deterministic seeded PRNG so the Discover feed is stable for a whole day
// per user, then refreshes automatically.
const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const hash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h;
};

/**
 * Daily Discover: fresh picks each day, weighted toward categories the user
 * has saved or viewed, mixed with popular listings, never their own posts.
 */
export function discoverListings(listings, uid, preferredCategories = [], count = 4) {
  const day = new Date().toISOString().slice(0, 10);
  const rand = mulberry32(hash(`${uid}_${day}`));
  const prefs = new Set(preferredCategories);
  const pool = listings
    .filter((l) => isBuyable(l) && l.ownerId !== uid)
    .map((l) => {
      const affinity = prefs.has(l.category) ? 3 : 1;
      const popularity = 1 + Math.log1p((Number(l.views) || 0) + (Number(l.savesCount) || 0) * 2);
      return { l, weight: affinity * popularity * (0.5 + rand()) };
    })
    .sort((a, b) => b.weight - a.weight);
  return pool.slice(0, count).map((x) => x.l);
}

/* ------------------------------------------------------------------ */

/** Live search suggestions across listings, categories, and sellers. */
export function buildSuggestions(term, { listings = [], categories = [] }, cap = 8) {
  const s = term.trim().toLowerCase();
  if (s.length < 2) return [];
  const out = [];
  const seen = new Set();
  for (const c of categories) {
    const label = (c.name || c.label || "").toLowerCase();
    if (label.includes(s)) out.push({ kind: "category", id: c.id, label: c.name || c.label });
  }
  for (const l of listings) {
    if (out.length >= cap) break;
    if (l.hidden) continue;
    if (l.title?.toLowerCase().includes(s) && !seen.has(`l${l.id}`)) {
      seen.add(`l${l.id}`);
      out.push({ kind: "listing", id: l.id, label: l.title, price: l.price });
    }
  }
  for (const l of listings) {
    if (out.length >= cap) break;
    const name = l.ownerName || "";
    if (name.toLowerCase().includes(s) && l.ownerId && !seen.has(`u${l.ownerId}`)) {
      seen.add(`u${l.ownerId}`);
      out.push({ kind: "seller", id: l.ownerId, label: name });
    }
  }
  return out.slice(0, cap);
}
