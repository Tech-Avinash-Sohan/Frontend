import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/sidebar";
import Topbar from "../components/layout/topbar";
import LoadingState from "../components/common/loading_state";
import { useAuth } from "../hooks/use_auth";
import { useSchool } from "../context/school_context";
import { PATHS } from "../lib/route_paths";

/** Shell for every signed-in screen. SUPER_ADMIN sees the internal dashboard, SCHOOL the school panel. */
export default function AdminLayout() {
  const { user, ready, isSuperAdmin, mustChangePassword, homePath } = useAuth();
  const { school } = useSchool();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname;

  if (!ready) return <LoadingState text="Opening…" />;
  if (!user) return <Navigate to={PATHS.login} replace state={{ from: path }} />;
  if (mustChangePassword) return <Navigate to={PATHS.activate} replace />;
  // each login type stays in its own area
  if (isSuperAdmin && !path.startsWith("/internal")) return <Navigate to={homePath} replace />;
  if (!isSuperAdmin && path.startsWith("/internal")) return <Navigate to={homePath} replace />;

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} schoolName={isSuperAdmin ? "SchoolERP" : school?.name} internal={isSuperAdmin} />
      <div className="app-main">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
