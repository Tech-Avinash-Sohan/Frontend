import { NavLink, Outlet } from "react-router-dom";
import { PATHS } from "../../lib/route_paths";

const TABS = [
  { to: PATHS.certificates, label: "Register", end: true },
  { to: PATHS.certificateRequests, label: "Requests", end: false },
  { to: PATHS.certificateTemplates, label: "Templates", end: false },
];

/** Module shell: tab bar + the selected screen. */
export default function CertificatesPage() {
  return (
    <div className="module">
      <nav className="tabs" aria-label="Sections">
        {TABS.map((t) => <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>{t.label}</NavLink>)}
      </nav>
      <Outlet />
    </div>
  );
}
