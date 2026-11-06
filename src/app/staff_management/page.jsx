import { NavLink, Outlet } from "react-router-dom";
import { PATHS } from "../../lib/route_paths";

const TABS = [
  { to: PATHS.staff, label: "Directory", end: true },
  { to: PATHS.staffForm(), label: "Add teacher / staff", end: false },
  { to: PATHS.roleAssignments, label: "Logins & access", end: false },
];

/** Module shell: tab bar + the selected screen. */
export default function StaffPage() {
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
