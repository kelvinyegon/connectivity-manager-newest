import { Pencil, Trash2, MapPin } from "lucide-react";
import { statusClass } from "../utils";

export default function DataTable({ rows, admin = false, onEdit, onDelete }) {
  const columnCount = admin ? 11 : 10;

  return (
    <div className="table-wrap wide-table">
      <table>
        <thead>
          <tr>
            <th>Code / Site Name</th>
            <th>County</th>
            <th>Subcounty / Ward</th>
            <th>Category</th>
            <th>Project</th>
            <th>AP No.</th>
            <th>Type</th>
            <th>Status</th>
            <th>Location</th>
            <th>Zone</th>
            {admin && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="empty-cell">No matching sites found.</td>
            </tr>
          ) : rows.map(row => (
            <tr key={row.id}>
              <td>
                <strong>{row.name || "Unnamed site"}</strong>
                <small><code>{row.nemisCode || "No code"}</code> · {row.region || "No region"}</small>
              </td>
              <td>{row.county || <span className="muted">Missing</span>}</td>
              <td>{row.subCounty || <span className="muted">Missing</span>}<small>{row.ward || "No ward"}</small></td>
              <td>{row.category || <span className="muted">Unspecified</span>}</td>
              <td>{row.project || <span className="muted">Unspecified</span>}</td>
              <td>{row.accessPointNumber || <span className="muted">—</span>}</td>
              <td>{row.type || <span className="muted">—</span>}</td>
              <td><span className={statusClass(row.connectivityStatus)}>{row.connectivityStatus || "Unknown"}</span></td>
              <td>
                {row.latitude !== "" && row.longitude !== ""
                  ? <span className="location-cell"><MapPin size={14} />{row.latitude}, {row.longitude}</span>
                  : <span className="muted">Missing</span>}
              </td>
              <td>{row.zone || <span className="muted">—</span>}</td>
              {admin && (
                <td>
                  <div className="action-row">
                    <button type="button" className="icon-btn" onClick={() => onEdit(row)} title="Edit"><Pencil size={16} /></button>
                    <button type="button" className="icon-btn danger" onClick={() => onDelete(row.id)} title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
