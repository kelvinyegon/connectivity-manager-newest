export default function StatCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon"><Icon size={22}/></div>
      <div>
        <p>{label}</p>
        <h3>{value}</h3>
        <span>{detail}</span>
      </div>
    </div>
  );
}
