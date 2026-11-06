import { NavLink, Outlet } from "react-router-dom";
import { PATHS } from "../../lib/route_paths";

const TABS = [
  { to: PATHS.academicYears, label: "Academic years", end: true },
  { to: PATHS.grades, label: "Classes", end: false },
  { to: PATHS.sections, label: "Sections", end: false },
  { to: PATHS.calendar, label: "Calendar & holidays", end: false },
  { to: PATHS.teacherAssignments, label: "Subjects", end: false },
  { to: PATHS.teachingAssignments, label: "Who teaches what", end: false },
  { to: PATHS.terms, label: "Terms", end: false },
];

/** Module shell: tab bar + the selected screen. */
export default function AcademicsPage() {
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
