import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, writeBatch } from "firebase/firestore";
import {
  Bell,
  UserPlus,
  HandCoins,
  CheckCircle2,
  XCircle,
  ArrowLeftRight,
  Heart,
  Trophy,
  TrendingDown,
  BadgeCheck,
  Sparkles,
  SearchCheck,
} from "lucide-react";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useSocial";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

const ICONS = {
  follower: UserPlus,
  offer: HandCoins,
  "offer-accepted": CheckCircle2,
  "offer-rejected": XCircle,
  "offer-countered": ArrowLeftRight,
  like: Heart,
  achievement: Trophy,
  "price-drop": TrendingDown,
  sold: BadgeCheck,
  "new-listing": Sparkles,
  "lost-found": SearchCheck,
};

const timeAgo = (ts) => {
  const date = ts?.toDate?.();
  if (!date) return "just now";
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export function NotificationsBell() {
  const { user } = useAuth();
  const { notifications, unread } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const markAllRead = async () => {
    const unreadItems = notifications.filter((n) => !n.read);
    if (!unreadItems.length) return;
    try {
      const batch = writeBatch(db);
      unreadItems.forEach((n) => batch.update(doc(db, "notifications", n.id), { read: true }));
      await batch.commit();
    } catch (e) {}
  };

  const openItem = async (n) => {
    setOpen(false);
    if (!n.read) {
      try {
        const batch = writeBatch(db);
        batch.update(doc(db, "notifications", n.id), { read: true });
        await batch.commit();
      } catch (e) {}
    }
    if (n.link) navigate(n.link);
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          data-testid="navbar-notifications-btn"
          data-tour="notifications"
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Bell className="w-[18px] h-[18px]" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#FF5A1F] text-white text-[10px] font-semibold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[22rem] max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 p-0 overflow-hidden"
        data-testid="notifications-panel"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Notifications</p>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              data-testid="notifications-mark-all"
              className="text-xs font-medium text-[#FF5A1F] hover:text-[#E04812]"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-[22rem] overflow-y-auto">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <button
                key={n.id}
                onClick={() => openItem(n)}
                data-testid={`notification-${n.id}`}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-gray-50 transition-colors hover:bg-gray-50 ${
                  n.read ? "" : "bg-orange-50/50"
                }`}
              >
                <div
                  className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    n.read ? "bg-gray-100 text-gray-500" : "bg-orange-50 text-[#FF5A1F]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 leading-snug">{n.title}</p>
                  {n.body && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{n.body}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </button>
            );
          })}
          {!notifications.length && (
            <p className="px-4 py-10 text-center text-sm text-gray-400">
              Nothing here yet — activity on your listings will show up here.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
