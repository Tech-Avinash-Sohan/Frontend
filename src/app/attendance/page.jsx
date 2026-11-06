import { NavLink, Outlet } from "react-router-dom";
import { PATHS } from "../../lib/route_paths";

const TABS = [
  { to: PATHS.attendance, label: "Today's submissions", end: true },
  { to: PATHS.attendanceRegister, label: "Mark / register", end: false },
  { to: PATHS.attendanceCorrections, label: "Corrections", end: false },
  { to: PATHS.studentLeaves, label: "Student leave", end: false },
  { to: PATHS.attendanceReport, label: "Report", end: false },
  { to: PATHS.staffAttendance, label: "Staff attendance", end: false },
  { to: PATHS.staffLeaves, label: "Staff leave", end: false },
];

/** Module shell: tab bar + the selected screen. */
export default function AttendancePage() {
  return (
    <div className="module">
      <nav className="tabs" aria-label="Sections">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>{t.label}</NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
