import { School, Wifi, CalendarClock, WifiOff } from "lucide-react";
import StatCard from "../components/StatCard";
import { normaliseStatus } from "../utils";
import { PieChart, Pie, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function AdminDashboard({ data }) {
  const count = status => data.filter(x => normaliseStatus(x.connectivityStatus) === status).length;
  const pieData = ["Connected", "Scheduled", "Not Connected", "Other", "Unknown"]
    .map(name => ({ name, value: count(name) })).filter(x => x.value > 0);

  const countyData = Object.entries(data.reduce((acc, item) => {
    acc[item.county || "Unknown"] = (acc[item.county || "Unknown"] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value })).sort((a,b) => b.value-a.value).slice(0,8);

  return (
    <>
      <div className="page-heading"><div><h2>Dashboard</h2><p>Programme-wide overview and current connectivity position.</p></div></div>
      <div className="stats-grid">
        <StatCard label="Total institutions" value={data.length} detail="All uploaded records" icon={School}/>
        <StatCard label="Connected" value={count("Connected")} detail="Operational connectivity" icon={Wifi}/>
        <StatCard label="Scheduled" value={count("Scheduled")} detail="Planned or scheduled" icon={CalendarClock}/>
        <StatCard label="Not connected" value={count("Not Connected")} detail="Proposed interventions" icon={WifiOff}/>
      </div>
      <div className="chart-grid">
        <div className="panel">
          <div className="panel-heading"><h3>Connectivity distribution</h3><p>Classification based on programme status</p></div>
          <div className="chart-box"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label/><Tooltip/></PieChart></ResponsiveContainer></div>
        </div>
        <div className="panel">
          <div className="panel-heading"><h3>Institutions by county</h3><p>Top counties in the current dataset</p></div>
          <div className="chart-box"><ResponsiveContainer width="100%" height="100%"><BarChart data={countyData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name" tick={{fontSize:11}}/><YAxis/><Tooltip/><Bar dataKey="value"/></BarChart></ResponsiveContainer></div>
        </div>
      </div>
    </>
  );
}
