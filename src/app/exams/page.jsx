import { NavLink, Outlet } from "react-router-dom";
import { PATHS } from "../../lib/route_paths";

const TABS = [
  { to: PATHS.exams, label: "Exams", end: true },
  { to: PATHS.marksEntry, label: "Marks entry", end: false },
  { to: PATHS.resultSheet, label: "Results", end: false },
  { to: PATHS.gradeBands, label: "Grades", end: false },
];

/** Module shell: tab bar + the selected screen. */
export default function ExamsPage() {
  return (
    <div className="module">
      <nav className="tabs" aria-label="Sections">
        {TABS.map((t) => <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>{t.label}</NavLink>)}
      </nav>
      <Outlet />
    </div>
  );
}
