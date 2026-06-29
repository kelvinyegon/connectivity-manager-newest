import { School, Wifi, CalendarClock, WifiOff } from "lucide-react";
import StatCard from "../components/StatCard";
import { normaliseStatus } from "../utils";

export default function UserOverview({ data }) {
  const count = status => data.filter(x => normaliseStatus(x.connectivityStatus) === status).length;
  return (
    <>
      <div className="portal-hero">
        <div><span className="eyebrow">North Rift Region</span><h2>Institution Connectivity Information Portal</h2><p>Explore the current connectivity status of schools and learning institutions across participating counties.</p></div>
      </div>
      <div className="stats-grid">
        <StatCard label="Institutions" value={data.length} detail="Available records" icon={School}/>
        <StatCard label="Connected" value={count("Connected")} detail="Currently connected" icon={Wifi}/>
        <StatCard label="Scheduled" value={count("Scheduled")} detail="Planned programmes" icon={CalendarClock}/>
        <StatCard label="Not connected" value={count("Not Connected")} detail="Proposed solutions" icon={WifiOff}/>
      </div>
      <div className="panel information-panel">
        <h3>How to use this portal</h3>
        <p>Use the Institutions page to search by institution name, NEMIS code, county or connectivity programme. The Map View displays records with valid coordinates. Portal users have read-only access and cannot modify the dataset.</p>
      </div>
    </>
  );
}
