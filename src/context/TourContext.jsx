import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Joyride, ACTIONS, EVENTS, STATUS } from "react-joyride";
import { useAuth } from "./AuthContext";

/**
 * First-time product tour, built on react-joyride.
 *
 * - Auto-starts once per browser for signed-in users landing on the
 *   marketplace homepage, then never again (completion is persisted in
 *   localStorage under TOUR_STORAGE_KEY).
 * - Can always be replayed from the "Take a Tour" button in the footer,
 *   which clears the stored flag and restarts the walkthrough.
 * - Steps are built at start time and filtered to elements that are
 *   actually visible (e.g. the desktop-only Lost & Found link is skipped
 *   on mobile, the admin step only appears for admins), so the tour never
 *   points at something the user can't see.
 */

export const TOUR_STORAGE_KEY = "marketplaceTourDone";

const TourContext = createContext(null);

/* ------------------------------------------------------------------ */
/* Steps                                                               */
/* ------------------------------------------------------------------ */

const ACCENT = "#FF5A1F";

/** True when the target exists and is actually rendered (not display:none). */
const isVisible = (selector) => {
  if (selector === "body") return true;
  const el = document.querySelector(selector);
  return Boolean(el && (el.offsetParent !== null || el === document.body));
};

const buildSteps = (isAdmin) => {
  const steps = [
    {
      target: "body",
      placement: "center",
      disableBeacon: true,
      title: "Welcome to the marketplace 👋",
      content:
        "This is your campus home for buying, selling, and recovering lost items. Here's a quick 60-second tour of everything you can do — you can replay it anytime from the footer.",
      styles: { overlay: { backdropFilter: "blur(4px)" } },
    },
    {
      target: '[data-tour="search"]',
      placement: "bottom",
      disableBeacon: true,
      title: "Search everything",
      content:
        "Find listings, sellers, and categories instantly. Suggestions appear as you type — use the arrow keys and Enter to jump straight to a result.",
    },
    {
      target: '[data-tour="categories"]',
      placement: "bottom",
      disableBeacon: true,
      title: "Browse by category",
      content:
        "Tap a pill to filter the marketplace by category. Combine it with the type and pickup-location filters to narrow things down even further.",
    },
    {
      target: '[data-tour="create-listing"]',
      placement: "bottom",
      disableBeacon: true,
      title: "Post a listing",
      content:
        "Ready to sell? Add photos, a price, condition, and a campus pickup spot. Your followers are notified the moment your listing goes live.",
    },
    {
      target: '[data-tour="lost-found"]',
      placement: "bottom",
      disableBeacon: true,
      title: "Lost & Found",
      content:
        "Lost something on campus — or found someone else's stuff? Post it here with photos and a last-seen location so it can find its way home.",
    },
    {
      target: '[data-tour="save-listing"]',
      placement: "bottom",
      disableBeacon: true,
      title: "Save your favorites",
      content:
        "Tap the heart on any listing to save it to your wishlist — you can even organize saves into collections and get notified when a price drops.",
    },
    {
      target: '[data-tour="notifications"]',
      placement: "bottom",
      disableBeacon: true,
      title: "Notifications",
      content:
        "Offers, price drops, new listings from sellers you follow, achievements — everything lands here so you never miss a beat.",
    },
    {
      target: '[data-tour="profile"]',
      placement: "bottom",
      disableBeacon: true,
      title: "Your profile menu",
      content:
        "Open this menu to reach your public profile, your listings, saved items, offers, analytics, and account settings.",
    },
  ];

  if (isAdmin) {
    steps.push({
      target: '[data-tour="profile"]',
      placement: "bottom",
      disableBeacon: true,
      title: "Admin panel",
      content:
        "As an admin, this menu also holds the Admin Panel — moderate listings and reports, manage users, locations, achievements, and site settings.",
    });
  }

  steps.push({
    target: '[data-tour="navbar"]',
    placement: "bottom",
    disableBeacon: true,
    title: "You're all set 🎉",
    content:
      "The navigation bar keeps everything one tap away wherever you are. Happy trading — and remember to meet in safe, public campus spots!",
    styles: { overlay: { backdropFilter: "blur(4px)" } },
  });

  // Skip steps whose target isn't currently visible (mobile layouts,
  // empty marketplaces without listing cards, etc.).
  return steps.filter((s) => isVisible(s.target));
};

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function TourProvider({ children }) {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState([]);
  const pendingStart = useRef(false);

  const markDone = useCallback(() => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, String(Date.now()));
    } catch {
      /* storage unavailable (private mode) — tour will simply re-offer */
    }
  }, []);

  const hasCompleted = useCallback(() => {
    try {
      return Boolean(localStorage.getItem(TOUR_STORAGE_KEY));
    } catch {
      return false;
    }
  }, []);

  /** Build steps from the live DOM and begin the walkthrough. */
  const begin = useCallback(() => {
    const built = buildSteps(isAdmin);
    if (!built.length) return;
    setSteps(built);
    setStepIndex(0);
    setRun(true);
  }, [isAdmin]);

  /**
   * Public: restart the tour (footer button). Clears the completion flag,
   * returns to the marketplace homepage if needed, then starts.
   */
  const startTour = useCallback(() => {
    try {
      localStorage.removeItem(TOUR_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (!user) {
      navigate("/login");
      return;
    }
    if (location.pathname !== "/") {
      pendingStart.current = true;
      navigate("/");
      return;
    }
    // Small delay so the page settles before we measure targets.
    setTimeout(begin, 400);
  }, [user, location.pathname, navigate, begin]);

  // Start after a navigation triggered by startTour().
  useEffect(() => {
    if (pendingStart.current && location.pathname === "/" && user) {
      pendingStart.current = false;
      const t = setTimeout(begin, 700);
      return () => clearTimeout(t);
    }
  }, [location.pathname, user, begin]);

  // Auto-start exactly once for first-time visitors on the homepage.
  useEffect(() => {
    if (
      user &&
      profile &&
      location.pathname === "/" &&
      !run &&
      !hasCompleted()
    ) {
      const t = setTimeout(begin, 1000);
      return () => clearTimeout(t);
    }
  }, [user, profile, location.pathname, run, hasCompleted, begin]);

  const handleCallback = useCallback(
    (data) => {
      const { action, index, status, type } = data;

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setRun(false);
        setStepIndex(0);
        markDone();
        return;
      }
      if (action === ACTIONS.CLOSE) {
        setRun(false);
        setStepIndex(0);
        markDone();
        return;
      }
      if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
        setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
      }
    },
    [markDone]
  );

  const value = useMemo(() => ({ startTour, tourRunning: run }), [startTour, run]);

  return (
    <TourContext.Provider value={value}>
      {children}
      {user && (
        <Joyride
          run={run}
          steps={steps}
          stepIndex={stepIndex}
          callback={handleCallback}
          continuous
          showSkipButton
          showProgress
          disableOverlayClose
          scrollOffset={120}
          spotlightPadding={8}
          locale={{
            back: "Previous",
            close: "Close",
            last: "Finish",
            next: "Next",
            skip: "Skip tour",
          }}
          styles={{
            options: {
              arrowColor: "#ffffff",
              backgroundColor: "#ffffff",
              overlayColor: "rgba(10, 10, 10, 0.65)",
              primaryColor: ACCENT,
              textColor: "#111827",
              zIndex: 10000,
            },
            tooltip: {
              borderRadius: 16,
              padding: "20px 20px 14px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
              fontFamily: "inherit",
            },
            tooltipTitle: {
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              textAlign: "left",
            },
            tooltipContent: {
              fontSize: 14,
              lineHeight: 1.55,
              color: "#4B5563",
              padding: "10px 0 4px",
              textAlign: "left",
            },
            buttonNext: {
              backgroundColor: ACCENT,
              borderRadius: 9999,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 500,
              outline: "none",
            },
            buttonBack: {
              color: "#6B7280",
              fontSize: 13,
              marginRight: 8,
            },
            buttonSkip: {
              color: "#9CA3AF",
              fontSize: 13,
            },
            spotlight: {
              borderRadius: 12,
            },
          }}
        />
      )}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  // Footer renders on public pages too; fall back to a no-op if the
  // provider is ever absent so the button can never crash the app.
  return ctx || { startTour: () => {}, tourRunning: false };
}
