import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Tags, Users, Flag, FolderKanban, BarChart3, Settings, Wrench, ScrollText, LogOut, Menu, Search, Bell, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const links = [
  ["Dashboard", "/admin/dashboard", LayoutDashboard], ["Listings", "/admin/listings", Tags],
  ["Users", "/admin/users", Users], ["Reports", "/admin/reports", Flag],
  ["Categories", "/admin/categories", FolderKanban], ["Analytics", "/admin/analytics", BarChart3],
  ["Website Settings", "/admin/settings", Settings], ["Maintenance", "/admin/maintenance", Wrench],
  ["Admin Logs", "/admin/logs", ScrollText],
];

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
    <div className="lg:pl-72"><header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-white/10 bg-[#080a0f]/80 px-4 backdrop-blur-xl sm:px-8"><button onClick={() => setOpen(true)} className="lg:hidden"><Menu /></button><div className="relative hidden max-w-lg flex-1 sm:block"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input onKeyDown={(e) => e.key === "Enter" && navigate(`/admin/listings?q=${encodeURIComponent(e.currentTarget.value)}`)} placeholder="Search listings, users, reports…" className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-orange-500/50" /></div><div className="ml-auto flex items-center gap-3"><button className="relative rounded-xl border border-white/10 p-2.5 text-slate-400"><Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-orange-500" /></button><div className="hidden text-right sm:block"><p className="text-sm font-medium">{user?.displayName || "Administrator"}</p><p className="text-xs text-slate-500">{user?.email}</p></div><div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-rose-500 font-semibold">{(user?.displayName || user?.email || "A")[0].toUpperCase()}</div></div></header><main className="p-4 sm:p-8"><Outlet /></main></div>
  </div>;
}
