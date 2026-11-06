import { NavLink, Outlet } from "react-router-dom";
import { PATHS } from "../../lib/route_paths";

const TABS = [
  { to: PATHS.internal, label: "Dashboard", end: true },
  { to: PATHS.internalSchools, label: "Schools", end: false },
  { to: PATHS.internalPayments, label: "Parent app payments", end: false },
  { to: PATHS.internalMessages, label: "WhatsApp & e-mail log", end: false },
];

/** Our internal dashboard (SUPER_ADMIN only). */
export default function InternalPage() {
  return (
    <div className="module">
      <nav className="tabs" aria-label="Sections">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
