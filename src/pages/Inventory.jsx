import { useEffect, useMemo, useRef, useState } from "react";
import {
  Boxes,
  Cable,
  Download,
  Edit3,
  Network,
  Plus,
  Router,
  Search,
  Server,
  Trash2,
  BatteryCharging,
  X,
  UploadCloud,
} from "lucide-react";
import Papa from "papaparse";
import { supabase } from "../supabaseClient";

const equipmentTabs = [
  { key: "all", label: "All equipment", icon: Boxes },
  { key: "site_switch", label: "Site switches", icon: Server },
  { key: "access_switch", label: "Access switches", icon: Network },
  { key: "router", label: "Routers", icon: Router },
  { key: "ups", label: "UPS", icon: BatteryCharging },
  { key: "dwdm", label: "DWDM", icon: Cable },
  { key: "osn", label: "OSN", icon: Cable },
];

const typeLabels = {
  site_switch: "Site Switch",
  access_switch: "Access Switch",
  router: "Router",
  ups: "UPS",
  tx_equipment: "TX Equipment",
};

const emptyForm = {
  institutionId: "",
  equipmentType: "site_switch",
  txType: "",
  equipmentName: "",
  model: "",
  oem: "",
  serialNumber: "",
  quantity: "1",
  connectedRouterCount: "",
  upsCapacity: "",
  status: "Active",
  notes: "",
};

function mapInventoryRow(row) {
  return {
    id: row.id,
    institutionId: row.institution_id,
    equipmentType: row.equipment_type || "",
    txType: row.tx_type || "",
    equipmentName: row.equipment_name || "",
    model: row.model || "",
    oem: row.oem || "",
    serialNumber: row.serial_number || "",
    quantity: row.quantity ?? 1,
    connectedRouterCount: row.connected_router_count ?? "",
    upsCapacity: row.ups_capacity || "",
    status: row.status || "",
    notes: row.notes || "",
    createdAt: row.created_at || "",
  };
}

function toDatabaseRow(form) {
  return {
    institution_id: Number(form.institutionId),
    equipment_type: form.equipmentType,
    tx_type: form.equipmentType === "tx_equipment" ? form.txType || null : null,
    equipment_name: form.equipmentName.trim(),
    model: form.model.trim() || null,
    oem: form.oem.trim() || null,
    serial_number: form.serialNumber.trim() || null,
    quantity: Number(form.quantity) || 1,
    connected_router_count:
      form.equipmentType === "router" && form.connectedRouterCount !== ""
        ? Number(form.connectedRouterCount)
        : null,
    ups_capacity:
      form.equipmentType === "ups" ? form.upsCapacity.trim() || null : null,
    status: form.status || "Active",
    notes: form.notes.trim() || null,
  };
}

function displayType(item) {
  if (item.equipmentType === "tx_equipment") {
    return item.txType || "TX Equipment";
  }
  return typeLabels[item.equipmentType] || item.equipmentType;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export default function Inventory({ sites, admin = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const siteById = useMemo(
    () => new Map(sites.map(site => [Number(site.id), site])),
    [sites]
  );

  async function loadInventory() {
    setLoading(true);
    setLoadError("");

    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Inventory loading error:", error);
      setLoadError(error.message || "Unable to load inventory.");
      setItems([]);
    } else {
      setItems((data || []).map(mapInventoryRow));
    }

    setLoading(false);
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items.filter(item => {
      const site = siteById.get(Number(item.institutionId));
      const matchesTab =
        activeTab === "all" ||
        item.equipmentType === activeTab ||
        (item.equipmentType === "tx_equipment" && item.txType?.toLowerCase() === activeTab);

      const matchesSite = !siteFilter || String(item.institutionId) === siteFilter;
      const haystack = [
        site?.name,
        site?.nemisCode,
        item.equipmentName,
        item.model,
        item.oem,
        item.serialNumber,
        displayType(item),
        item.status,
      ]
        .join(" ")
        .toLowerCase();

      return matchesTab && matchesSite && (!term || haystack.includes(term));
    });
  }, [items, siteById, activeTab, siteFilter, search]);

  const counts = useMemo(() => {
    const output = { all: items.length };
    equipmentTabs.slice(1).forEach(tab => {
      output[tab.key] = items.filter(item =>
        item.equipmentType === tab.key ||
        (item.equipmentType === "tx_equipment" && item.txType?.toLowerCase() === tab.key)
      ).length;
    });
    return output;
  }, [items]);

  function openNew() {
    setEditing("new");
    setForm({ ...emptyForm, institutionId: sites[0]?.id ? String(sites[0].id) : "" });
    setFormError("");
  }

  function openEdit(item) {
    setEditing(item.id);
    setForm({
      ...emptyForm,
      ...item,
      institutionId: String(item.institutionId),
      quantity: String(item.quantity ?? 1),
      connectedRouterCount:
        item.connectedRouterCount === null || item.connectedRouterCount === undefined
          ? ""
          : String(item.connectedRouterCount),
    });
    setFormError("");
  }

  async function save(event) {
    event.preventDefault();
    setFormError("");

    if (!form.institutionId) {
      setFormError("Select the site that owns this equipment.");
      return;
    }

    if (form.equipmentType === "tx_equipment" && !form.txType) {
      setFormError("Choose DWDM or OSN for TX equipment.");
      return;
    }

    setSaving(true);
    const payload = toDatabaseRow(form);

    const query =
      editing === "new"
        ? supabase.from("inventory_items").insert(payload)
        : supabase.from("inventory_items").update(payload).eq("id", editing);

    const { error } = await query;

    if (error) {
      console.error("Inventory save error:", error);
      setFormError(error.message || "Unable to save inventory equipment.");
      setSaving(false);
      return;
    }

    await loadInventory();
    setEditing(null);
    setSaving(false);
  }

  async function remove(item) {
    const label = item.equipmentName || displayType(item);
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;

    const { error } = await supabase.from("inventory_items").delete().eq("id", item.id);
    if (error) {
      window.alert(`Unable to delete equipment: ${error.message}`);
      return;
    }

    await loadInventory();
  }


  async function importCsv(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async result => {
        try {
          const siteByCode = new Map(
            sites.map(site => [String(site.nemisCode || "").trim().toLowerCase(), site])
          );

          const normalise = row => {
            const get = (...keys) => {
              for (const key of keys) {
                const match = Object.keys(row).find(
                  column => column.trim().toLowerCase() === key.toLowerCase()
                );
                if (match && row[match] !== undefined) return String(row[match]).trim();
              }
              return "";
            };

            const siteCode = get("Site Code", "Code", "NEMIS", "Institution NEMIS Code");
            const site = siteByCode.get(siteCode.toLowerCase());
            const rawType = get("Equipment Type", "Type").toLowerCase();
            const typeMap = {
              "site switch": "site_switch",
              "site_switch": "site_switch",
              "access switch": "access_switch",
              "access_switch": "access_switch",
              "router": "router",
              "ups": "ups",
              "dwdm": "tx_equipment",
              "osn": "tx_equipment",
              "tx equipment": "tx_equipment",
              "tx_equipment": "tx_equipment",
            };
            const equipmentType = typeMap[rawType];
            const txType = rawType === "dwdm" ? "DWDM" : rawType === "osn" ? "OSN" : get("TX Type", "TX Equipment").toUpperCase();

            if (!site || !equipmentType) return null;

            return {
              institution_id: Number(site.id),
              equipment_type: equipmentType,
              tx_type: equipmentType === "tx_equipment" ? txType || null : null,
              equipment_name: get("Equipment Name", "Name") || get("Equipment Type", "Type"),
              model: get("Model") || null,
              oem: get("OEM", "Manufacturer") || null,
              serial_number: get("Serial Number", "Serial No", "Serial") || null,
              quantity: Number(get("Quantity")) || 1,
              connected_router_count: get("Connected Routers", "Number of Routers Connected") !== ""
                ? Number(get("Connected Routers", "Number of Routers Connected"))
                : null,
              ups_capacity: get("UPS Capacity", "Capacity") || null,
              status: get("Status") || "Active",
              notes: get("Notes", "Comments") || null,
            };
          };

          const rows = result.data.map(normalise).filter(Boolean);
          if (!rows.length) {
            throw new Error("No valid inventory rows were found. Check Site Code and Equipment Type headings.");
          }

          const withSerial = rows.filter(row => row.serial_number);
          const withoutSerial = rows.filter(row => !row.serial_number);

          if (withSerial.length) {
            const { error } = await supabase
              .from("inventory_items")
              .upsert(withSerial, { onConflict: "serial_number" });
            if (error) throw error;
          }

          if (withoutSerial.length) {
            const { error } = await supabase.from("inventory_items").insert(withoutSerial);
            if (error) throw error;
          }

          await loadInventory();
          window.alert(`${rows.length} inventory record(s) imported successfully.`);
        } catch (error) {
          console.error("Inventory import error:", error);
          window.alert(`Unable to import inventory: ${error.message}`);
        } finally {
          setImporting(false);
        }
      },
      error: error => {
        window.alert(`Unable to read CSV: ${error.message}`);
        setImporting(false);
      },
    });
  }

  function exportCsv() {
    const headings = [
      "Site Code",
      "Site Name",
      "Equipment Type",
      "Equipment Name",
      "Model",
      "OEM",
      "Serial Number",
      "Quantity",
      "Connected Routers",
      "UPS Capacity",
      "Status",
      "Notes",
    ];

    const rows = filteredItems.map(item => {
      const site = siteById.get(Number(item.institutionId));
      return [
        site?.nemisCode || "",
        site?.name || "",
        displayType(item),
        item.equipmentName,
        item.model,
        item.oem,
        item.serialNumber,
        item.quantity,
        item.connectedRouterCount,
        item.upsCapacity,
        item.status,
        item.notes,
      ];
    });

    const csv = [headings, ...rows].map(row => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "north-rift-inventory.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Inventory</h2>
          <p>
            {admin
              ? "Manage network equipment assigned to each connectivity site."
              : "Review network equipment assigned to each connectivity site."}
          </p>
        </div>
        <div className="heading-actions">
          {admin && (
            <>
              <input ref={fileInputRef} hidden type="file" accept=".csv,text/csv" onChange={importCsv} />
              <button className="secondary-btn" onClick={() => fileInputRef.current?.click()} disabled={importing}>
                <UploadCloud size={17} /> {importing ? "Importing..." : "Import CSV"}
              </button>
            </>
          )}
          <button className="secondary-btn" onClick={exportCsv} disabled={!filteredItems.length}>
            <Download size={17} /> Export
          </button>
          {admin && (
            <button className="primary-btn" onClick={openNew}>
              <Plus size={17} /> Add equipment
            </button>
          )}
        </div>
      </div>

      <div className="inventory-tabs" role="tablist" aria-label="Inventory types">
        {equipmentTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={activeTab === tab.key ? "inventory-tab active" : "inventory-tab"}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon size={17} />
              <span>{tab.label}</span>
              <strong>{counts[tab.key] || 0}</strong>
            </button>
          );
        })}
      </div>

      <div className="panel">
        <div className="inventory-filters">
          <label className="search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search model, OEM, serial number, site..."
            />
          </label>

          <select value={siteFilter} onChange={event => setSiteFilter(event.target.value)}>
            <option value="">All sites</option>
            {sites.map(site => (
              <option key={site.id} value={site.id}>
                {site.name} ({site.nemisCode})
              </option>
            ))}
          </select>
        </div>

        {loadError && (
          <div className="alert error inventory-error">
            <strong>Inventory database setup is required.</strong>
            <span>{loadError}</span>
            <span>Run the included supabase-inventory-migration.sql file in Supabase SQL Editor.</span>
          </div>
        )}

        {loading ? (
          <div className="empty-state">Loading inventory...</div>
        ) : !loadError && filteredItems.length === 0 ? (
          <div className="empty-state">
            <Boxes size={36} />
            <h3>No equipment found</h3>
            <p>{admin ? "Add the first equipment record for a site." : "No inventory records match the selected filters."}</p>
          </div>
        ) : !loadError ? (
          <div className="table-wrap inventory-table-wrap">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Equipment</th>
                  <th>Model</th>
                  <th>OEM</th>
                  <th>Serial number</th>
                  <th>Details</th>
                  <th>Status</th>
                  {admin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const site = siteById.get(Number(item.institutionId));
                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{site?.name || "Unknown site"}</strong>
                        <span>{site?.nemisCode || `Site #${item.institutionId}`}</span>
                      </td>
                      <td>
                        <strong>{item.equipmentName || displayType(item)}</strong>
                        <span>{displayType(item)}</span>
                      </td>
                      <td>{item.model || "—"}</td>
                      <td>{item.oem || "—"}</td>
                      <td><code>{item.serialNumber || "—"}</code></td>
                      <td>
                        {item.equipmentType === "router" && (
                          <span>{item.connectedRouterCount || 0} router(s) connected</span>
                        )}
                        {item.equipmentType === "ups" && (
                          <span>{item.upsCapacity || "Capacity not recorded"}</span>
                        )}
                        {item.equipmentType === "tx_equipment" && (
                          <span>TX: {item.txType || "Not specified"}</span>
                        )}
                        {!["router", "ups", "tx_equipment"].includes(item.equipmentType) && (
                          <span>Quantity: {item.quantity || 1}</span>
                        )}
                      </td>
                      <td><span className={`inventory-status ${item.status?.toLowerCase().replaceAll(" ", "-")}`}>{item.status || "—"}</span></td>
                      {admin && (
                        <td>
                          <div className="table-actions">
                            <button onClick={() => openEdit(item)} aria-label="Edit equipment"><Edit3 size={16} /></button>
                            <button className="delete" onClick={() => remove(item)} aria-label="Delete equipment"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {editing !== null && (
        <div className="modal-backdrop">
          <form className="modal inventory-modal" onSubmit={save}>
            <div className="modal-heading">
              <div>
                <h3>{editing === "new" ? "Add inventory equipment" : "Edit inventory equipment"}</h3>
                <p>Link the equipment to a site and record its technical details.</p>
              </div>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close"><X size={20} /></button>
            </div>

            {formError && <div className="alert error">{formError}</div>}

            <div className="form-grid">
              <label className="full-width-field">
                Site
                <select
                  value={form.institutionId}
                  onChange={event => setForm(current => ({ ...current, institutionId: event.target.value }))}
                  required
                >
                  <option value="">Select site</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>{site.name} ({site.nemisCode})</option>
                  ))}
                </select>
              </label>

              <label>
                Equipment type
                <select
                  value={form.equipmentType}
                  onChange={event => {
                    const equipmentType = event.target.value;
                    setForm(current => ({
                      ...current,
                      equipmentType,
                      txType: equipmentType === "tx_equipment" ? current.txType : "",
                    }));
                  }}
                >
                  <option value="site_switch">Site Switch</option>
                  <option value="access_switch">Access Switch</option>
                  <option value="router">Router</option>
                  <option value="ups">UPS</option>
                  <option value="tx_equipment">TX Equipment</option>
                </select>
              </label>

              {form.equipmentType === "tx_equipment" && (
                <label>
                  TX equipment
                  <select value={form.txType} onChange={event => setForm(current => ({ ...current, txType: event.target.value }))} required>
                    <option value="">Select DWDM or OSN</option>
                    <option value="DWDM">DWDM</option>
                    <option value="OSN">OSN</option>
                  </select>
                </label>
              )}

              <label>
                Equipment name
                <input
                  value={form.equipmentName}
                  onChange={event => setForm(current => ({ ...current, equipmentName: event.target.value }))}
                  placeholder="Example: Site 1 Switch"
                  required
                />
              </label>

              <label>
                Model
                <input value={form.model} onChange={event => setForm(current => ({ ...current, model: event.target.value }))} />
              </label>

              <label>
                OEM / Manufacturer
                <input value={form.oem} onChange={event => setForm(current => ({ ...current, oem: event.target.value }))} />
              </label>

              <label>
                Serial number
                <input value={form.serialNumber} onChange={event => setForm(current => ({ ...current, serialNumber: event.target.value }))} />
              </label>

              <label>
                Quantity
                <input type="number" min="1" value={form.quantity} onChange={event => setForm(current => ({ ...current, quantity: event.target.value }))} />
              </label>

              {form.equipmentType === "router" && (
                <label>
                  Number of routers connected
                  <input type="number" min="0" value={form.connectedRouterCount} onChange={event => setForm(current => ({ ...current, connectedRouterCount: event.target.value }))} />
                </label>
              )}

              {form.equipmentType === "ups" && (
                <label>
                  UPS capacity
                  <input value={form.upsCapacity} onChange={event => setForm(current => ({ ...current, upsCapacity: event.target.value }))} placeholder="Example: 3 kVA" />
                </label>
              )}

              <label>
                Status
                <select value={form.status} onChange={event => setForm(current => ({ ...current, status: event.target.value }))}>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Faulty</option>
                  <option>Under Maintenance</option>
                  <option>Decommissioned</option>
                </select>
              </label>

              <label className="full-width-field">
                Notes
                <textarea rows="3" value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} />
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
              <button className="primary-btn" disabled={saving}>{saving ? "Saving..." : "Save equipment"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
