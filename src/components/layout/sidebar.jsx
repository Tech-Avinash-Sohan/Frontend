import { NavLink } from "react-router-dom";
import { PATHS } from "../../lib/route_paths";

const ICON = {
  dash: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z",
  school: "M12 3 2 9l10 6 10-6-10-6Zm-6 9.2V17l6 3.5 6-3.5v-4.8L12 15.6 6 12.2Z",
  card: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 14H4v-6h16v6Zm0-10H4V6h16v2Z",
  chat: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Z",
};
// Our team (SUPER_ADMIN)
const INTERNAL_NAV = [
  { to: PATHS.internal, label: "Dashboard", icon: ICON.dash, end: true },
  { to: PATHS.internalSchools, label: "Schools", icon: ICON.school },
  { to: PATHS.internalPayments, label: "Parent app payments", icon: ICON.card },
  { to: PATHS.internalMessages, label: "WhatsApp & e-mail log", icon: ICON.chat },
];

// School panel (SCHOOL)
const NAV = [
  { to: PATHS.dashboard, label: "Dashboard", icon: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" },
  { to: PATHS.students, label: "Students", icon: "M12 3 1 9l11 6 9-4.9V17h2V9L12 3Zm-7 9.2v4L12 20l7-3.8v-4L12 16l-7-3.8Z" },
  { to: PATHS.enquiries, label: "Admissions", icon: "M15 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4Zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6Zm9 4c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4Z" },
  { to: PATHS.attendance, label: "Attendance", icon: "M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" },
  { to: PATHS.homework, label: "Homework & diary", icon: "M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2ZM6 4h5v8l-2.5-1.5L6 12V4Z" },
  { to: PATHS.timetable, label: "Timetable", icon: "M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm0 16H5V8h14v11ZM7 10h5v5H7v-5Z" },
  { to: PATHS.exams, label: "Exams & results", icon: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6Zm-1 7V3.5L18.5 9H13ZM8 13h8v2H8v-2Zm0 4h5v2H8v-2Z" },
  { to: PATHS.feePlans, label: "Fees", icon: "M6 3h12v2h-3.2c.6.6 1 1.3 1.1 2H18v2h-2.1c-.4 2.3-2.4 4-4.9 4h-.6l6 6v.1h-2.8L7.6 13H7v-2h4c1.4 0 2.6-.8 2.9-2H6V7h7.9c-.3-1.2-1.5-2-2.9-2H6V3Z" },
  { to: PATHS.staff, label: "Staff", icon: "M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Zm-8 0c1.7 0 3-1.3 3-3S9.7 5 8 5 5 6.3 5 8s1.3 3 3 3Zm0 2c-2.3 0-7 1.2-7 3.5V19h14v-2.5C15 14.2 10.3 13 8 13Zm8 0h-1c1.2.9 2 2 2 3.5V19h6v-2.5c0-2.3-4.7-3.5-7-3.5Z" },
  { to: PATHS.academicYears, label: "Academics", icon: "M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h10v2H4v-2Z" },
  { to: PATHS.notices, label: "Notices & parents", icon: "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2Zm6-6v-5c0-3.1-1.6-5.6-4.5-6.3V4c0-.8-.7-1.5-1.5-1.5S10.5 3.2 10.5 4v.7C7.6 5.4 6 7.9 6 11v5l-2 2v1h16v-1l-2-2Z" },
  { to: PATHS.certificates, label: "Certificates", icon: "M4 3h16v12H4V3Zm2 2v8h12V5H6Zm3 12h6l-1 4-2-1-2 1-1-4Z" },
  { to: PATHS.studentNotes, label: "Discipline", icon: "M12 2 4 5v6c0 5.6 3.4 10.7 8 12 4.6-1.3 8-6.4 8-12V5l-8-3Z" },
  { to: PATHS.reports, label: "Reports", icon: "M5 9h3v10H5V9Zm5.5-4h3v14h-3V5ZM16 13h3v6h-3v-6Z" },
  { to: PATHS.approvals, label: "Approvals", icon: "M19 3h-4.2C14.4 1.8 13.3 1 12 1s-2.4.8-2.8 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm-7 0c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1Zm-2 14-4-4 1.4-1.4 2.6 2.6 6.6-6.6L18 9l-8 8Z" },
  { to: PATHS.schoolProfile, label: "Settings", icon: "M19.1 12.9c.1-.3.1-.6.1-.9s0-.6-.1-.9l2-1.6c.2-.1.2-.4.1-.6l-1.9-3.3c-.1-.2-.4-.3-.6-.2l-2.4 1c-.5-.4-1-.7-1.6-.9L14.4 3c0-.2-.2-.4-.5-.4h-3.8c-.2 0-.4.2-.5.4l-.3 2.5c-.6.2-1.1.6-1.6.9l-2.4-1c-.2-.1-.5 0-.6.2L2.8 8.9c-.1.2-.1.5.1.6l2 1.6c0 .3-.1.6-.1.9s0 .6.1.9l-2 1.6c-.2.1-.2.4-.1.6l1.9 3.3c.1.2.4.3.6.2l2.4-1c.5.4 1 .7 1.6.9l.3 2.5c0 .2.2.4.5.4h3.8c.2 0 .4-.2.5-.4l.3-2.5c.6-.2 1.1-.6 1.6-.9l2.4 1c.2.1.5 0 .6-.2l1.9-3.3c.1-.2.1-.5-.1-.6l-2-1.6ZM12 15.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5Z" },
];

export default function Sidebar({ open, onClose, schoolName, internal = false }) {
  const items = internal ? INTERNAL_NAV : NAV;
  return (
    <>
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <img src="/logo.svg" alt="" width="34" height="34" />
          <div>
            <strong>{schoolName || "School ERP"}</strong>
            <span>{internal ? "Internal dashboard" : "School panel"}</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={onClose} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path fill="currentColor" d={item.icon} />
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          Connected to the Django API
        </div>
      </aside>
      {open && <div className="sidebar-scrim" onClick={onClose} />}
    </>
  );
}
