export const CATEGORY_OPTIONS = [
  "Health Facility",
  "Police Station",
  "Primary School",
  "Secondary School",
  "TVET/TVC",
  "University",
  "Market",
  "Stadium/Garden",
  "Government/County Office",
  "ICT Hub",
  "Other",
];

export const PROJECT_OPTIONS = [
  "NOFBI I",
  "NOFBI II",
  "NOFBI III",
  "DSH I",
  "DSH II",
  "GIGA UNICEF",
  "Public WiFi",
  "EARTTDFP",
  "KDEAP",
  "Other",
];

export const normaliseStatus = (value = "") => {
  const text = String(value).trim();
  const lower = text.toLowerCase();
  if (lower === "connected" || lower.includes("operational")) return "Connected";
  if (lower.includes("scheduled") || lower.includes("planned")) return "Scheduled";
  if (lower.includes("not connected") || lower.includes("proposed")) return "Not Connected";
  if (text) return "Other";
  return "Unknown";
};

export const statusClass = (value = "") => {
  const status = normaliseStatus(value);
  return {
    Connected: "status connected",
    Scheduled: "status scheduled",
    "Not Connected": "status not-connected",
    Other: "status other",
    Unknown: "status unknown",
  }[status];
};

const cleanNumber = value => {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
};

export const toDatabaseRow = row => ({
  region: row.region?.trim() || null,
  county_name: row.county?.trim() || null,
  sub_county_name: row.subCounty?.trim() || null,
  ward: row.ward?.trim() || null,
  zone_name: row.zone?.trim() || null,
  institution_nemis_code: row.nemisCode?.trim() || null,
  institution_name: row.name?.trim() || null,
  institution_type: row.type?.trim() || null,
  category: row.category?.trim() || null,
  project: row.project?.trim() || null,
  access_point_number: row.accessPointNumber?.trim() || null,
  latitude: cleanNumber(row.latitude),
  longitude: cleanNumber(row.longitude),
  replacement: row.replacement?.trim() || null,
  connectivity_status: row.connectivityStatus?.trim() || null,
  connected: normaliseStatus(row.connectivityStatus) === "Connected",
  scheduled: normaliseStatus(row.connectivityStatus) === "Scheduled",
  not_connected: normaliseStatus(row.connectivityStatus) === "Not Connected",
  comments: row.comments?.trim() || null,
  updated_at: new Date().toISOString(),
});

export const mapCsvRow = (row, index) => {
  const get = (...keys) => {
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== null) return String(row[key]).trim();
    }
    return "";
  };

  let lat = get("Latitude", "latitude");
  let lon = get("Longitude", "longitude");

  if (lat.includes(",")) {
    const parts = lat.split(",").map(v => v.trim()).filter(Boolean);
    if (parts.length >= 2) {
      lat = parts[0];
      if (!lon) lon = parts[1];
    }
  }

  return {
    id: `preview-${Date.now()}-${index}`,
    region: get("Region", "region") || "North Rift",
    county: get("County_Name", "County Name", "County", "county"),
    subCounty: get("Sub_County_Name", "Sub County Name", "Subcounty", "Sub County", "subCounty"),
    ward: get("Ward", "ward"),
    zone: get("Zone_Name", "Zone Name", "Zone", "zone"),
    nemisCode: get("Code", "CODE", "Site Code", "Institution_NEMIS_Code", "NEMIS Code", "nemisCode"),
    name: get("Site Name", "SITE NAME", "Institution_Name", "Institution Name", "name"),
    type: get("Institution_Type", "Institution Type", "Type", "type"),
    category: get("Category", "CATEGORY", "category"),
    project: get("Project", "PROJECT", "project"),
    accessPointNumber: get(
      "Access Point No.",
      "Access Point No",
      "Access Point Number",
      "AP No.",
      "AP No",
      "AP",
      "access_point_number",
      "accessPointNumber"
    ),
    latitude: lat.replace(/,$/, ""),
    longitude: lon.replace(/,$/, ""),
    replacement: get("Replacement", "replacement"),
    connectivityStatus: get(
      "Connectivity Status",
      "Connectivity_Status",
      "connectivityStatus",
      "Connected",
      "Scheduled",
      "Not Connected"
    ),
    comments: get("Any other comments", "Comments", "comments"),
  };
};

export const downloadCsv = (rows, filename = "sites-export.csv") => {
  const headers = [
    "S/No.",
    "Code",
    "Site Name",
    "Region",
    "County",
    "Subcounty",
    "Ward",
    "Zone",
    "Category",
    "Project",
    "Access Point No.",
    "Institution Type",
    "Latitude",
    "Longitude",
    "Replacement",
    "Connectivity Status",
    "Comments",
  ];

  const escape = value => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const body = rows.map((r, i) => [
    i + 1,
    r.nemisCode,
    r.name,
    r.region,
    r.county,
    r.subCounty,
    r.ward,
    r.zone,
    r.category,
    r.project,
    r.accessPointNumber,
    r.type,
    r.latitude,
    r.longitude,
    r.replacement,
    r.connectivityStatus,
    r.comments,
  ].map(escape).join(","));

  const blob = new Blob([[headers.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};
