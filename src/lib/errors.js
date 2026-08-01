// Central mapping of raw Firebase / network errors to friendly, human
// messages. Raw exception text must never reach the UI — every catch block
// in the app funnels through friendlyError().

const KNOWN = {
  "permission-denied":
    "You don't have permission to do that. If you think this is a mistake, contact support.",
  unavailable:
    "We couldn't reach the server. Check your connection and try again in a moment.",
  "deadline-exceeded":
    "The request took too long. Please try again in a moment.",
  "not-found": "That item no longer exists. It may have been removed.",
  "already-exists": "This already exists — no need to do it twice.",
  "resource-exhausted":
    "We're receiving a lot of requests right now. Please try again shortly.",
  cancelled: "The request was cancelled. Please try again.",
  unauthenticated: "Your session has expired. Please sign in again.",
  "failed-precondition":
    "We couldn't complete your request right now. Please try again in a moment.",
  "storage/unauthorized":
    "You don't have permission to upload this file.",
  "storage/canceled": "The upload was cancelled.",
  "storage/retry-limit-exceeded":
    "The upload kept failing. Check your connection and try again.",
  "storage/quota-exceeded":
    "Storage is full right now. Please try again later or contact support.",
};

export const DEFAULT_ERROR_MESSAGE =
  "We couldn't complete your request. Please try again in a moment. If the problem continues, contact support.";

export function friendlyError(err) {
  if (!err) return DEFAULT_ERROR_MESSAGE;
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "You appear to be offline. Reconnect and try again.";
  }
  const code = err.code || "";
  if (KNOWN[code]) return KNOWN[code];
  const short = code.split("/").pop();
  if (KNOWN[short]) return KNOWN[short];
  return DEFAULT_ERROR_MESSAGE;
}
