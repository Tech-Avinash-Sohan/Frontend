import { NavLink, Outlet } from "react-router-dom";
import { PATHS } from "../../lib/route_paths";

const TABS = [
  { to: PATHS.feePlans, label: "Fee plans & heads", end: true },
  { to: PATHS.feeAssessment, label: "Bill students", end: false },
  { to: PATHS.collectionDesk, label: "Collect", end: false },
  { to: PATHS.ledger, label: "Student ledger", end: false },
  { to: PATHS.corrections, label: "Discounts & cancellations", end: false },
  { to: PATHS.dayClose, label: "Day close", end: false },
];

/** Module shell: tab bar + the selected screen. */
export default function FeesPage() {
  return (
    <div className="module">
      <nav className="tabs" aria-label="Sections">
        {TABS.map((t) => <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>{t.label}</NavLink>)}
      </nav>
      <Outlet />
    </div>
  );
}
