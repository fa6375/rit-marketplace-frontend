import { useEffect, useState } from "react";
import { deleteDoc, doc, serverTimestamp, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Trash2, GripVertical, CheckCircle2, EyeOff, Check, Users, Heart, HandCoins, SearchCheck, Trophy, Phone } from "lucide-react";
import { toast } from "sonner";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../hooks/useCollection";
import { useLocations } from "../../hooks/useSocial";
import { Badge, Button, Empty, Input, PageHeader, Panel, StatCard, formatDate } from "../../components/admin/AdminUI";
import { logAdminAction } from "../../services/adminService";
import { DEFAULT_ACHIEVEMENTS, ACHIEVEMENT_METRICS } from "../../services/achievementsService";
import { notify } from "../../services/notificationsService";

/* -------------------------------------------------------------- */
/* Locations manager                                               */
/* -------------------------------------------------------------- */
export function LocationsManager() {
  const { user } = useAuth();
  const { locations, loading, fromFirestore } = useLocations();
  const [name, setName] = useState("");
  const [dragIndex, setDragIndex] = useState(null);
  const [seeding, setSeeding] = useState(false);

  // Seed defaults into Firestore once so every entry is editable (same
  // pattern as the categories manager).
  useEffect(() => {
    if (loading || fromFirestore || seeding) return;
    (async () => {
      setSeeding(true);
      try {
        const batch = writeBatch(db);
        locations.forEach((l, order) =>
          batch.set(doc(db, "locations", l.id), { name: l.name, order, createdAt: serverTimestamp() }, { merge: true })
        );
        await batch.commit();
      } catch (e) { toast.error(e.message); }
      finally { setSeeding(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, fromFirestore]);

  const add = async () => {
    if (!name.trim()) return;
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    if (locations.some((l) => l.id === slug)) { toast.error("That location already exists"); return; }
    try {
      await setDoc(doc(db, "locations", slug), { name: name.trim(), order: locations.length, createdAt: serverTimestamp() });
      await logAdminAction(user, `Added location "${name.trim()}"`);
      setName("");
      toast.success("Location added");
    } catch (e) { toast.error(e.message); }
  };
  const remove = async (l) => {
    try {
      await deleteDoc(doc(db, "locations", l.id));
      await logAdminAction(user, `Deleted location "${l.name}"`);
      toast.success("Location deleted");
    } catch (e) { toast.error(e.message); }
  };
  const persistOrder = async (ordered) => {
    try {
      const batch = writeBatch(db);
      ordered.forEach((l, order) => batch.set(doc(db, "locations", l.id), { order }, { merge: true }));
      await batch.commit();
      await logAdminAction(user, "Reordered locations");
    } catch (e) { toast.error(e.message); }
  };
  const onDrop = async (index) => {
    if (dragIndex === null || dragIndex === index) { setDragIndex(null); return; }
    const ordered = [...locations];
    const [moved] = ordered.splice(dragIndex, 1);
    ordered.splice(index, 0, moved);
    setDragIndex(null);
    await persistOrder(ordered);
  };

  return <><PageHeader title="Locations" subtitle="Pickup locations shown in listing forms and filters. Drag to reorder." actions={
    <div className="flex gap-2"><Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="New location" /><Button onClick={add}>Add location</Button></div>
  }/>
  <Panel>
    {seeding && <div className="p-4 text-sm text-slate-500">Preparing locations…</div>}
    {locations.map((l, i) =>
      <div key={l.id} draggable onDragStart={() => setDragIndex(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(i)} onDragEnd={() => setDragIndex(null)}
        className={`flex items-center gap-4 border-b border-white/5 p-4 transition ${dragIndex === i ? "opacity-40" : ""}`}>
        <GripVertical className="h-4 w-4 cursor-grab text-slate-600 active:cursor-grabbing" />
        <span className="flex-1 font-medium">{l.name}<span className="ml-2 text-xs text-slate-600">/{l.id}</span></span>
        <Button variant="danger" onClick={() => window.confirm("Delete this location?") && remove(l)}><Trash2 className="h-4 w-4" /></Button>
      </div>)}
    {!locations.length && !seeding && <Empty>No locations yet — add one above.</Empty>}
  </Panel></>;
}

/* -------------------------------------------------------------- */
/* Lost & Found moderation                                         */
/* -------------------------------------------------------------- */
export function LostFoundManager() {
  const { user } = useAuth();
  const { data: items } = useCollection("lostItems");
  const [filter, setFilter] = useState("all");
  const sorted = [...items].sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
  const visible = sorted.filter((it) => {
    if (filter === "missing") return (it.status || "missing") === "missing" && !it.hidden;
    if (filter === "found") return it.status === "found";
    if (filter === "hidden") return it.hidden;
    return true;
  });

  const act = async (fn, success) => { try { await fn(); toast.success(success); } catch (e) { toast.error(e.message); } };
  const markFound = (it) => act(async () => {
    await updateDoc(doc(db, "lostItems", it.id), { status: "found", foundAt: serverTimestamp(), updatedAt: serverTimestamp() });
    await logAdminAction(user, `Marked lost item "${it.title}" as found`);
    await notify(it.ownerId, { type: "lost-found", title: "Your lost item was marked as found", body: `"${it.title}" was marked as found by an administrator.`, link: "/lost-found" });
  }, "Marked as found");
  const toggleHide = (it) => act(async () => {
    await updateDoc(doc(db, "lostItems", it.id), { hidden: !it.hidden, updatedAt: serverTimestamp() });
    await logAdminAction(user, `${it.hidden ? "Unhid" : "Hid"} lost item "${it.title}"`);
  }, it.hidden ? "Post visible again" : "Post hidden");
  const remove = (it) => act(async () => {
    await deleteDoc(doc(db, "lostItems", it.id));
    await logAdminAction(user, `Deleted lost item "${it.title}"`);
  }, "Post deleted");

  return <><PageHeader title="Lost & Found" subtitle={`${items.length} community posts — moderate and resolve.`} actions={
    <div className="flex gap-2">{[["all","All"],["missing","Missing"],["found","Found"],["hidden","Hidden"]].map(([id,label]) =>
      <Button key={id} variant={filter === id ? "primary" : "secondary"} onClick={() => setFilter(id)}>{label}</Button>)}</div>
  }/>
  <div className="grid gap-4">
    {visible.map((it) => <Panel key={it.id} className="p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row">
        <div className="flex gap-4 min-w-0">
          {it.imageUrl && <img src={it.imageUrl} alt="" className="h-16 w-20 rounded-lg object-cover bg-white/5 shrink-0" />}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{it.title}</p>
              <Badge tone={it.status === "found" ? "emerald" : "orange"}>{it.status === "found" ? "Found" : "Missing"}</Badge>
              {it.hidden && <Badge tone="red">Hidden</Badge>}
              <span className="text-xs text-slate-500">{formatDate(it.createdAt)}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300 line-clamp-2">{it.description}</p>
            <p className="mt-2 text-xs text-slate-500">
              By {it.ownerName || "Unknown"}{it.ownerEmail && ` • ${it.ownerEmail}`} · Last seen: {it.lastSeenLocation || "—"} · Lost {it.dateLost || "—"}
              {it.phone && <span className="ml-2 inline-flex items-center gap-1"><Phone className="h-3 w-3" />{it.phone}</span>}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-stretch shrink-0">
          {(it.status || "missing") === "missing" && <Button onClick={() => markFound(it)}><CheckCircle2 className="inline h-4 w-4" /> Mark found</Button>}
          <Button variant="secondary" onClick={() => toggleHide(it)}>{it.hidden ? <Check className="inline h-4 w-4" /> : <EyeOff className="inline h-4 w-4" />} {it.hidden ? "Unhide" : "Hide"}</Button>
          <Button variant="danger" onClick={() => window.confirm(`Delete "${it.title}"?`) && remove(it)}><Trash2 className="inline h-4 w-4" /> Delete</Button>
        </div>
      </div>
    </Panel>)}
    {!visible.length && <Panel><Empty>No Lost & Found posts here.</Empty></Panel>}
  </div></>;
}

/* -------------------------------------------------------------- */
/* Achievements manager                                            */
/* -------------------------------------------------------------- */
export function AchievementsManager() {
  const { user } = useAuth();
  const { data: defs, loading } = useCollection("achievements");
  const { data: unlocks } = useCollection("userAchievements");
  const [form, setForm] = useState({ name: "", description: "", metric: "listings", threshold: "", emoji: "🏆" });
  const [seeding, setSeeding] = useState(false);
  const sorted = [...defs].sort((a, b) => (a.threshold || 0) - (b.threshold || 0));

  useEffect(() => {
    if (loading || defs.length || seeding) return;
    (async () => {
      setSeeding(true);
      try {
        const batch = writeBatch(db);
        DEFAULT_ACHIEVEMENTS.forEach((a) => batch.set(doc(db, "achievements", a.id), { ...a, enabled: true, createdAt: serverTimestamp() }, { merge: true }));
        await batch.commit();
      } catch (e) { toast.error(e.message); }
      finally { setSeeding(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, defs.length]);

  const add = async () => {
    const threshold = Number(form.threshold);
    if (!form.name.trim() || !Number.isFinite(threshold) || threshold <= 0) { toast.error("Give the achievement a name and a positive threshold"); return; }
    const slug = form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    if (defs.some((d) => d.id === slug)) { toast.error("An achievement with that name already exists"); return; }
    try {
      await setDoc(doc(db, "achievements", slug), {
        name: form.name.trim(), description: form.description.trim(), metric: form.metric,
        threshold, emoji: form.emoji || "🏆", enabled: true, createdAt: serverTimestamp(),
      });
      await logAdminAction(user, `Created achievement "${form.name.trim()}"`);
      setForm({ name: "", description: "", metric: "listings", threshold: "", emoji: "🏆" });
      toast.success("Achievement created");
    } catch (e) { toast.error(e.message); }
  };
  const toggle = async (a) => {
    try {
      await updateDoc(doc(db, "achievements", a.id), { enabled: a.enabled === false });
      await logAdminAction(user, `${a.enabled === false ? "Enabled" : "Disabled"} achievement "${a.name}"`);
      toast.success("Achievement updated");
    } catch (e) { toast.error(e.message); }
  };
  const remove = async (a) => {
    try {
      await deleteDoc(doc(db, "achievements", a.id));
      await logAdminAction(user, `Deleted achievement "${a.name}"`);
      toast.success("Achievement deleted");
    } catch (e) { toast.error(e.message); }
  };
  const metricLabel = (id) => ACHIEVEMENT_METRICS.find((m) => m.id === id)?.label || id;
  const unlockCount = (id) => unlocks.filter((u) => u.achievementId === id).length;

  return <><PageHeader title="Achievements" subtitle="Unlock automatically from real activity. Disable instead of deleting to keep earned badges." />
  <Panel className="mb-6 p-5">
    <div className="grid gap-3 md:grid-cols-5">
      <Input placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      <Input placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="md:col-span-2" />
      <select value={form.metric} onChange={(e) => setForm((f) => ({ ...f, metric: e.target.value }))}
        className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50">
        {ACHIEVEMENT_METRICS.map((m) => <option key={m.id} value={m.id} className="bg-[#0d1017]">{m.label}</option>)}
      </select>
      <div className="flex gap-2">
        <Input type="number" min={1} placeholder="Threshold" value={form.threshold} onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))} className="w-24" />
        <Input placeholder="🏆" maxLength={4} value={form.emoji} onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))} className="w-16 text-center" />
        <Button onClick={add}>Add</Button>
      </div>
    </div>
  </Panel>
  <Panel>
    {seeding && <div className="p-4 text-sm text-slate-500">Preparing default achievements…</div>}
    {sorted.map((a) => <div key={a.id} className="flex flex-wrap items-center gap-4 border-b border-white/5 p-4">
      <span className="text-xl w-8 text-center">{a.emoji || "🏆"}</span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{a.name} {a.enabled === false && <Badge tone="red">Disabled</Badge>}</p>
        <p className="text-xs text-slate-500">{a.description || "—"} · {metricLabel(a.metric)} ≥ {a.threshold} · unlocked by {unlockCount(a.id)} {unlockCount(a.id) === 1 ? "user" : "users"}</p>
      </div>
      <Button variant="secondary" onClick={() => toggle(a)}>{a.enabled === false ? "Enable" : "Disable"}</Button>
      <Button variant="danger" onClick={() => window.confirm(`Delete "${a.name}"? Users keep already-earned badges.`) && remove(a)}><Trash2 className="h-4 w-4" /></Button>
    </div>)}
    {!sorted.length && !seeding && <Empty>No achievements defined.</Empty>}
  </Panel></>;
}

/* -------------------------------------------------------------- */
/* Offers overview                                                 */
/* -------------------------------------------------------------- */
export function OffersManager() {
  const { data: offers } = useCollection("offers");
  const [filter, setFilter] = useState("all");
  const sorted = [...offers].sort((a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0));
  const visible = sorted.filter((o) => filter === "all" || o.status === filter);
  const open = offers.filter((o) => ["pending", "countered"].includes(o.status)).length;
  const accepted = offers.filter((o) => o.status === "accepted").length;
  const tone = { pending: "orange", countered: "yellow", accepted: "emerald", rejected: "red", expired: "slate", withdrawn: "slate" };
  return <><PageHeader title="Offers" subtitle="Every negotiation on the marketplace — read-only oversight." actions={
    <div className="flex flex-wrap gap-2">{["all","pending","countered","accepted","rejected","expired","withdrawn"].map((id) =>
      <Button key={id} variant={filter === id ? "primary" : "secondary"} onClick={() => setFilter(id)} className="capitalize">{id}</Button>)}</div>
  }/>
  <div className="mb-6 grid gap-4 sm:grid-cols-3">
    <StatCard label="Total offers" value={offers.length} detail="All time" icon={HandCoins} />
    <StatCard label="Open negotiations" value={open} detail="Pending or countered" icon={HandCoins} />
    <StatCard label="Accepted" value={accepted} detail={`${offers.length ? Math.round((accepted / offers.length) * 100) : 0}% acceptance rate`} icon={CheckCircle2} />
  </div>
  <Panel className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm">
    <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500"><tr>{["Listing","Buyer","Seller","Offer","Status","Updated"].map((x) => <th key={x} className="p-4">{x}</th>)}</tr></thead>
    <tbody>{visible.map((o) => <tr key={o.id} className="border-b border-white/5">
      <td className="p-4"><p className="font-medium">{o.listingTitle}</p><p className="text-xs text-slate-500">asking €{Number(o.listingPrice || 0).toLocaleString()}</p></td>
      <td className="p-4">{o.buyerName || "—"}</td>
      <td className="p-4">{o.sellerName || "—"}</td>
      <td className="p-4">€{Number(o.amount || 0).toLocaleString()}{o.counterAmount != null && <span className="text-xs text-slate-500"> / counter €{Number(o.counterAmount).toLocaleString()}</span>}</td>
      <td className="p-4"><Badge tone={tone[o.status] || "slate"}>{o.status}</Badge></td>
      <td className="p-4 text-slate-400">{formatDate(o.updatedAt)}</td>
    </tr>)}</tbody></table>
    {!visible.length && <Empty>No offers here.</Empty>}
  </Panel></>;
}

/* -------------------------------------------------------------- */
/* Community: follows, saves, achievement stats                    */
/* -------------------------------------------------------------- */
export function CommunityStats() {
  const { data: follows } = useCollection("follows");
  const { data: saves } = useCollection("saves");
  const { data: unlocks } = useCollection("userAchievements");
  const { data: lostItems } = useCollection("lostItems");
  const topSellers = Object.entries(follows.reduce((a, f) => { const k = f.sellerName || f.sellerId; a[k] = (a[k] || 0) + 1; return a; }, {}))
    .map(([name, count]) => ({ name: name?.slice(0, 14) || "Unknown", count })).sort((a, b) => b.count - a.count).slice(0, 8);
  const topSaved = Object.entries(saves.reduce((a, s) => { const k = s.listingTitle || s.listingId; a[k] = (a[k] || 0) + 1; return a; }, {}))
    .map(([name, count]) => ({ name: name?.slice(0, 14) || "Unknown", count })).sort((a, b) => b.count - a.count).slice(0, 8);
  const Chart = ({ title, data, color }) => <Panel className="p-5"><h2 className="mb-4 font-medium">{title}</h2>
    <ResponsiveContainer width="100%" height={260}><BarChart data={data}><CartesianGrid stroke="#ffffff0b" /><XAxis dataKey="name" stroke="#64748b" fontSize={10} /><YAxis stroke="#64748b" fontSize={10} allowDecimals={false} /><Tooltip contentStyle={{ background: "#11151d", border: "1px solid #ffffff1a" }} /><Bar dataKey="count" fill={color} radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></Panel>;
  return <><PageHeader title="Community" subtitle="Follows, wishlists, achievements, and Lost & Found at a glance." />
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard label="Total follows" value={follows.length} detail="Active follow relationships" icon={Users} />
    <StatCard label="Wishlist saves" value={saves.length} detail="Listings saved by users" icon={Heart} />
    <StatCard label="Achievements unlocked" value={unlocks.length} detail="Across all users" icon={Trophy} />
    <StatCard label="Lost & Found posts" value={lostItems.length} detail={`${lostItems.filter((i) => i.status === "found").length} recovered`} icon={SearchCheck} />
  </div>
  <div className="mt-6 grid gap-6 xl:grid-cols-2">
    <Chart title="Most followed sellers" data={topSellers} color="#a78bfa" />
    <Chart title="Most saved listings" data={topSaved} color="#fb7185" />
  </div></>;
}
