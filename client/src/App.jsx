import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, BookOpen, BriefcaseBusiness,
  ChartNoAxesCombined, Check, ChevronDown, CircleHelp, Download, GraduationCap,
  HeartPulse, LayoutDashboard, Menu, Plus, Search, Settings2, ShieldCheck,
  Sparkles, Users, X, MapPin, CalendarDays, MoreHorizontal, Leaf, Target, Pencil, Trash2
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const trend = [
 {month:"Apr", learners:118, sessions:72},{month:"May",learners:145,sessions:86},
 {month:"Jun",learners:160,sessions:91},{month:"Jul",learners:188,sessions:110},
 {month:"Aug",learners:207,sessions:128},{month:"Sep",learners:248,sessions:146}
];
const initialPrograms = [
 {_id:"p101",name:"Digital Learning Lab",category:"Education",district:"Ghaziabad",participants:248,target:300,status:"On track"},
 {_id:"p102",name:"STEM Explorers",category:"Education",district:"Lucknow",participants:176,target:220,status:"On track"},
 {_id:"p103",name:"Future Skills Club",category:"Livelihoods",district:"Jaipur",participants:94,target:150,status:"Needs attention"},
 {_id:"p104",name:"Community Health Connect",category:"Public Health",district:"Bhopal",participants:150,target:150,status:"Completed"}
];
const initialPeople = [
 {_id:"b101",name:"Aarav Sharma",age:12,district:"Ghaziabad",programme:"Digital Learning Lab",attendance:92,status:"Active"},
 {_id:"b102",name:"Meera Kumari",age:14,district:"Lucknow",programme:"STEM Explorers",attendance:78,status:"Needs support"},
 {_id:"b103",name:"Rohan Verma",age:11,district:"Jaipur",programme:"Digital Learning Lab",attendance:96,status:"Active"},
 {_id:"b104",name:"Sana Khan",age:13,district:"Ghaziabad",programme:"STEM Explorers",attendance:88,status:"Active"},
 {_id:"b105",name:"Priya Yadav",age:15,district:"Bhopal",programme:"Future Skills Club",attendance:100,status:"Completed"}
];
const nav = [
 {label:"Overview",icon:LayoutDashboard},{label:"Beneficiaries",icon:Users},
 {label:"Programmes",icon:BookOpen},{label:"Impact reports",icon:ChartNoAxesCombined}
];
const fmt = n => new Intl.NumberFormat("en-IN").format(n);
function Avatar({name,small=false}) {
 const colors=["#dbeafe","#fce7f3","#dcfce7","#fef3c7","#ede9fe"];
 const idx=(name?.charCodeAt(0)||0)%colors.length;
 return <span className={`avatar ${small?"small":""}`} style={{background:colors[idx]}}>{(name||"U").split(" ").map(x=>x[0]).slice(0,2).join("")}</span>;
}
function Pill({children,kind=""}) { return <span className={`pill ${kind}`}>{children}</span>; }
function App(){
 const [page,setPage]=useState("Overview"),[programs,setPrograms]=useState(initialPrograms),[people,setPeople]=useState(initialPeople);
 const [stats,setStats]=useState({beneficiaries:668,activePrograms:3,completionRate:82,attendance:91,activeBeneficiaries:3});
 const [search,setSearch]=useState(""),[filter,setFilter]=useState("All"),[modal,setModal]=useState(""),[mobileNav,setMobileNav]=useState(false);
 const [toast,setToast]=useState(""),[apiMode,setApiMode]=useState("Demo mode"),[busy,setBusy]=useState(false);
 const [personForm,setPersonForm]=useState({name:"",age:"",district:"",programme:"Digital Learning Lab",attendance:"0",status:"Active"});
 const [programForm,setProgramForm]=useState({name:"",category:"Education",district:"",target:"100"});
 const [editingPersonId,setEditingPersonId]=useState(null);
 useEffect(()=>{
  let alive=true;
  Promise.all([
   fetch(`${API}/programs`).then(r=>r.ok?r.json():Promise.reject()).catch(()=>null),
   fetch(`${API}/beneficiaries`).then(r=>r.ok?r.json():Promise.reject()).catch(()=>null),
   fetch(`${API}/stats`).then(r=>r.ok?r.json():Promise.reject()).catch(()=>null),
   fetch(`${API}/health`).then(r=>r.ok?r.json():Promise.reject()).catch(()=>null)
  ]).then(([p,b,s,h])=>{if(!alive)return;if(p)setPrograms(p);if(b)setPeople(b);if(s)setStats(s);if(h)setApiMode(h.database==="connected"?"MongoDB connected":"API demo mode");});
  return ()=>{alive=false};
 },[]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(""),2800);return()=>clearTimeout(t)},[toast]);
 const filteredPeople=useMemo(()=>people.filter(p=>([p.name,p.district,p.programme].join(" ").toLowerCase().includes(search.toLowerCase()))&&(filter==="All"||p.status===filter)),[people,search,filter]);
 const showToast=msg=>setToast(msg);
 function openEditPerson(person){
  setPersonForm({
   name:person.name||"",
   age:String(person.age??""),
   district:person.district||"",
   programme:person.programme||"",
   attendance:String(person.attendance??0),
   status:person.status||"Active"
  });
  setEditingPersonId(person._id);
  setModal("person");
 }
 async function addPerson(e){
  e.preventDefault();
  if(busy)return;
  setBusy(true);
  const payload={
   name:personForm.name.trim(),
   age:Number(personForm.age),
   district:personForm.district.trim(),
   programme:personForm.programme,
   attendance:editingPersonId?Number(personForm.attendance):0,
   status:editingPersonId?personForm.status:"Active"
  };
  try{
   const response=await fetch(`${API}/beneficiaries${editingPersonId?`/${editingPersonId}`:""}`,{
    method:editingPersonId?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data.message||`Request failed (${response.status}).`);
   if(editingPersonId){
    setPeople(current=>current.map(person=>person._id===editingPersonId?data:person));
    showToast("Beneficiary updated successfully.");
   }else{
    setPeople(current=>[data,...current]);
    showToast("Beneficiary added successfully.");
   }
   setModal("");
   setEditingPersonId(null);
   setPersonForm({name:"",age:"",district:"",programme:programs[0]?.name||"Digital Learning Lab",attendance:"0",status:"Active"});
  }catch(error){
   showToast(error.message||"Could not save beneficiary.");
  }finally{
   setBusy(false);
  }
 }
 async function deletePerson(person){
  const confirmed=window.confirm(`Delete beneficiary "${person.name}"? This action cannot be undone.`);
  if(!confirmed)return;
  try{
   const response=await fetch(`${API}/beneficiaries/${person._id}`,{method:"DELETE"});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data.message||`Delete failed (${response.status}).`);
   setPeople(current=>current.filter(item=>item._id!==person._id));
   showToast("Beneficiary deleted.");
  }catch(error){
   showToast(error.message||"Could not delete beneficiary.");
  }
 }
 async function addProgram(e){
  e.preventDefault();setBusy(true);const payload={...programForm,target:Number(programForm.target)};
  try{
   const r=await fetch(`${API}/programs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   if(r.ok){const rec=await r.json();setPrograms(p=>[rec,...p]);showToast("Programme created.");setModal("");setProgramForm({name:"",category:"Education",district:"",target:"100"});setBusy(false);return;}
   if(r.status!==404){const d=await r.json();throw new Error(d.message||"Could not save programme.");}
  }catch(err){if(err.message!=="Failed to fetch" && !err.message.includes("fetch")){showToast(err.message);setBusy(false);return;}}
  setPrograms(p=>[{_id:`local-${Date.now()}`,...payload,participants:0,status:"On track"},...p]);showToast("Programme added to this demo session.");setModal("");setBusy(false);
 }
 function exportCsv(){
  const headers=["Name","Age","District","Programme","Attendance","Status"];
  const rows=filteredPeople.map(p=>[p.name,p.age,p.district,p.programme,p.attendance,p.status]);
  const csv=[headers,...rows].map(row=>row.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\r\n");
  const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));const a=document.createElement("a");a.href=url;a.download="impactbridge-beneficiaries.csv";a.click();URL.revokeObjectURL(url);showToast("CSV report exported.");
 }
 const goTo=p=>{setPage(p);setMobileNav(false)};
 return <div className="app-shell">
  <aside className={`sidebar ${mobileNav?"open":""}`}>
   <div className="brand"><div className="brand-mark"><Leaf size={22}/></div><div><strong>impactbridge</strong><span>COMMUNITY IMPACT OS</span></div><button className="icon-btn mobile-close" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
   <div className="workspace"><span className="workspace-icon"><Sparkles size={16}/></span><div><b>Impact Collective</b><small>India · Field operations</small></div><ChevronDown size={15}/></div>
   <div className="nav-label">WORKSPACE</div>
   <nav>{nav.map(item=><button key={item.label} className={`nav-item ${page===item.label?"active":""}`} onClick={()=>goTo(item.label)}><item.icon size={18}/><span>{item.label}</span>{item.label==="Beneficiaries"&&<span className="nav-count">{people.length}</span>}</button>)}</nav>
   <div className="nav-label second-label">MANAGE</div>
   <button className="nav-item" onClick={()=>{setModal("program");setMobileNav(false)}}><Plus size={18}/><span>Create programme</span></button>
   <div className="sidebar-bottom">
    <div className="help-card"><div className="help-icon"><CircleHelp size={17}/></div><b>Need a hand?</b><p>Explore the demo and discover your impact.</p><button onClick={()=>showToast("Tip: add a fictional beneficiary or programme to explore the workflow.")}>Quick guide <span>↗</span></button></div>
    <div className="profile"><Avatar name="Kunal Singh"/><div className="profile-text"><b>Programme Admin</b><small>Demo workspace</small></div><MoreHorizontal size={18}/></div>
   </div>
  </aside>
  {mobileNav&&<div className="scrim" onClick={()=>setMobileNav(false)}/>}
  <main className="main-area">
   <header className="topbar"><div className="top-left"><button className="icon-btn menu-btn" onClick={()=>setMobileNav(true)}><Menu size={20}/></button><span className="breadcrumb">Workspace</span><span className="crumb-slash">/</span><b>{page}</b></div><div className="top-actions"><span className="live-status"><i/> {apiMode}</span><button className="icon-btn notification" onClick={()=>showToast("You're all caught up.")}><Bell size={18}/><i/></button><div className="top-divider"/><Avatar name="Kunal Singh" small/></div></header>
   <div className="page-content">
    {page==="Overview"&&<>
     <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-dot"/> YOUR IMPACT, AT A GLANCE</div><h1>Good morning, Kunal <span className="wave">✳</span></h1><p className="subtitle">Here’s what’s happening across your community programmes.</p></div><button className="btn btn-dark" onClick={()=>setModal("program")}><Plus size={17}/> New programme</button></section>
     <section className="hero-banner"><div className="hero-copy"><div className="hero-chip"><Sparkles size={13}/> IMPACT SPOTLIGHT</div><h2>Small actions.<br/><em>Lasting change.</em></h2><p>Every learner reached is a step toward a more equitable future. Keep building momentum.</p><button className="hero-link" onClick={()=>goTo("Impact reports")}>Explore your impact <span>↗</span></button></div><div className="hero-art"><div className="art-sun"/><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-person person-one"><div className="head"/><div className="body"/><div className="arm"/></div><div className="art-person person-two"><div className="head"/><div className="body"/><div className="arm"/></div><div className="art-book"><BookOpen size={31}/></div><div className="art-star star-one">✳</div><div className="art-star star-two">✦</div><div className="art-caption"><span className="caption-dot"/> Community first</div></div></section>
     <section className="metrics-grid">
      <Metric icon={Users} label="Learners reached" value={fmt(stats.beneficiaries||668)} change="+12.8%" note="vs. last month" tint="mint" up/>
      <Metric icon={BookOpen} label="Active programmes" value={fmt(stats.activePrograms||3)} change="+2" note="this quarter" tint="lavender" up/>
      <Metric icon={Target} label="Target progress" value={`${stats.completionRate||82}%`} change="+6.4%" note="vs. last month" tint="peach" up/>
      <Metric icon={Activity} label="Avg. attendance" value={`${stats.attendance||91}%`} change="-1.2%" note="vs. last month" tint="blue" />
     </section>
     <section className="dashboard-grid"><div className="panel chart-panel"><div className="panel-heading"><div><h3>Community reach</h3><p>Learning engagement over time</p></div><button className="select-pill" onClick={()=>goTo("Impact reports")}>Last 6 months <ChevronDown size={14}/></button></div><div className="chart-legend"><span><i className="legend-learners"/> Learners reached</span><span><i className="legend-sessions"/> Sessions completed</span></div><div className="area-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{top:10,right:8,left:-18,bottom:0}}><defs><linearGradient id="reachFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5b9a7d" stopOpacity={0.2}/><stop offset="100%" stopColor="#5b9a7d" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#edf0ed" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:"#929a95",fontSize:11}} dy={10}/><YAxis axisLine={false} tickLine={false} tick={{fill:"#929a95",fontSize:11}}/><Tooltip contentStyle={{borderRadius:12,border:"1px solid #e5e9e5",fontSize:12}}/><Area type="monotone" dataKey="learners" stroke="#34775c" strokeWidth={2.5} fill="url(#reachFill)" activeDot={{r:5}}/><Area type="monotone" dataKey="sessions" stroke="#d9a66d" strokeWidth={2} fill="none" strokeDasharray="5 4"/></AreaChart></ResponsiveContainer></div><div className="chart-foot"><span><i className="foot-dot"/> <b>+110%</b> learner reach since April</span><span>Illustrative demo data</span></div></div>
      <div className="panel programme-panel"><div className="panel-heading"><div><h3>Programme health</h3><p>Progress against targets</p></div><button className="dots-btn" onClick={()=>goTo("Programmes")}><MoreHorizontal size={19}/></button></div><div className="program-list">{programs.slice(0,4).map((p,i)=><div className="program-row" key={p._id}><div className={`program-symbol ps-${i%4}`}>{p.category==="Education"?<GraduationCap size={17}/>:p.category==="Livelihoods"?<BriefcaseBusiness size={17}/>:<HeartPulse size={17}/>}</div><div className="program-main"><div className="program-title-row"><b>{p.name}</b><span>{Math.min(100,Math.round(p.participants/(p.target||1)*100))}%</span></div><div className="progress-track"><span style={{width:`${Math.min(100,Math.round(p.participants/(p.target||1)*100))}%`}}/></div><small>{fmt(p.participants)} of {fmt(p.target)} participants</small></div></div>)}</div><button className="text-link" onClick={()=>goTo("Programmes")}>View all programmes <span>→</span></button></div></section>
     <section className="bottom-grid"><div className="panel activity-panel"><div className="panel-heading"><div><h3>Recent activity</h3><p>Latest updates from your field team</p></div><button className="text-link" onClick={()=>goTo("Beneficiaries")}>View all <span>→</span></button></div><div className="activity-list"><ActivityRow icon={Check} tint="green" title="Learning session completed" detail="Digital Learning Lab · Ghaziabad" time="12 min ago"/><ActivityRow icon={Users} tint="purple" title="New learner registered" detail="STEM Explorers · Lucknow" time="1 hr ago"/><ActivityRow icon={Target} tint="orange" title="Programme milestone reached" detail="Community Health Connect · Bhopal" time="3 hrs ago"/></div></div><div className="quote-panel"><div className="quote-mark">“</div><blockquote>When we measure what matters, we can make change that lasts.</blockquote><div className="quote-footer"><span className="quote-line"/><span>THE IMPACTBRIDGE PRINCIPLE</span></div><div className="quote-leaves"><Leaf size={68}/><Leaf size={42}/></div></div></section>
    </>}
    {page==="Beneficiaries"&&<><PageHeading eyebrow="PEOPLE AT THE HEART" title="Beneficiaries" subtitle="Manage learner records and follow programme participation." action={<button className="btn btn-dark" onClick={()=>setModal("person")}><Plus size={17}/> Add beneficiary</button>}/><section className="panel table-panel"><div className="table-toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, district, programme..."/></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Active</option><option>Needs support</option><option>Completed</option></select><button className="btn btn-light" onClick={exportCsv}><Download size={16}/> Export CSV</button></div><div className="table-wrap"><table><thead><tr><th>BENEFICIARY</th><th>DISTRICT</th><th>PROGRAMME</th><th>ATTENDANCE</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{filteredPeople.map(p=><tr key={p._id}><td><div className="person-cell"><Avatar name={p.name} small/><div><b>{p.name}</b><small>{p.age} years old</small></div></div></td><td><span className="district"><MapPin size={13}/>{p.district}</span></td><td>{p.programme}</td><td><div className="attendance-cell"><span>{p.attendance}%</span><div className="mini-track"><i style={{width:`${p.attendance}%`}}/></div></div></td><td><Pill kind={p.status==="Active"?"success":p.status==="Completed"?"neutral":"warning"}>{p.status}</Pill></td><td><div className="row-actions" style={{display:"flex",gap:8,flexWrap:"wrap"}}><button type="button" className="btn btn-light" title={`Edit ${p.name}`} onClick={()=>openEditPerson(p)}><Pencil size={14}/> Edit</button><button type="button" className="btn btn-light" title={`Delete ${p.name}`} onClick={()=>deletePerson(p)}><Trash2 size={14}/> Delete</button></div></td></tr>)}</tbody></table>{filteredPeople.length===0&&<div className="empty-state">No beneficiaries match your search.</div>}</div><div className="table-footer">Showing <b>{filteredPeople.length}</b> of {people.length} records <span>Fictional demonstration data</span></div></section></>}
    {page==="Programmes"&&<><PageHeading eyebrow="DELIVERING ON THE MISSION" title="Programmes" subtitle="Track delivery, participant targets and programme health." action={<button className="btn btn-dark" onClick={()=>setModal("program")}><Plus size={17}/> New programme</button>}/><div className="program-cards">{programs.map((p,i)=><div className="panel programme-card" key={p._id}><div className="program-card-top"><div className={`program-symbol ps-${i%4}`}>{p.category==="Education"?<GraduationCap/>:p.category==="Livelihoods"?<BriefcaseBusiness/>:<HeartPulse/>}</div><Pill kind={p.status==="Completed"?"success":p.status==="Needs attention"?"warning":"neutral"}>{p.status}</Pill></div><span className="card-category">{p.category.toUpperCase()}</span><h3>{p.name}</h3><div className="district"><MapPin size={13}/>{p.district}</div><div className="program-stats"><div><b>{fmt(p.participants)}</b><small>Participants</small></div><div><b>{fmt(p.target)}</b><small>Target</small></div><div><b>{Math.min(100,Math.round(p.participants/(p.target||1)*100))}%</b><small>Progress</small></div></div><div className="progress-track large"><span style={{width:`${Math.min(100,Math.round(p.participants/(p.target||1)*100))}%`}}/></div></div>)}</div><div className="note-banner"><ShieldCheck size={20}/><div><b>Built for accountable impact</b><p>Programme targets are illustrative. In a real deployment, reporting would include verified field submissions, timestamps and an audit trail.</p></div></div></>}
    {page==="Impact reports"&&<><PageHeading eyebrow="EVIDENCE FOR ACTION" title="Impact reports" subtitle="A snapshot of programme reach and engagement." action={<button className="btn btn-dark" onClick={exportCsv}><Download size={17}/> Export CSV</button>}/><section className="metrics-grid report-metrics"><Metric icon={Users} label="Total learners" value={fmt(stats.beneficiaries||668)} change="+12.8%" note="monthly trend" tint="mint" up/><Metric icon={CalendarDays} label="Sessions delivered" value="146" change="+18" note="since last month" tint="lavender" up/><Metric icon={Target} label="Target progress" value={`${stats.completionRate||82}%`} change="+6.4%" note="programme average" tint="peach" up/><Metric icon={ShieldCheck} label="Data coverage" value="100%" change="Demo" note="sample dataset" tint="blue"/></section><div className="panel report-chart-panel"><div className="panel-heading"><div><h3>Programme reach by month</h3><p>Illustrative cumulative reach and session activity</p></div><Pill kind="neutral">Apr – Sep 2026</Pill></div><div className="report-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={trend} barGap={7}><CartesianGrid stroke="#edf0ed" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:"#929a95",fontSize:12}} dy={10}/><YAxis axisLine={false} tickLine={false} tick={{fill:"#929a95",fontSize:12}}/><Tooltip contentStyle={{borderRadius:12,border:"1px solid #e5e9e5"}}/><Bar dataKey="learners" name="Learners" fill="#34775c" radius={[5,5,0,0]}/><Bar dataKey="sessions" name="Sessions" fill="#e6bd8e" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></div><div className="note-banner"><ShieldCheck size={20}/><div><b>Transparency note</b><p>All dashboard trend data is illustrative and does not represent official AIF results. Use verified records before making operational or funding decisions.</p></div></div></>}
    <footer className="page-footer"><span>© 2026 ImpactBridge</span><span><i/> Designed for meaningful change</span><span>Independent portfolio concept · Not an AIF product</span></footer>
   </div>
  </main>
  {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget){setModal("");setEditingPersonId(null)}}}><div className="modal"><div className="modal-head"><div><span className="eyebrow">IMPACTBRIDGE WORKSPACE</span><h2>{modal==="person"?(editingPersonId?"Edit beneficiary":"Add beneficiary"):"Create programme"}</h2><p>{modal==="person"?(editingPersonId?"Update this beneficiary’s details.":"Add a learner to a community programme."):"Set a target for a new community initiative."}</p></div><button className="icon-btn" onClick={()=>{setModal("");setEditingPersonId(null)}}><X size={19}/></button></div><form onSubmit={modal==="person"?addPerson:addProgram}><div className="form-grid">
   {modal==="person"?<><label>Full name<input required maxLength="100" placeholder="e.g. Asha Verma" value={personForm.name} onChange={e=>setPersonForm({...personForm,name:e.target.value})}/></label><label>Age<input required type="number" min="3" max="100" placeholder="12" value={personForm.age} onChange={e=>setPersonForm({...personForm,age:e.target.value})}/></label><label>District<input required maxLength="80" placeholder="e.g. Ghaziabad" value={personForm.district} onChange={e=>setPersonForm({...personForm,district:e.target.value})}/></label><label>Programme<select value={personForm.programme} onChange={e=>setPersonForm({...personForm,programme:e.target.value})}>{programs.map(p=><option key={p._id}>{p.name}</option>)}</select></label>{editingPersonId&&<><label>Attendance (%)<input type="number" min="0" max="100" required value={personForm.attendance??"0"} onChange={e=>setPersonForm({...personForm,attendance:e.target.value})}/></label><label>Status<select value={personForm.status||"Active"} onChange={e=>setPersonForm({...personForm,status:e.target.value})}><option>Active</option><option>Needs support</option><option>Completed</option></select></label></>}</>:<><label className="full-field">Programme name<input required maxLength="120" placeholder="e.g. Community Digital Lab" value={programForm.name} onChange={e=>setProgramForm({...programForm,name:e.target.value})}/></label><label>Category<select value={programForm.category} onChange={e=>setProgramForm({...programForm,category:e.target.value})}><option>Education</option><option>Livelihoods</option><option>Public Health</option></select></label><label>District<input required maxLength="80" placeholder="e.g. Lucknow" value={programForm.district} onChange={e=>setProgramForm({...programForm,district:e.target.value})}/></label><label className="full-field">Participant target<input required type="number" min="1" value={programForm.target} onChange={e=>setProgramForm({...programForm,target:e.target.value})}/></label></>}
   </div><div className="privacy-hint"><ShieldCheck size={16}/><span>Use fictional data only in this interview demo. Production systems need access controls and consent.</span></div><div className="modal-actions"><button type="button" className="btn btn-light" onClick={()=>{setModal("");setEditingPersonId(null)}}>Cancel</button><button className="btn btn-dark" disabled={busy}>{busy?"Saving…":<><Plus size={16}/> {modal==="person"?(editingPersonId?"Update beneficiary":"Add beneficiary"):"Create programme"}</>}</button></div></form></div></div>}
  {toast&&<div className="toast"><span><Check size={16}/></span>{toast}<button onClick={()=>setToast("")}><X size={15}/></button></div>}
 </div>;
}
function Metric({icon:Icon,label,value,change,note,tint,up=true}){return <div className="metric-card"><div className="metric-top"><span className={`metric-icon ${tint}`}><Icon size={19}/></span><span className={`metric-change ${up?"positive":"negative"}`}>{up?<ArrowUpRight size={14}/>:<ArrowDownRight size={14}/>} {change}</span></div><div className="metric-value">{value}</div><div className="metric-label">{label}</div><div className="metric-note">{note}</div></div>}
function ActivityRow({icon:Icon,tint,title,detail,time}){return <div className="activity-row"><span className={`activity-icon ${tint}`}><Icon size={16}/></span><div className="activity-copy"><b>{title}</b><small>{detail}</small></div><time>{time}</time></div>}
function PageHeading({eyebrow,title,subtitle,action}){return <section className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p className="subtitle">{subtitle}</p></div>{action}</section>}
export default App;
