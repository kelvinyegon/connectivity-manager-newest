
import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { supabase } from "./supabaseClient";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Institutions from "./pages/Institutions";
import Uploads from "./pages/Uploads";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import UserOverview from "./pages/UserOverview";
import MapView from "./pages/MapView";
import About from "./pages/About";
import Inventory from "./pages/Inventory";

function Guard({ auth, role, children }) {
  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (role && auth.role !== role) {
    return (
      <Navigate
        to={auth.role === "admin" ? "/admin" : "/portal"}
        replace
      />
    );
  }

  return children;
}

function mapSupabaseInstitution(row) {
  return {
    id: row.id,
    region: row.region || "",
    county: row.county_name || "",
    subCounty: row.sub_county_name || "",
    ward: row.ward || "",
    zone: row.zone_name || "",
    nemisCode: row.institution_nemis_code || "",
    name: row.institution_name || "",
    type: row.institution_type || "",
    category: row.category || "",
    project: row.project || "",
    accessPointNumber: row.access_point_number || "",
    latitude: row.latitude ?? "",
    longitude: row.longitude ?? "",
    replacement: row.replacement || "",
    connectivityStatus: row.connectivity_status || "",
    connected: row.connected ?? false,
    scheduled: row.scheduled ?? false,
    notConnected: row.not_connected ?? false,
    comments: row.comments || "",
  };
}

export default function App() {
  const [auth, setAuth] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [data, setData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [databaseError, setDatabaseError] = useState("");

  async function loadProfile(user) {
    if (!user) {
      setAuth(null);
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Profile loading error:", error);
      setAuth(null);
      return;
    }

    setAuth({
      id: user.id,
      email: user.email,
      name: profile.full_name || user.email,
      role: profile.role,
    });
  }

  async function loadInstitutions() {
    setDataLoading(true);
    setDatabaseError("");

    const { data: institutions, error } = await supabase
      .from("institutions")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Institution loading error:", error);
      setDatabaseError(error.message);
      setData([]);
    } else {
      const formattedData = (institutions || []).map(
        mapSupabaseInstitution
      );

      setData(formattedData);
    }

    setDataLoading(false);
  }

  useEffect(() => {
    let componentActive = true;

    async function initialiseAuthentication() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!componentActive) {
        return;
      }

      if (error) {
        console.error("Session loading error:", error);
        setAuth(null);
        setAuthLoading(false);
        return;
      }

      if (session?.user) {
        await loadProfile(session.user);
      } else {
        setAuth(null);
      }

      if (componentActive) {
        setAuthLoading(false);
      }
    }

    initialiseAuthentication();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(async () => {
        if (!componentActive) {
          return;
        }

        if (session?.user) {
          await loadProfile(session.user);
        } else {
          setAuth(null);
          setData([]);
          setDatabaseError("");
        }

        setAuthLoading(false);
      }, 0);
    });

    return () => {
      componentActive = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (auth) {
      loadInstitutions();
    } else {
      setData([]);
    }
  }, [auth]);

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div>
          <h2>Checking your account...</h2>
          <p>Please wait while your session is verified.</p>
        </div>
      </div>
    );
  }

  if (auth && dataLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div>
          <h2>Loading institutions...</h2>
          <p>Connecting to the Supabase database.</p>
        </div>
      </div>
    );
  }

  if (auth && databaseError) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "Arial, sans-serif",
          padding: "24px",
        }}
      >
        <div>
          <h2>Database connection error</h2>
          <p>{databaseError}</p>
          <p>Check the Supabase policies and user profile.</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          auth ? (
            <Navigate
              to={auth.role === "admin" ? "/admin" : "/portal"}
              replace
            />
          ) : (
            <Login auth={auth} />
          )
        }
      />

      <Route
        element={
          <Guard auth={auth}>
            <Layout auth={auth} />
          </Guard>
        }
      >
        <Route
          path="/admin"
          element={
            <Guard auth={auth} role="admin">
              <AdminDashboard data={data} />
            </Guard>
          }
        />

        <Route
          path="/admin/institutions"
          element={
            <Guard auth={auth} role="admin">
              <Institutions
                data={data}
                setData={setData}
                reloadData={loadInstitutions}
                admin
              />
            </Guard>
          }
        />

        <Route
          path="/admin/inventory"
          element={
            <Guard auth={auth} role="admin">
              <Inventory sites={data} admin />
            </Guard>
          }
        />

        <Route
          path="/admin/uploads"
          element={
            <Guard auth={auth} role="admin">
              <Uploads
                data={data}
                setData={setData}
                reloadData={loadInstitutions}
              />
            </Guard>
          }
        />

        <Route
          path="/admin/users"
          element={
            <Guard auth={auth} role="admin">
              <Users />
            </Guard>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <Guard auth={auth} role="admin">
              <Reports data={data} />
            </Guard>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <Guard auth={auth} role="admin">
              <Settings />
            </Guard>
          }
        />

        <Route
          path="/portal"
          element={
            <Guard auth={auth} role="user">
              <UserOverview data={data} />
            </Guard>
          }
        />

        <Route
          path="/portal/institutions"
          element={
            <Guard auth={auth} role="user">
              <Institutions data={data} />
            </Guard>
          }
        />

        <Route
          path="/portal/inventory"
          element={
            <Guard auth={auth} role="user">
              <Inventory sites={data} />
            </Guard>
          }
        />

        <Route
          path="/portal/map"
          element={
            <Guard auth={auth} role="user">
              <MapView data={data} />
            </Guard>
          }
        />

        <Route
          path="/portal/about"
          element={
            <Guard auth={auth} role="user">
              <About />
            </Guard>
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to={
              auth
                ? auth.role === "admin"
                  ? "/admin"
                  : "/portal"
                : "/login"
            }
            replace
          />
        }
      />
    </Routes>
  );
}
