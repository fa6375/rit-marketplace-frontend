import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, orderBy, serverTimestamp, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Users, Tags, Flag, Star, Activity, HardDrive, Search, Trash2, EyeOff, Sparkles, Shield, Ban, Check, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../hooks/useCollection";
import { useCategories } from "../../hooks/useCategories";
import { Badge, Button, Empty, Input, PageHeader, Panel, StatCard, formatDate } from "../../components/admin/AdminUI";
import { bulkUpdateListings, deleteListing, deleteUserAccount, logAdminAction, updateListing, updateUser } from "../../services/adminService";

const dayKey = (timestamp) => timestamp?.toDate?.().toLocaleDateString(undefined, { month: "short", day: "numeric" }) || "Unknown";
const groupByDay = (items, field = "createdAt") => Object.entries(items.reduce((a, item) => { const key = dayKey(item[field]); a[key] = (a[key] || 0) + 1; return a; }, {})).map(([name, count]) => ({ name, count })).slice(-14);

export function AdminDashboard() {
  const { data: users } = useCollection("users"); const { data: listings } = useCollection("listings"); const { data: reports } = useCollection("reports"); const { data: logs } = useCollection("adminLogs", orderBy("timestamp", "desc"));
  const today = new Date().toDateString(); const todayListings = listings.filter((x) => x.createdAt?.toDate?.().toDateString() === today).length;
  const categories = Object.entries(listings.reduce((a,l) => { a[l.category] = (a[l.category] || 0) + 1; return a; }, {})).map(([name,value]) => ({name,value}));
  return <><PageHeader title="Dashboard" subtitle="A live view of your marketplace health." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total users" value={users.length} detail="Registered accounts" icon={Users}/><StatCard label="Total listings" value={listings.length} detail={`${todayListings} posted today`} icon={Tags}/><StatCard label="Pending reports" value={reports.filter(r => !r.status || r.status === "pending").length} detail="Require attention" icon={Flag}/><StatCard label="Featured" value={listings.filter(l=>l.featured).length} detail="Homepage placements" icon={Star}/><StatCard label="Active users" value={users.filter(u=>u.status !== "banned" && u.status !== "suspended").length} detail="Accounts in good standing" icon={Activity}/><StatCard label="Storage usage" value={`${listings.reduce((n,l)=>n+(l.imageSize||0),0)/1048576 < .1 ? "<0.1" : (listings.reduce((n,l)=>n+(l.imageSize||0),0)/1048576).toFixed(1)} MB`} detail="Tracked listing media" icon={HardDrive}/></div><div className="mt-6 grid gap-6 xl:grid-cols-3"><Panel className="p-5 xl:col-span-2"><h2 className="mb-5 font-medium">Listings over time</h2><ResponsiveContainer width="100%" height={280}><AreaChart data={groupByDay(listings)}><defs><linearGradient id="orange" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f97316" stopOpacity={.4}/><stop offset="1" stopColor="#f97316" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#ffffff0b"/><XAxis dataKey="name" stroke="#64748b" fontSize={11}/><YAxis stroke="#64748b" fontSize={11}/><Tooltip contentStyle={{background:"#11151d",border:"1px solid #ffffff1a",borderRadius:12}}/><Area type="monotone" dataKey="count" stroke="#f97316" fill="url(#orange)" strokeWidth={2}/></AreaChart></ResponsiveContainer></Panel><Panel className="p-5"><h2 className="mb-4 font-medium">Popular categories</h2><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={categories} dataKey="value" innerRadius={48} outerRadius={75}>{categories.map((_,i)=><Cell key={i} fill={["#f97316","#fb7185","#a78bfa","#38bdf8","#34d399"][i%5]}/>)}</Pie><Tooltip contentStyle={{background:"#11151d",border:"1px solid #ffffff1a"}}/></PieChart></ResponsiveContainer><div className="space-y-2">{categories.slice(0,4).map(c=><div className="flex justify-between text-sm" key={c.name}><span className="capitalize text-slate-400">{c.name}</span><span>{c.value}</span></div>)}</div></Panel></div><Panel className="mt-6"><div className="border-b border-white/10 p-5 font-medium">Recent activity</div>{logs.slice(0,6).map(log=><div key={log.id} className="flex items-center justify-between border-b border-white/5 px-5 py-4 text-sm"><div><span className="font-medium">{log.adminName}</span> <span className="text-slate-400">{log.action}</span></div><span className="text-xs text-slate-600">{formatDate(log.timestamp)}</span></div>)}{!logs.length&&<Empty/>}</Panel></>;
}

export function ListingsManager() {
  const { user } = useAuth(); const { data: listings } = useCollection("listings", orderBy("createdAt","desc")); const [search,setSearch]=useState(new URLSearchParams(location.search).get("q")||""); const [selected,setSelected]=useState([]); const [page,setPage]=useState(1); const size=10;
  const filtered=listings.filter(l=>[l.title,l.ownerName,l.ownerEmail,l.category].some(v=>v?.toLowerCase().includes(search.toLowerCase()))); const shown=filtered.slice((page-1)*size,page*size); const chosen=listings.filter(l=>selected.includes(l.id));
  const act=async(fn,success)=>{try{await fn();toast.success(success)}catch(e){toast.error(e.message)}};
  return <><PageHeader title="Listings" subtitle={`${listings.length} marketplace listings`} actions={<div className="flex gap-2"><Input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search listings…"/>{selected.length>0&&<><Button variant="secondary" onClick={()=>act(()=>bulkUpdateListings(user,chosen,{hidden:true},`Hid ${chosen.length} listings`),"Listings hidden")}><EyeOff className="inline h-4 w-4"/> Hide</Button><Button onClick={()=>act(()=>bulkUpdateListings(user,chosen,{featured:true},`Featured ${chosen.length} listings`),"Listings featured")}><Sparkles className="inline h-4 w-4"/> Feature</Button></>}</div>}/><Panel className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500"><tr><th className="p-4"><input type="checkbox" checked={shown.length>0&&shown.every(x=>selected.includes(x.id))} onChange={e=>setSelected(e.target.checked?shown.map(x=>x.id):[])}/></th>{["Image","Title / seller","Price","Category","Status","Created","Actions"].map(x=><th key={x} className="p-4">{x}</th>)}</tr></thead><tbody>{shown.map(l=><tr key={l.id} className="border-b border-white/5 hover:bg-white/[.02]"><td className="p-4"><input type="checkbox" checked={selected.includes(l.id)} onChange={()=>setSelected(s=>s.includes(l.id)?s.filter(x=>x!==l.id):[...s,l.id])}/></td><td className="p-4"><img src={l.imageUrl} alt="" className="h-11 w-14 rounded-lg object-cover bg-white/5"/></td><td className="p-4"><p className="font-medium">{l.title}</p><p className="text-xs text-slate-500">{l.ownerName||l.ownerEmail}</p></td><td className="p-4">${Number(l.price||0).toFixed(2)}</td><td className="p-4 capitalize">{l.category}</td><td className="p-4"><Badge tone={l.hidden?"red":l.featured?"orange":"emerald"}>{l.hidden?"Hidden":l.featured?"Featured":"Active"}</Badge></td><td className="p-4 text-slate-400">{formatDate(l.createdAt)}</td><td className="p-4"><div className="flex gap-1"><Button variant="secondary" onClick={()=>act(()=>updateListing(user,l.id,{hidden:!l.hidden},`${l.hidden?"Unhidden":"Hidden"} “${l.title}”`),"Listing updated")}>{l.hidden?<Check className="h-4 w-4"/>:<EyeOff className="h-4 w-4"/>}</Button><Button variant="secondary" onClick={()=>act(()=>updateListing(user,l.id,{featured:!l.featured},`${l.featured?"Unfeatured":"Featured"} “${l.title}”`),"Listing updated")}><Star className={`h-4 w-4 ${l.featured?"fill-orange-400 text-orange-400":""}`}/></Button><Button variant="danger" onClick={()=>window.confirm(`Delete ${l.title}?`)&&act(()=>deleteListing(user,l),"Listing deleted")}><Trash2 className="h-4 w-4"/></Button></div></td></tr>)}</tbody></table>{!shown.length&&<Empty>No matching listings.</Empty>}<div className="flex justify-between p-4"><span className="text-xs text-slate-500">Page {page} of {Math.max(1,Math.ceil(filtered.length/size))}</span><div className="space-x-2"><Button variant="secondary" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Previous</Button><Button variant="secondary" disabled={page>=Math.ceil(filtered.length/size)} onClick={()=>setPage(p=>p+1)}>Next</Button></div></div></Panel></>;
}

export function UsersManager(){const {user}=useAuth();const {data:users}=useCollection("users",orderBy("createdAt","desc"));const {data:listings}=useCollection("listings");const [search,setSearch]=useState("");const act=async(u,changes,label)=>{try{await updateUser(user,u.id,changes,`${label} ${u.displayName||u.email}`);toast.success("User updated")}catch(e){toast.error(e.message)}};const remove=async u=>{try{await deleteUserAccount(user,u.id,u.displayName||u.email);toast.success("User account deleted")}catch(e){toast.error(e.message)}};return <><PageHeader title="Users" subtitle="Manage roles and account access." actions={<Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users…"/>}/><Panel className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase text-slate-500"><tr>{["User","Joined","Role","Listings","Status","Actions"].map(x=><th className="p-4" key={x}>{x}</th>)}</tr></thead><tbody>{users.filter(u=>[u.displayName,u.email].some(v=>v?.toLowerCase().includes(search.toLowerCase()))).map(u=><tr key={u.id} className="border-b border-white/5"><td className="p-4"><div className="flex items-center gap-3"><img src={u.photoURL||`https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName||u.email)}`} alt="" className="h-9 w-9 rounded-full"/><div><p>{u.displayName||"Unnamed user"}</p><p className="text-xs text-slate-500">{u.email}</p></div></div></td><td className="p-4 text-slate-400">{formatDate(u.createdAt)}</td><td className="p-4"><Badge tone={u.role==="admin"?"orange":"slate"}>{u.role||"user"}</Badge></td><td className="p-4">{listings.filter(l=>l.ownerId===u.id).length}</td><td className="p-4"><Badge tone={u.status==="banned"?"red":u.status==="suspended"?"yellow":"emerald"}>{u.status||"active"}</Badge></td><td className="p-4"><div className="flex gap-1"><Button variant="secondary" disabled={u.id===user.uid} onClick={()=>act(u,{role:u.role==="admin"?"user":"admin"},u.role==="admin"?"Removed admin from":"Promoted") }><Shield className="h-4 w-4"/></Button><Button variant="secondary" onClick={()=>act(u,{status:u.status==="suspended"?"active":"suspended"},u.status==="suspended"?"Reactivated":"Suspended")}><Activity className="h-4 w-4"/></Button><Button variant="danger" disabled={u.id===user.uid} onClick={()=>act(u,{status:u.status==="banned"?"active":"banned"},u.status==="banned"?"Unbanned":"Banned")}><Ban className="h-4 w-4"/></Button><Button variant="danger" disabled={u.id===user.uid} onClick={()=>window.confirm(`Permanently delete ${u.email}?`)&&remove(u)}><Trash2 className="h-4 w-4"/></Button></div></td></tr>)}</tbody></table>{!users.length&&<Empty/>}</Panel></>}

export function ReportsManager(){const {user}=useAuth();const {data:reports}=useCollection("reports",orderBy("createdAt","desc"));const {data:listings}=useCollection("listings");const dismiss=async(r)=>{await updateDoc(doc(db,"reports",r.id),{status:"dismissed",resolvedAt:serverTimestamp()});await logAdminAction(user,"Dismissed report",{reportId:r.id});toast.success("Report dismissed")};const remove=async(r)=>{const listing=listings.find(l=>l.id===r.listingId);if(listing)await deleteListing(user,listing);await deleteDoc(doc(db,"reports",r.id));toast.success("Listing and report deleted")};return <><PageHeader title="Reports" subtitle="Review community safety reports."/><div className="grid gap-4">{reports.map(r=><Panel key={r.id} className="p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><div className="flex items-center gap-2"><Badge tone={r.status==="dismissed"?"slate":"red"}>{r.status||"pending"}</Badge><span className="text-xs text-slate-500">{formatDate(r.createdAt)}</span></div><h3 className="mt-3 font-medium">{r.reason||"Listing report"}</h3><p className="mt-1 text-sm text-slate-400">Reporter: {r.reporterName||r.reporterEmail||r.reporterId}</p><p className="text-sm text-slate-400">Listing: {r.listingTitle||r.listingId}</p></div><div className="flex items-center gap-2"><Button variant="secondary" onClick={()=>dismiss(r)}>Dismiss</Button><Button variant="danger" onClick={()=>window.confirm("Delete the reported listing?")&&remove(r)}>Delete listing</Button>{r.sellerId&&<Button variant="danger" onClick={()=>updateUser(user,r.sellerId,{status:"banned"},"Banned reported seller")}>Ban seller</Button>}</div></div></Panel>)}{!reports.length&&<Panel><Empty>No reports—everything is calm.</Empty></Panel>}</div></>}

export function CategoriesManager(){
  const {user}=useAuth();
  const {categories,loading,fromFirestore}=useCategories();
  const [name,setName]=useState("");
  const [editingId,setEditingId]=useState(null);
  const [editValue,setEditValue]=useState("");
  const [dragIndex,setDragIndex]=useState(null);
  const [seeding,setSeeding]=useState(false);

  // If the categories collection is empty, the UI used to show the built-in
  // fallback categories that don't exist in Firestore — editing them silently
  // did nothing. Seed the defaults into Firestore once so everything is editable.
  useEffect(()=>{
    if(loading||fromFirestore||seeding)return;
    (async()=>{
      setSeeding(true);
      try{
        const batch=writeBatch(db);
        categories.forEach((c,order)=>batch.set(doc(db,"categories",c.id),{name:c.name||c.label,order,createdAt:serverTimestamp()},{merge:true}));
        await batch.commit();
      }catch(e){toast.error(e.message)}
      finally{setSeeding(false)}
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[loading,fromFirestore]);

  const add=async()=>{
    if(!name.trim())return;
    const slug=name.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-");
    if(categories.some(c=>c.id===slug)){toast.error("That category already exists");return}
    try{
      await setDoc(doc(db,"categories",slug),{name:name.trim(),order:categories.length,createdAt:serverTimestamp()});
      await logAdminAction(user,`Added category “${name.trim()}”`);
      setName("");toast.success("Category added")
    }catch(e){toast.error(e.message)}
  };
  const remove=async(c)=>{
    try{
      await deleteDoc(doc(db,"categories",c.id));
      await logAdminAction(user,`Deleted category “${c.name||c.label}”`);
      toast.success("Category deleted")
    }catch(e){toast.error(e.message)}
  };
  const startEdit=(c)=>{setEditingId(c.id);setEditValue(c.name||c.label||"")};
  const saveEdit=async(c)=>{
    const next=editValue.trim();
    setEditingId(null);
    if(!next||next===(c.name||c.label))return;
    try{
      await setDoc(doc(db,"categories",c.id),{name:next},{merge:true});
      await logAdminAction(user,`Renamed category “${c.name||c.label}” to “${next}”`);
      toast.success("Category renamed")
    }catch(e){toast.error(e.message)}
  };
  const persistOrder=async(ordered)=>{
    try{
      const batch=writeBatch(db);
      ordered.forEach((c,order)=>batch.set(doc(db,"categories",c.id),{order},{merge:true}));
      await batch.commit();
      await logAdminAction(user,"Reordered categories");
    }catch(e){toast.error(e.message)}
  };
  const move=async(c,direction)=>{
    const i=categories.indexOf(c);const j=i+direction;
    if(j<0||j>=categories.length)return;
    const ordered=[...categories];[ordered[i],ordered[j]]=[ordered[j],ordered[i]];
    await persistOrder(ordered);
  };
  const onDrop=async(index)=>{
    if(dragIndex===null||dragIndex===index){setDragIndex(null);return}
    const ordered=[...categories];
    const [moved]=ordered.splice(dragIndex,1);
    ordered.splice(index,0,moved);
    setDragIndex(null);
    await persistOrder(ordered);
  };

  return <><PageHeader title="Categories" subtitle="Drag to reorder, click Edit to rename. Changes update listing forms and the homepage instantly." actions={<div className="flex gap-2"><Input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="New category"/><Button onClick={add}>Add category</Button></div>}/>
  <Panel>
    {seeding&&<div className="p-4 text-sm text-slate-500">Preparing categories…</div>}
    {categories.map((c,i)=>
      <div key={c.id}
        draggable
        onDragStart={()=>setDragIndex(i)}
        onDragOver={e=>e.preventDefault()}
        onDrop={()=>onDrop(i)}
        onDragEnd={()=>setDragIndex(null)}
        className={`flex items-center gap-4 border-b border-white/5 p-4 transition ${dragIndex===i?"opacity-40":""} ${dragIndex!==null&&dragIndex!==i?"outline-dashed outline-1 outline-white/10":""}`}>
        <GripVertical className="h-4 w-4 cursor-grab text-slate-600 active:cursor-grabbing"/>
        {editingId===c.id
          ? <Input autoFocus value={editValue} onChange={e=>setEditValue(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveEdit(c);if(e.key==="Escape")setEditingId(null)}} onBlur={()=>saveEdit(c)} className="flex-1"/>
          : <span className="flex-1 font-medium">{c.name||c.label}<span className="ml-2 text-xs text-slate-600">/{c.id}</span></span>}
        <Button variant="secondary" disabled={!i} onClick={()=>move(c,-1)}>↑</Button>
        <Button variant="secondary" disabled={i===categories.length-1} onClick={()=>move(c,1)}>↓</Button>
        {editingId===c.id
          ? <Button onClick={()=>saveEdit(c)}>Save</Button>
          : <Button variant="secondary" onClick={()=>startEdit(c)}>Edit</Button>}
        <Button variant="danger" onClick={()=>window.confirm("Delete this category?")&&remove(c)}>Delete</Button>
      </div>)}
    {!categories.length&&!seeding&&<Empty>No categories yet — add one above.</Empty>}
  </Panel></>
}

const settingsFields=[
  ['websiteName','Website name','RIT Marketplace','Shown in the navbar, footer and browser tab.'],
  ['homepageHeroText','Homepage hero text','Discover student listings.','The big headline on the homepage.'],
  ['announcement','Announcement banner','','Overrides the personalized greeting banner under the navbar. Leave empty to show the greeting + rotating quotes.'],
  ['supportEmail','Support email','support@example.com','Shown in the footer and on banned/suspended screens.'],
  ['maximumUploadSize','Maximum upload size (MB)','5','Largest image a user can attach to a listing.'],
  ['maximumListingsPerUser','Maximum listings per user','20','Users cannot post more active listings than this.'],
];
export function WebsiteSettings(){
  const {user}=useAuth();
  const {data}=useCollection("settings");
  const existing=data.find(x=>x.id==="website");
  const [form,setForm]=useState({});
  const [saving,setSaving]=useState(false);
  const value=(key,fallback)=>form[key]??existing?.[key]??fallback;
  const save=async(e)=>{
    e.preventDefault();
    setSaving(true);
    try{
      const payload=Object.fromEntries(settingsFields.map(([k,,fallback])=>[k,value(k,fallback)]));
      const upload=Number(payload.maximumUploadSize);
      const maxListings=Number(payload.maximumListingsPerUser);
      if(!payload.websiteName?.toString().trim()){toast.error("Website name cannot be empty");setSaving(false);return}
      if(!Number.isFinite(upload)||upload<=0){toast.error("Maximum upload size must be a positive number");setSaving(false);return}
      if(!Number.isFinite(maxListings)||maxListings<=0){toast.error("Maximum listings per user must be a positive number");setSaving(false);return}
      payload.maximumUploadSize=upload;
      payload.maximumListingsPerUser=maxListings;
      await setDoc(doc(db,"settings","website"),{...payload,updatedAt:serverTimestamp()},{merge:true});
      await logAdminAction(user,"Updated website settings",payload);
      toast.success("Settings saved — changes are live on the website")
    }catch(err){toast.error(err.message)}
    finally{setSaving(false)}
  };
  return <><PageHeader title="Website settings" subtitle="Every setting here is connected to the live website."/>
  <Panel className="p-6"><form onSubmit={save} className="grid gap-6 md:grid-cols-2">
    {settingsFields.map(([key,label,fallback,hint])=>
      <label key={key} className={key==="announcement"||key==="homepageHeroText"?"md:col-span-2":""}>
        <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
        <Input type={key.startsWith("maximum")?"number":"text"} min={key.startsWith("maximum")?1:undefined} value={value(key,fallback)} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} className="w-full"/>
        <span className="mt-1.5 block text-xs text-slate-600">{hint}</span>
      </label>)}
    <div className="md:col-span-2"><Button type="submit" disabled={saving}>{saving?"Saving…":"Save settings"}</Button></div>
  </form></Panel></>
}

export function MaintenanceManager(){const {user}=useAuth();const {data}=useCollection("settings");const config=data.find(x=>x.id==="maintenance")||{};const toggle=async()=>{await setDoc(doc(db,"settings","maintenance"),{enabled:!config.enabled,updatedAt:serverTimestamp(),updatedBy:user.uid},{merge:true});await logAdminAction(user,`${!config.enabled?"Enabled":"Disabled"} maintenance mode`);toast.success(`Maintenance ${!config.enabled?"enabled":"disabled"}`)};return <><PageHeader title="Maintenance" subtitle="Take the public marketplace offline instantly."/><Panel className="max-w-2xl p-7"><div className="flex items-center justify-between gap-6"><div><div className="flex items-center gap-2"><h2 className="text-lg font-medium">Maintenance mode</h2><Badge tone={config.enabled?"red":"emerald"}>{config.enabled?"Enabled":"Disabled"}</Badge></div><p className="mt-2 text-sm leading-6 text-slate-400">When enabled, regular users see the maintenance page. Administrators retain full access.</p></div><button onClick={toggle} className={`relative h-8 w-14 rounded-full transition ${config.enabled?"bg-orange-500":"bg-slate-700"}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${config.enabled?"left-7":"left-1"}`}/></button></div></Panel></>}

export function Analytics(){const {data:listings}=useCollection("listings");const {data:users}=useCollection("users");const sellerData=Object.entries(listings.reduce((a,l)=>{const k=l.ownerName||l.ownerEmail||"Unknown";a[k]=(a[k]||0)+1;return a},{})).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count).slice(0,8);const categoryData=Object.entries(listings.reduce((a,l)=>{a[l.category]=(a[l.category]||0)+(l.views||0);return a},{})).map(([name,count])=>({name,count}));const Chart=({title,data,color="#f97316"})=><Panel className="p-5"><h2 className="mb-4 font-medium">{title}</h2><ResponsiveContainer width="100%" height={270}><BarChart data={data}><CartesianGrid stroke="#ffffff0b"/><XAxis dataKey="name" stroke="#64748b" fontSize={10}/><YAxis stroke="#64748b" fontSize={10}/><Tooltip contentStyle={{background:"#11151d",border:"1px solid #ffffff1a"}}/><Bar dataKey="count" fill={color} radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></Panel>;return <><PageHeader title="Analytics" subtitle="Marketplace growth, engagement, and inventory signals."/><div className="grid gap-6 xl:grid-cols-2"><Chart title="Listings per day" data={groupByDay(listings)}/><Chart title="Users per day" data={groupByDay(users)} color="#38bdf8"/><Chart title="Most viewed categories" data={categoryData} color="#a78bfa"/><Chart title="Most active sellers" data={sellerData} color="#34d399"/></div></>}

export function AdminLogs(){const {data:logs}=useCollection("adminLogs",orderBy("timestamp","desc"));const [search,setSearch]=useState("");return <><PageHeader title="Admin logs" subtitle="An immutable audit trail of administrative actions." actions={<Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search activity…"/>}/><Panel>{logs.filter(l=>`${l.adminName} ${l.action}`.toLowerCase().includes(search.toLowerCase())).map(l=><div key={l.id} className="grid gap-2 border-b border-white/5 p-5 sm:grid-cols-[180px_1fr_130px]"><div><p className="text-sm font-medium">{l.adminName}</p><p className="text-xs text-slate-600">{l.adminEmail}</p></div><p className="text-sm text-slate-300">{l.action}</p><p className="text-xs text-slate-500 sm:text-right">{l.timestamp?.toDate?.().toLocaleString()||"Just now"}</p></div>)}{!logs.length&&<Empty>No admin actions yet.</Empty>}</Panel></>}
