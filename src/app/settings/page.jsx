import { NavLink, Outlet } from "react-router-dom";
import { PATHS } from "../../lib/route_paths";

const TABS = [
  { to: PATHS.schoolProfile, label: "School profile", end: true },
  { to: PATHS.rolePermissions, label: "Who can do what", end: false },
  { to: PATHS.receiptNumbering, label: "Fee settings & receipt no.", end: false },
  { to: PATHS.dataRetention, label: "Leave policy", end: false },
  { to: PATHS.messages, label: "WhatsApp & e-mail log", end: false },
  { to: PATHS.auditLog, label: "Audit log", end: false },
];

/** Module shell: tab bar + the selected screen. */
export default function SettingsPage() {
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
