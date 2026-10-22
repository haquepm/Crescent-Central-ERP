"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, CalendarDays, ChevronDown,
  CircleAlert, ClipboardCheck, Clock3, Construction, Download, FileText,
  HardHat, IndianRupee, LayoutDashboard, MapPin, Package, Search, ShieldCheck,
  TrendingUp, Users, Wallet, Wrench
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, BarChart, Bar
} from "recharts";

type Project = {
  id: string; name: string; location: string; client: string; manager: string;
  status: "On Track" | "At Risk" | "Delayed"; progress: number; planned: number;
  contract: number; budget: number; actual: number; start: string; finish: string;
  daysLeft: number; cpi: number; spi: number; workforce: number; openIssues: number;
};

const projects: Project[] = [
  { id: "CC-001", name: "Crescent Crest", location: "Kombara, Aluva", client: "Crescent Developments", manager: "Project Manager", status: "At Risk", progress: 62.4, planned: 70, contract: 12.5, budget: 10.8, actual: 8.75, start: "01 Jan 2026", finish: "31 Dec 2026", daysLeft: 70, cpi: 0.92, spi: 0.88, workforce: 86, openIssues: 14 },
  { id: "CC-002", name: "Geojit IT Tower", location: "Kakkanad, Kochi", client: "Geojit Financial Services", manager: "Project Manager", status: "On Track", progress: 74, planned: 76, contract: 28.4, budget: 24.2, actual: 17.6, start: "15 Mar 2026", finish: "30 Jun 2027", daysLeft: 251, cpi: 1.04, spi: 0.97, workforce: 112, openIssues: 6 },
  { id: "CC-003", name: "Residential Block B", location: "Edappally, Kochi", client: "Private Client", manager: "Project Manager", status: "Delayed", progress: 38, planned: 55, contract: 8.6, budget: 7.9, actual: 5.1, start: "01 Feb 2026", finish: "30 Nov 2026", daysLeft: 39, cpi: 0.89, spi: 0.69, workforce: 48, openIssues: 19 },
];

const progressSeries = [
  { month: "May", planned: 28, actual: 25 }, { month: "Jun", planned: 36, actual: 31 },
  { month: "Jul", planned: 45, actual: 38 }, { month: "Aug", planned: 54, actual: 46 },
  { month: "Sep", planned: 63, actual: 55 }, { month: "Oct", planned: 70, actual: 62.4 },
];
const costSeries = [
  { month: "May", budget: 1.2, actual: 0.9 }, { month: "Jun", budget: 2.4, actual: 1.8 },
  { month: "Jul", budget: 3.7, actual: 2.9 }, { month: "Aug", budget: 5.1, actual: 4.0 },
  { month: "Sep", budget: 6.7, actual: 5.9 }, { month: "Oct", budget: 8.2, actual: 7.1 },
];
const money = (v: number) => "₹" + v.toFixed(2) + " Cr";
const statusClass = (s: Project["status"]) => s === "On Track" ? "good" : s === "At Risk" ? "warning" : "danger";

export default function Dashboard() {
  const [projectId, setProjectId] = useState(projects[0].id);
  const [range, setRange] = useState("This month");
  const [activeTab, setActiveTab] = useState("Overview");
  const [roomMode, setRoomMode] = useState(false);
  const project = useMemo(() => projects.find(p => p.id === projectId) ?? projects[0], [projectId]);
  const variance = project.progress - project.planned;

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Construction size={23}/></div><div><b>CRESCENT</b><span>CONTRACTORS</span></div></div>
        <div className="side-label">PROJECT WORKSPACE</div>
        {[
          [LayoutDashboard, "Overview"], [Activity, "Progress"], [Wallet, "Cost control"],
          [ClipboardCheck, "BOQ & quantities"], [Users, "Labour"], [Package, "Materials"],
          [Wrench, "Equipment"], [ShieldCheck, "Quality & safety"], [FileText, "Documents"]
        ].map(([Icon, label]: any) => (
          <button key={label} className={activeTab === label ? "nav-item active" : "nav-item"} onClick={() => setActiveTab(label)}>
            <Icon size={17}/><span>{label}</span>
          </button>
        ))}
        <div className="sidebar-bottom"><div className="avatar">CC</div><div><b>Project Workspace</b><span>Management view</span></div></div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div><div className="eyebrow">CRESCENT / PROJECT INTELLIGENCE</div><h1>Project Dashboard</h1></div>
          <div className="top-actions"><button className="room-launch" onClick={() => setRoomMode(true)}>▶ MD Room</button><span className="live"><i/> Demo data</span><button className="icon-btn" aria-label="Notifications"><Bell size={18}/><em>3</em></button><div className="user-chip"><div className="avatar small">CC</div><span>Management</span><ChevronDown size={14}/></div></div>
        </header>

        <section className="filters">
          <label><span>PROJECT</span><div className="select-wrap"><Construction size={16}/><select value={projectId} onChange={e => setProjectId(e.target.value)}>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><ChevronDown size={14}/></div></label>
          <label><span>REPORTING PERIOD</span><div className="select-wrap"><CalendarDays size={16}/><select value={range} onChange={e => setRange(e.target.value)}><option>This month</option><option>Last 30 days</option><option>Quarter to date</option><option>Year to date</option></select><ChevronDown size={14}/></div></label>
          <div className="filter-meta"><span>PROJECT ID</span><b>{project.id}</b><span className="divider-v"/><span>UPDATED</span><b>Sample · 22 Oct 2026</b></div>
        </section>

        {activeTab !== "Overview" && <div className="notice"><CircleAlert size={17}/> <div><b>{activeTab} module preview</b><span>This first implementation establishes the project dashboard shell. Detailed module records will be connected after the source systems and data permissions are confirmed.</span></div></div>}

        <section className="project-heading">
          <div><div className="project-kicker"><MapPin size={14}/>{project.location} <span>•</span> {project.client}</div><h2>{project.name}</h2><p>Project Manager: {project.manager} <span>·</span> {project.start} — {project.finish}</p></div>
          <div className={"status-pill " + statusClass(project.status)}><i/>{project.status}</div>
        </section>

        <section className="kpi-grid">
          <Kpi title="Physical progress" value={project.progress.toFixed(1) + "%"} note={"Planned " + project.planned + "%"} icon={<TrendingUp/>} tone="blue" trend={variance.toFixed(1) + " pp"} down={variance < 0}/>
          <Kpi title="Contract value" value={money(project.contract)} note="Approved contract value" icon={<IndianRupee/>} tone="navy"/>
          <Kpi title="Actual cost" value={money(project.actual)} note={"Budget " + money(project.budget)} icon={<Wallet/>} tone="green"/>
          <Kpi title="Cost performance (CPI)" value={project.cpi.toFixed(2)} note={project.cpi >= 1 ? "Within earned value" : "Cost pressure"} icon={<Activity/>} tone="amber" down={project.cpi < 1}/>
          <Kpi title="Schedule performance (SPI)" value={project.spi.toFixed(2)} note={project.spi >= 1 ? "Ahead of plan" : "Behind planned value"} icon={<Clock3/>} tone="purple" down={project.spi < 1}/>
          <Kpi title="Days remaining" value={String(project.daysLeft)} note="To planned completion" icon={<CalendarDays/>} tone="slate"/>
        </section>

        <section className="chart-grid">
          <article className="panel wide">
            <div className="panel-head"><div><h3>Planned vs actual progress</h3><p>Project cumulative progress · percentage</p></div><span className="legend"><i className="blue-dot"/> Planned <i className="green-dot"/> Actual</span></div>
            <div className="chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={progressSeries}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9eef4"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:"#8190a2",fontSize:11}}/><YAxis domain={[0,100]} axisLine={false} tickLine={false} tick={{fill:"#8190a2",fontSize:11}} tickFormatter={v => v+"%"}/><Tooltip formatter={(v:any) => v+"%"}/><Line type="monotone" dataKey="planned" name="Planned" stroke="#347fc1" strokeWidth={3} dot={{r:3}}/><Line type="monotone" dataKey="actual" name="Actual" stroke="#299b68" strokeWidth={3} dot={{r:3}}/></LineChart></ResponsiveContainer></div>
          </article>
          <article className="panel">
            <div className="panel-head"><div><h3>Budget vs actual cost</h3><p>₹ Crore · cumulative</p></div></div>
            <div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={costSeries}><defs><linearGradient id="budgetFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3a83c5" stopOpacity={0.2}/><stop offset="100%" stopColor="#3a83c5" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9eef4"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:"#8190a2",fontSize:10}}/><YAxis axisLine={false} tickLine={false} tick={{fill:"#8190a2",fontSize:10}}/><Tooltip/><Area type="monotone" dataKey="budget" name="Budget" stroke="#347fc1" fill="url(#budgetFill)" strokeWidth={2}/><Line type="monotone" dataKey="actual" name="Actual" stroke="#299b68" strokeWidth={2}/></AreaChart></ResponsiveContainer></div>
          </article>
        </section>

        <section className="lower-grid">
          <article className="panel">
            <div className="panel-head"><div><h3>Project health indicators</h3><p>Performance against baseline</p></div><span className="subtle-tag">EVM</span></div>
            <div className="health-list">
              <Health label="Schedule performance" value={project.spi} description={project.spi >= 1 ? "Ahead of schedule" : "Below baseline"} />
              <Health label="Cost performance" value={project.cpi} description={project.cpi >= 1 ? "Cost efficient" : "Cost pressure"} />
              <Health label="Physical progress" value={project.progress/100} description={project.progress >= project.planned ? "On baseline" : "Behind baseline"} />
            </div>
            <div className="health-foot"><span>Schedule variance</span><b className={variance < 0 ? "red-text" : "green-text"}>{variance > 0 ? "+" : ""}{variance.toFixed(1)} percentage points</b></div>
          </article>
          <article className="panel">
            <div className="panel-head"><div><h3>Site workforce</h3><p>Reported deployment · sample values</p></div><Users size={19} className="panel-icon"/></div>
            <div className="workforce-total">{project.workforce}<span> personnel</span></div>
            <div className="stacked-bar"><i style={{width:"78%"}}/><i style={{width:"14%"}}/><i style={{width:"8%"}}/></div>
            <div className="workforce-legend"><span><i className="green-dot"/> Present <b>78%</b></span><span><i className="blue-dot"/> Off-site <b>14%</b></span><span><i className="gray-dot"/> Absent <b>8%</b></span></div>
          </article>
          <article className="panel">
            <div className="panel-head"><div><h3>Open project actions</h3><p>Items requiring attention</p></div><span className="count-badge">{project.openIssues}</span></div>
            <div className="action-row"><span className="action-icon red"><CircleAlert size={16}/></span><div><b>Critical site issues</b><small>Pending resolution</small></div><strong>{Math.max(2,Math.round(project.openIssues*.28))}</strong></div>
            <div className="action-row"><span className="action-icon amber"><ClipboardCheck size={16}/></span><div><b>Inspections / NCRs</b><small>Awaiting closure</small></div><strong>{Math.max(1,Math.round(project.openIssues*.36))}</strong></div>
            <div className="action-row"><span className="action-icon blue"><FileText size={16}/></span><div><b>RFIs / clarifications</b><small>Awaiting response</small></div><strong>{Math.max(1,Math.round(project.openIssues*.22))}</strong></div>
          </article>
        </section>

        <section className="panel project-table">
          <div className="panel-head"><div><h3>Project portfolio</h3><p>Switch projects to inspect individual performance</p></div><button className="text-btn" onClick={() => setProjectId(projects[(projects.findIndex(p=>p.id===projectId)+1)%projects.length].id)}>Next project <ArrowUpRight size={14}/></button></div>
          <div className="table-wrap"><table><thead><tr><th>PROJECT</th><th>PROGRESS</th><th>CONTRACT VALUE</th><th>ACTUAL COST</th><th>HEALTH</th><th></th></tr></thead><tbody>{projects.map(p=><tr key={p.id} className={p.id===projectId?"selected-row":""} onClick={()=>setProjectId(p.id)}><td><b>{p.name}</b><small>{p.id} · {p.location}</small></td><td><div className="table-progress"><span>{p.progress}%</span><div><i style={{width:p.progress+"%"}}/></div></div></td><td>{money(p.contract)}</td><td>{money(p.actual)}</td><td><span className={"status-mini "+statusClass(p.status)}>{p.status}</span></td><td><ChevronDown size={15} className="rotate-icon"/></td></tr>)}</tbody></table></div>
        </section>

        <footer><span>© Crescent Contractors · Project Intelligence</span><span><i/> Prototype using sample data · Source integrations pending</span></footer>
      </section>
      {roomMode && <MDRoom onClose={() => setRoomMode(false)} />}
    </main>
  );
}

function MDRoom({ onClose }: { onClose: () => void }) {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [connection, setConnection] = useState("Awaiting live source connection");
  const [refreshCount, setRefreshCount] = useState(0);
  const slides = [
    { title: "Company overview", subtitle: "Executive snapshot across the Crescent portfolio", cards: [["Active projects","3"],["Combined contract value","₹49.50 Cr"],["Actual cost to date","₹31.45 Cr"],["Reported workforce","246"]], note: "Illustrative portfolio totals · ERP integration pending" },
    { title: "Project portfolio", subtitle: "Project status at a glance", cards: projects.map(p => [p.name, `${p.progress}% · ${p.status}`]), note: "Project records shown are demo values" },
    { title: "Financial overview", subtitle: "Contract value, budget and actual cost", cards: [["Contract value","₹49.50 Cr"],["Approved budget","₹42.90 Cr"],["Actual cost","₹31.45 Cr"],["Portfolio cost variance","Demo calculation"]], note: "Financial figures are illustrative, not accounting data" },
    { title: "Progress & schedule", subtitle: "Planned progress compared with actual delivery", cards: projects.map(p => [p.name, `${p.progress}% actual / ${p.planned}% planned`]), note: "Progress baselines must be connected to approved project updates" },
    { title: "Project performance", subtitle: "CPI and SPI indicators across projects", cards: projects.map(p => [p.name, `CPI ${p.cpi.toFixed(2)} · SPI ${p.spi.toFixed(2)}`]), note: "Earned-value figures are sample values" },
    { title: "Operations overview", subtitle: "Labour deployment and site operations", cards: [["Reported workforce","246"],["Materials","Awaiting ERP feed"],["Equipment","Awaiting ERP feed"],["Procurement","Awaiting ERP feed"]], note: "Operational source integrations pending" },
    { title: "Quality, safety & compliance", subtitle: "Quality inspections, NCRs and safety events", cards: [["Open NCRs","Awaiting data"],["Safety incidents","Awaiting data"],["Inspections","Awaiting data"],["Overdue closures","Awaiting data"]], note: "No quality or safety records are connected yet" },
    { title: "Upcoming activities & alerts", subtitle: "Milestones and management attention items", cards: [["Critical milestones","Awaiting schedule feed"],["Overdue approvals","Awaiting workflow feed"],["Open RFIs","Awaiting project feed"],["Management alerts","Awaiting live data"]], note: "Alert rules and responsible owners to be configured" },
  ];
  useEffect(() => {
    const refresh = async () => {
      try {
        const response = await fetch("/api/dashboard/summary", { cache: "no-store" });
        const data = await response.json();
        setConnection(data.connected ? "Live source connected" : "Live source not connected");
      } catch { setConnection("Dashboard API unavailable"); }
      setLastRefresh(new Date());
      setRefreshCount(n => n + 1);
    };
    void refresh();
    const poll = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(poll);
  }, []);
  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setSlide(i => (i + 1) % slides.length), 30_000);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") setSlide(i => (i + 1) % slides.length);
      if (event.key === "ArrowLeft") setSlide(i => (i - 1 + slides.length) % slides.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, slides.length]);
  const current = slides[slide];
  return <div className="md-room"><div className="md-room-top"><div className="md-brand"><span className="md-mark">C</span><div><b>CRESCENT CONTRACTORS</b><small>MANAGEMENT COMMAND CENTRE</small></div></div><div className="md-top-right"><span className="md-live"><i/> {connection}</span><span>{lastRefresh.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})} · refreshed {refreshCount}x</span><button onClick={onClose} aria-label="Exit MD Room">✕ Exit</button></div></div><div className="md-room-content"><div className="md-slide-label">EXECUTIVE INTELLIGENCE <span>SLIDE {String(slide+1).padStart(2,"0")} / 08</span></div><h1>{current.title}</h1><p className="md-subtitle">{current.subtitle}</p><div className="md-card-grid">{current.cards.map(([label,value])=><article className="md-metric" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div><div className="md-footnote">DEMO PREVIEW · {current.note}</div></div><div className="md-room-bottom"><div className="md-progress">{slides.map((item,i)=><button key={item.title} className={i===slide?"active":""} onClick={()=>setSlide(i)} aria-label={`Go to slide ${i+1}`}/>)}</div><div className="md-controls"><span>Auto-advance: 30 sec</span><span>Data refresh: 1 min</span><button onClick={()=>setSlide(i=>(i-1+slides.length)%slides.length)}>‹</button><button onClick={()=>setPaused(p=>!p)}>{paused?"▶ Resume":"Ⅱ Pause"}</button><button onClick={()=>setSlide(i=>(i+1)%slides.length)}>›</button></div></div></div>;
}

function Kpi({title,value,note,icon,tone,trend,down}:any) {
  return <article className="kpi-card"><div className={"kpi-icon "+tone}>{icon}</div><div className="kpi-title">{title}</div><div className="kpi-value">{value}</div><div className="kpi-note">{trend && <span className={down?"negative":"positive"}>{down?<ArrowDownRight size={13}/>:<ArrowUpRight size={13}/>} {trend}</span>}{note}</div></article>;
}
function Health({label,value,description}:any) {
  const pct=Math.min(100,Math.round(value*100));
  return <div className="health-item"><div className="health-label"><b>{label}</b><span>{description}</span></div><div className="meter"><i style={{width:pct+"%"}}/></div><strong>{value.toFixed(2)}</strong></div>;
}
