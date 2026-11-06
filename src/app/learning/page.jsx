import { NavLink, Outlet } from "react-router-dom";
import { PATHS } from "../../lib/route_paths";

const TABS = [
  { to: PATHS.homework, label: "Homework", end: true },
  { to: PATHS.diary, label: "Class diary", end: false },
  { to: PATHS.lessonPlans, label: "Lesson plans & syllabus", end: false },
  { to: PATHS.materials, label: "Study material", end: false },
];

/** Module shell: tab bar + the selected screen. */
export default function LearningPage() {
  return (
    <div className="module">
      <nav className="tabs" aria-label="Sections">
        {TABS.map((t) => <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>{t.label}</NavLink>)}
      </nav>
      <Outlet />
    </div>
  );
}
