

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  School,
  Upload,
  Users,
  BarChart3,
  Settings,
  Boxes,
  Home,
  MapPinned,
  ListFilter,
  Info,
  LogOut,
  Wifi,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "../supabaseClient";

const adminLinks = [
  ["/admin", "Dashboard", LayoutDashboard],
  ["/admin/institutions", "Institutions", School],
  ["/admin/inventory", "Inventory", Boxes],
  ["/admin/uploads", "Data Upload", Upload],
  ["/admin/users", "User Management", Users],
  ["/admin/reports", "Reports", BarChart3],
  ["/admin/settings", "Settings", Settings],
];

const userLinks = [
  ["/portal", "Overview", Home],
  ["/portal/institutions", "Institutions", ListFilter],
  ["/portal/inventory", "Inventory", Boxes],
  ["/portal/map", "Map View", MapPinned],
  ["/portal/about", "About", Info],
];

export default function Layout({ auth }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const links = auth.role === "admin" ? adminLinks : userLinks;

  async function logout() {
    setSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign-out error:", error);
      alert(`Unable to sign out: ${error.message}`);
      setSigningOut(false);
      return;
    }

    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <Wifi size={23} />
          </div>

          <div>
            <strong>North Rift</strong>
            <span>Connectivity Manager</span>
          </div>

          <button
            type="button"
            className="mobile-close"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="role-pill">
          {auth.role === "admin"
            ? "Administrator"
            : "Read-only User"}
        </div>

        <nav>
          {links.map(([path, label, Icon]) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/admin" || path === "/portal"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="signed-in">
            <div className="avatar">
              {auth.name?.[0]?.toUpperCase() || "U"}
            </div>

            <div>
              <strong>{auth.name}</strong>
              <span>{auth.email}</span>
            </div>
          </div>

          <button
            type="button"
            className="logout-btn"
            onClick={logout}
            disabled={signingOut}
          >
            <LogOut size={18} />
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            type="button"
            className="menu-button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={23} />
          </button>

          <div>
            <h1>
              {auth.role === "admin"
                ? "Administration Portal"
                : "Public Information Portal"}
            </h1>

            <p>North Rift institution connectivity programme</p>
          </div>

          <div className="topbar-badge">Secure access</div>
        </header>

        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
