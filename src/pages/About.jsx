export default function About() {
  return (
    <>
      <div className="page-heading"><div><h2>About the Programme</h2><p>Institution connectivity management for the North Rift region.</p></div></div>
      <div className="about-grid">
        <div className="panel"><h3>Purpose</h3><p>The system provides a central register of institutions, locations, connectivity programmes and deployment status. It supports planning, transparency and reporting.</p></div>
        <div className="panel"><h3>Coverage</h3><p>The dataset covers counties including Turkana, West Pokot, Trans Nzoia, Uasin Gishu, Elgeyo Marakwet, Nandi and Baringo.</p></div>
        <div className="panel"><h3>Data governance</h3><p>Only authenticated administrators can create, edit, upload or delete data. Standard users can search, filter and view records without changing them.</p></div>
        <div className="panel"><h3>Connectivity categories</h3><p>Records may include connected sites, scheduled programmes, DSH or KDEAP initiatives, LEO satellite proposals and urban/peri-urban ISP proposals.</p></div>
      </div>
    </>
  );
}
