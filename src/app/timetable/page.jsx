import { NavLink, Outlet } from "react-router-dom";
import { PATHS } from "../../lib/route_paths";

const TABS = [
  { to: PATHS.timetable, label: "Timetable", end: true },
  { to: PATHS.periods, label: "Bell periods", end: false },
  { to: PATHS.substitutions, label: "Substitutions", end: false },
];

/** Module shell: tab bar + the selected screen. */
export default function TimetablePage() {
  return (
    <div className="module">
      <nav className="tabs" aria-label="Sections">
        {TABS.map((t) => <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>{t.label}</NavLink>)}
      </nav>
      <Outlet />
    </div>
  );
}
