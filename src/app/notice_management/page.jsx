import { NavLink, Outlet } from "react-router-dom";
import { PATHS } from "../../lib/route_paths";

const TABS = [
  { to: PATHS.notices, label: "Notices", end: true },
  { to: PATHS.chats, label: "Parent chats", end: false },
  { to: PATHS.meetings, label: "PTM slots", end: false },
  { to: PATHS.complaints, label: "Complaints", end: false },
  { to: PATHS.consentForms, label: "Consent forms", end: false },
];

/** Module shell: notices + parent communication. */
export default function NoticesPage() {
  return (
    <div className="module">
      <nav className="tabs" aria-label="Sections">
        {TABS.map((t) => <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>{t.label}</NavLink>)}
      </nav>
      <Outlet />
    </div>
  );
}
