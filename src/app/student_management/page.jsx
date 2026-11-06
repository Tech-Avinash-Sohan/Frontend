import { NavLink, Outlet } from "react-router-dom";
import { PATHS } from "../../lib/route_paths";

const TABS = [
  { to: PATHS.students, label: "Directory", end: true },
  { to: PATHS.newAdmission, label: "New admission", end: false },
  { to: PATHS.guardianAccess, label: "Parents & Parent app", end: false },
  { to: PATHS.enrollment, label: "Enrollment & transfer", end: false },
  { to: PATHS.importUpload, label: "Import", end: false },
];

/** Module shell: tab bar + the selected screen. */
export default function StudentsPage() {
  return (
    <div className="module">
      {TABS.length > 1 && (
        <nav className="tabs" aria-label="Sections">
          {TABS.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
              {t.label}
            </NavLink>
          ))}
        </nav>
      )}
      <Outlet />
    </div>
  );
}
