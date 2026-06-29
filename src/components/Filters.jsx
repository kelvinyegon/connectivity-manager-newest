import { Search } from "lucide-react";

export default function Filters({
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
}) {
  const unique = key => [...new Set(data.map(item => item[key]).filter(Boolean))].sort();

  return (
    <div className="filters expanded-filters">
      <label className="search-box">
        <Search size={18} />
        <input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search code, site, county, ward or project..."
        />
      </label>

      <select value={county} onChange={event => setCounty(event.target.value)}>
        <option value="">All counties</option>
        {unique("county").map(value => <option key={value}>{value}</option>)}
      </select>

      <select value={category} onChange={event => setCategory(event.target.value)}>
        <option value="">All categories</option>
        {unique("category").map(value => <option key={value}>{value}</option>)}
      </select>

      <select value={project} onChange={event => setProject(event.target.value)}>
        <option value="">All projects</option>
        {unique("project").map(value => <option key={value}>{value}</option>)}
      </select>

      <select value={status} onChange={event => setStatus(event.target.value)}>
        <option value="">All statuses</option>
        {unique("connectivityStatus").map(value => <option key={value}>{value}</option>)}
      </select>
    </div>
  );
}
