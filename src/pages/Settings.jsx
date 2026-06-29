import { useState } from "react";
import { Save } from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem("nrcm-settings") || "null") || {
    organisation:"ICT Authority", systemName:"North Rift Connectivity Manager",
    supportEmail:"support@connectivity.go.ke", sessionTimeout:"30", allowExports:true
  });
  const [saved, setSaved] = useState(false);
  const submit = e => {
    e.preventDefault(); localStorage.setItem("nrcm-settings", JSON.stringify(settings));
    setSaved(true); setTimeout(()=>setSaved(false), 2000);
  };
  return (
    <>
      <div className="page-heading"><div><h2>Settings</h2><p>Configure system identity and basic security preferences.</p></div></div>
      <form className="panel settings-form" onSubmit={submit}>
        <div className="form-grid">
          <label>Organisation<input value={settings.organisation} onChange={e=>setSettings({...settings,organisation:e.target.value})}/></label>
          <label>System name<input value={settings.systemName} onChange={e=>setSettings({...settings,systemName:e.target.value})}/></label>
          <label>Support email<input type="email" value={settings.supportEmail} onChange={e=>setSettings({...settings,supportEmail:e.target.value})}/></label>
          <label>Session timeout (minutes)<input type="number" value={settings.sessionTimeout} onChange={e=>setSettings({...settings,sessionTimeout:e.target.value})}/></label>
        </div>
        <label className="checkbox-row"><input type="checkbox" checked={settings.allowExports} onChange={e=>setSettings({...settings,allowExports:e.target.checked})}/> Allow read-only users to export filtered institution data</label>
        <div className="settings-actions"><button className="primary-btn"><Save size={17}/> Save settings</button>{saved && <span className="saved-text">Settings saved.</span>}</div>
      </form>
    </>
  );
}
