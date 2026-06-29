import { useRef, useState } from "react";
import Papa from "papaparse";
import { UploadCloud, FileSpreadsheet, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "../supabaseClient";
import { mapCsvRow, toDatabaseRow } from "../utils";

export default function Uploads({ data, setData, reloadData }) {
  const inputRef = useRef();
  const [preview, setPreview] = useState([]);
  const [filename, setFilename] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [working, setWorking] = useState(false);

  function resetFile() {
    setPreview([]);
    setFilename("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    setMessage("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: result => {
        const mapped = result.data
          .map(mapCsvRow)
          .filter(item => item.name && item.nemisCode);

        setPreview(mapped);
        setMessageType("success");
        setMessage(`${mapped.length} valid site record(s) detected.`);
      },
      error: error => {
        setMessageType("error");
        setMessage(`Import failed: ${error.message}`);
      },
    });
  }

  async function importRows() {
    if (!preview.length) return;

    setWorking(true);
    setMessage("");

    const rows = preview.map(toDatabaseRow);
    const batchSize = 500;

    try {
      for (let start = 0; start < rows.length; start += batchSize) {
        const batch = rows.slice(start, start + batchSize);
        const { error } = await supabase
          .from("institutions")
          .upsert(batch, { onConflict: "institution_nemis_code" });

        if (error) throw error;
      }

      if (reloadData) await reloadData();
      else setData(previous => [...preview, ...previous]);

      setMessageType("success");
      setMessage(`${preview.length} site record(s) imported into Supabase successfully.`);
      resetFile();
    } catch (error) {
      console.error("CSV import failed:", error);
      setMessageType("error");
      setMessage(error.message || "CSV import failed.");
    } finally {
      setWorking(false);
    }
  }

  async function clearAll() {
    if (!window.confirm("Delete every site record from Supabase? This cannot be undone.")) return;

    setWorking(true);
    const { error } = await supabase.from("institutions").delete().not("id", "is", null);

    if (error) {
      setMessageType("error");
      setMessage(`Unable to delete records: ${error.message}`);
    } else {
      if (reloadData) await reloadData();
      else setData([]);
      setMessageType("success");
      setMessage("All site records were deleted.");
    }

    setWorking(false);
  }

  return (
    <>
      <div className="page-heading">
        <div><h2>Data Upload</h2><p>Import CSV datasets containing site, category, project and Access Point details.</p></div>
      </div>

      <div className="upload-grid">
        <div className="panel">
          <div className="panel-heading">
            <h3>Upload site data</h3>
            <p>Required CSV fields are Code and Site Name. Existing codes are updated rather than duplicated.</p>
          </div>

          <button className="drop-zone" onClick={() => inputRef.current?.click()} disabled={working}>
            <UploadCloud size={38} />
            <strong>Select a CSV file</strong>
            <span>Supported headings include Code, Site Name, County, Subcounty, Ward, Category, Project and Access Point No.</span>
          </button>

          <input ref={inputRef} hidden type="file" accept=".csv,text/csv" onChange={handleFile} />

          {filename && <div className="file-chip"><FileSpreadsheet size={18} /><span>{filename}</span></div>}
          {message && (
            <div className={`alert ${messageType}`}>
              {messageType === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              {message}
            </div>
          )}

          {preview.length > 0 && (
            <div className="upload-actions">
              <button className="secondary-btn" onClick={resetFile} disabled={working}>Cancel preview</button>
              <button className="primary-btn" onClick={importRows} disabled={working}>
                {working ? "Importing..." : `Import ${preview.length} records`}
              </button>
            </div>
          )}
        </div>

        <div className="panel danger-panel">
          <div className="panel-heading">
            <h3>Dataset maintenance</h3>
            <p>Supabase currently contains {data.length.toLocaleString()} record(s).</p>
          </div>
          <p>Deleting all records cannot be undone unless the CSV dataset is uploaded again.</p>
          <button className="danger-btn" onClick={clearAll} disabled={working}><Trash2 size={17} /> Delete all records</button>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="panel">
          <div className="panel-heading"><h3>Import preview</h3><p>First five parsed rows</p></div>
          <div className="preview-list">
            {preview.slice(0, 5).map(item => (
              <div key={item.id}>
                <strong>{item.name}</strong>
                <span>{item.nemisCode} · {item.county || "No county"} · {item.category || "No category"} · {item.project || "No project"} · AP {item.accessPointNumber || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
