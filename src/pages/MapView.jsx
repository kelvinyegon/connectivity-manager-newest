import { MapPin } from "lucide-react";

export default function MapView({ data }) {
  const points = data.filter(x => Number.isFinite(Number(x.latitude)) && Number.isFinite(Number(x.longitude)));
  return (
    <>
      <div className="page-heading"><div><h2>Map View</h2><p>Coordinate-enabled institution records.</p></div></div>
      <div className="map-placeholder">
        <div className="map-grid"></div>
        {points.slice(0,20).map((p,i) => (
          <div key={p.id} className="map-dot" style={{left:`${8 + (i*17)%84}%`, top:`${12 + (i*23)%72}%`}} title={`${p.name} (${p.latitude}, ${p.longitude})`}><MapPin size={22}/></div>
        ))}
        <div className="map-note"><strong>{points.length}</strong><span>institutions have valid coordinates</span></div>
      </div>
      <div className="panel"><p className="muted">This preview uses a lightweight visual map. Connect Leaflet, Mapbox or Google Maps for production geospatial mapping.</p></div>
    </>
  );
}
