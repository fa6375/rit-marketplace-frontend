import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { orderBy } from "firebase/firestore";
import { LayoutDashboard, Tags, Users, Flag, FolderKanban, BarChart3, Settings, Wrench, ScrollText, LogOut, Menu, Search, Bell, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../hooks/useCollection";
import { MaintenanceBanner } from "../MaintenanceBanner";

const links = [
  ["Dashboard", "/admin/dashboard", LayoutDashboard], ["Listings", "/admin/listings", Tags],
  ["Users", "/admin/users", Users], ["Reports", "/admin/reports", Flag],
  ["Categories", "/admin/categories", FolderKanban], ["Analytics", "/admin/analytics", BarChart3],
  ["Website Settings", "/admin/settings", Settings], ["Maintenance", "/admin/maintenance", Wrench],
  ["Admin Logs", "/admin/logs", ScrollText],
];

const timeAgo = (ts) => {
  const date = ts?.toDate?.();
  if (!date) return "just now";
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return date.toLocaleDateString();
};

function NotificationsBell() {
  const navigate = useNavigate();
  const { data: logs } = useCollection("adminLogs", orderBy("timestamp", "desc"));
  const [open, setOpen] = useState(false);
  const [seenAt, setSeenAt] = useState(() => {
    try { return Number(localStorage.getItem("adminNotifSeen")) || 0; } catch (e) { return 0; }
  });
  const ref = useRef(null);

  const recent = useMemo(() => logs.slice(0, 10), [logs]);
  const unread = useMemo(
    () => recent.filter((l) => (l.timestamp?.toMillis?.() || 0) > seenAt).length,
    [recent, seenAt]
  );

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      const now = Date.now();
      setSeenAt(now);
      try { localStorage.setItem("adminNotifSeen", String(now)); } catch (e) {}
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        aria-label="Notifications"
        data-testid="admin-notifications-btn"
        className={`relative rounded-xl border p-2.5 transition ${open ? "border-orange-500/40 bg-orange-500/10 text-orange-400" : "border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"}`}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#0d1017] shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
            <p className="text-sm font-medium">Recent admin changes</p>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {recent.map((l) => (
              <button
                key={l.id}
                onClick={() => { setOpen(false); navigate("/admin/logs"); }}
                className="block w-full border-b border-white/5 px-5 py-3.5 text-left transition hover:bg-white/[.04]"
              >
                <p className="text-sm text-slate-200">
                  <span className="font-medium">{l.adminName}</span>{" "}
                  <span className="text-slate-400">{l.action}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-600">{timeAgo(l.timestamp)}</p>
              </button>
            ))}
            {!recent.length && (
              <p className="px-5 py-8 text-center text-sm text-slate-500">No admin activity yet.</p>
            )}
          </div>
          <button
            onClick={() => { setOpen(false); navigate("/admin/logs"); }}
            className="block w-full border-t border-white/10 px-5 py-3 text-center text-sm font-medium text-orange-400 transition hover:bg-orange-500/10"
          >
            View all activity
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const leave = async () => { await logout(); navigate("/login"); };
  return <div className="min-h-screen bg-[#080a0f] text-slate-100 admin-theme">
    {open && <button aria-label="Close navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/60 lg:hidden" />}
    <motion.aside initial={false} className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-[#0d1017]/95 backdrop-blur-xl transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-6"><NavLink to="/admin/dashboard" className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 font-black text-white">R</span><div><p className="font-semibold">RIT Control</p><p className="text-xs text-slate-500">Administration</p></div></NavLink><button onClick={() => setOpen(false)} className="lg:hidden"><X /></button></div>
      <nav className="space-y-1 p-4">{links.map(([label, to, Icon]) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({isActive}) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${isActive ? "bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon className="h-4 w-4" />{label}</NavLink>)}</nav>
      <button onClick={leave} className="absolute bottom-5 left-4 right-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400"><LogOut className="h-4 w-4" />Logout</button>
    </motion.aside>
    <div className="lg:pl-72">
      <MaintenanceBanner />
      <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-white/10 bg-[#080a0f]/80 px-4 backdrop-blur-xl sm:px-8"><button onClick={() => setOpen(true)} className="lg:hidden"><Menu /></button><div className="relative hidden max-w-lg flex-1 sm:block"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input onKeyDown={(e) => e.key === "Enter" && navigate(`/admin/listings?q=${encodeURIComponent(e.currentTarget.value)}`)} placeholder="Search listings, users, reports…" className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-orange-500/50" /></div><div className="ml-auto flex items-center gap-3"><NotificationsBell /><div className="hidden text-right sm:block"><p className="text-sm font-medium">{user?.displayName || "Administrator"}</p><p className="text-xs text-slate-500">{user?.email}</p></div><div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-rose-500 font-semibold">{(user?.displayName || user?.email || "A")[0].toUpperCase()}</div></div></header><main className="p-4 sm:p-8"><Outlet /></main></div>
  </div>;
}
