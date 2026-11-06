import { NavLink, Outlet } from "react-router-dom";
import { PATHS } from "../../lib/route_paths";

const TABS = [
  { to: PATHS.reports, label: "Overview", end: true },
  { to: PATHS.feeDuesReport, label: "Fee dues", end: false },
  { to: PATHS.collectionReport, label: "Collection", end: false },
  { to: PATHS.exportCenter, label: "Export centre & government", end: false },
];

/** Module shell: tab bar + the selected screen. */
export default function ReportsPage() {
  return (
    <div className="module">
      <nav className="tabs" aria-label="Sections">
        {TABS.map((t) => <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>{t.label}</NavLink>)}
      </nav>
      <Outlet />
    </div>
  );
}
