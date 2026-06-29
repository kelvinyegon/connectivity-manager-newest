import { useMemo, useState } from "react";
import { Plus, Download } from "lucide-react";
import { supabase } from "../supabaseClient";
import DataTable from "../components/DataTable";
import Filters from "../components/Filters";
import {
  CATEGORY_OPTIONS,
  PROJECT_OPTIONS,
  downloadCsv,
  toDatabaseRow,
} from "../utils";

const emptyForm = {
  region: "North Rift",
  county: "",
  subCounty: "",
  ward: "",
  zone: "",
  nemisCode: "",
  name: "",
  type: "PUBLIC",
  category: "",
  project: "",
  accessPointNumber: "",
  latitude: "",
  longitude: "",
  replacement: "",
  connectivityStatus: "",
  comments: "",
};

const textFields = [
  ["nemisCode", "Code", true],
  ["name", "Site name", true],
  ["region", "Region", false],
  ["county", "County", true],
  ["subCounty", "Subcounty", false],
  ["ward", "Ward", false],
  ["zone", "Zone", false],
  ["type", "Institution type", false],
  ["accessPointNumber", "Access Point number", false],
  ["latitude", "Latitude", false, "number"],
  ["longitude", "Longitude", false, "number"],
  ["replacement", "Replacement", false],
  ["connectivityStatus", "Connectivity status", false],
];

export default function Institutions({ data, setData, reloadData, admin = false }) {
  const [search, setSearch] = useState("");
  const [county, setCounty] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [project, setProject] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const filtered = useMemo(() => data.filter(row => {
    const haystack = [
      row.nemisCode,
      row.name,
      row.county,
      row.subCounty,
      row.ward,
      row.zone,
      row.category,
      row.project,
      row.accessPointNumber,
    ].join(" ").toLowerCase();

    return (!search || haystack.includes(search.toLowerCase()))
      && (!county || row.county === county)
      && (!status || row.connectivityStatus === status)
      && (!category || row.category === category)
      && (!project || row.project === project);
  }), [data, search, county, status, category, project]);

  function openNew() {
    setEditing("new");
    setForm(emptyForm);
    setFormError("");
  }

  function openEdit(row) {
    setEditing(row.id);
    setForm({ ...emptyForm, ...row });
    setFormError("");
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    const payload = toDatabaseRow(form);

    try {
      if (editing === "new") {
        const { error } = await supabase.from("institutions").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("institutions")
          .update(payload)
          .eq("id", editing);
        if (error) throw error;
      }

      if (reloadData) {
        await reloadData();
      } else if (editing === "new") {
        setData(previous => [{ ...form, id: Date.now() }, ...previous]);
      } else {
        setData(previous => previous.map(item => item.id === editing ? { ...form, id: editing } : item));
      }

      setEditing(null);
    } catch (error) {
      console.error("Unable to save site:", error);
      setFormError(error.message || "Unable to save the site record.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this site record? This action cannot be undone.")) return;

    const { error } = await supabase.from("institutions").delete().eq("id", id);

    if (error) {
      window.alert(`Unable to delete the site: ${error.message}`);
      return;
    }

    if (reloadData) await reloadData();
    else setData(previous => previous.filter(item => item.id !== id));
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h2>{admin ? "Site Management" : "Sites"}</h2>
          <p>{admin ? "Create, edit, review and remove connectivity site records." : "Search and review North Rift connectivity sites."}</p>
        </div>
        <div className="heading-actions">
          <button className="secondary-btn" onClick={() => downloadCsv(filtered)}><Download size={17} /> Export</button>
          {admin && <button className="primary-btn" onClick={openNew}><Plus size={17} /> Add site</button>}
        </div>
      </div>

      <div className="panel">
        <Filters
          {...{
            data,
            search,
            setSearch,
            county,
            setCounty,
            status,
            setStatus,
            category,
            setCategory,
            project,
            setProject,
          }}
        />
        <div className="result-count">{filtered.length.toLocaleString()} result(s)</div>
        <DataTable rows={filtered} admin={admin} onEdit={openEdit} onDelete={remove} />
      </div>

      {editing !== null && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={save}>
            <div className="modal-heading">
              <div>
                <h3>{editing === "new" ? "Add site" : "Edit site"}</h3>
                <p>AP means Access Point. Complete the site details below.</p>
              </div>
              <button type="button" onClick={() => setEditing(null)}>×</button>
            </div>

            {formError && <div className="alert error">{formError}</div>}

            <div className="form-grid">
              {textFields.map(([key, label, required, type = "text"]) => (
                <label key={key}>
                  {label}
                  <input
                    type={type}
                    step={type === "number" ? "any" : undefined}
                    value={form[key] ?? ""}
                    onChange={event => setForm(current => ({ ...current, [key]: event.target.value }))}
                    required={required}
                  />
                </label>
              ))}

              <label>
                Category
                <select value={form.category || ""} onChange={event => setForm(current => ({ ...current, category: event.target.value }))}>
                  <option value="">Select category</option>
                  {CATEGORY_OPTIONS.map(option => <option key={option}>{option}</option>)}
                </select>
              </label>

              <label>
                Project
                <select value={form.project || ""} onChange={event => setForm(current => ({ ...current, project: event.target.value }))}>
                  <option value="">Select project</option>
                  {PROJECT_OPTIONS.map(option => <option key={option}>{option}</option>)}
                </select>
              </label>

              <label className="full-width-field">
                Comments
                <textarea
                  rows="3"
                  value={form.comments || ""}
                  onChange={event => setForm(current => ({ ...current, comments: event.target.value }))}
                />
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
              <button className="primary-btn" disabled={saving}>{saving ? "Saving..." : "Save site"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
