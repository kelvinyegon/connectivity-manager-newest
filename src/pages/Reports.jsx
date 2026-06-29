import { Download, FileText } from "lucide-react";
import { downloadCsv, normaliseStatus } from "../utils";

export default function Reports({ data }) {
  const reports = [
    ["Complete site register", data],
    ["Connected sites", data.filter(item => normaliseStatus(item.connectivityStatus) === "Connected")],
    ["Scheduled sites", data.filter(item => normaliseStatus(item.connectivityStatus) === "Scheduled")],
    ["Not connected sites", data.filter(item => normaliseStatus(item.connectivityStatus) === "Not Connected")],
    ["Records missing coordinates", data.filter(item => item.latitude === "" || item.longitude === "")],
    ["Records missing Access Point number", data.filter(item => !item.accessPointNumber)],
    ["Records missing category", data.filter(item => !item.category)],
    ["Records missing project", data.filter(item => !item.project)],
  ];

  return (
    <>
      <div className="page-heading"><div><h2>Reports</h2><p>Generate downloadable CSV reports containing the complete site and Access Point fields.</p></div></div>
      <div className="report-grid">
        {reports.map(([name, rows]) => (
          <div className="report-card" key={name}>
            <div className="report-icon"><FileText size={23} /></div>
            <div><h3>{name}</h3><p>{rows.length.toLocaleString()} record(s)</p></div>
            <button className="icon-btn" onClick={() => downloadCsv(rows, `${name.toLowerCase().replaceAll(" ", "-")}.csv`)}><Download size={18} /></button>
          </div>
        ))}
      </div>
    </>
  );
}
