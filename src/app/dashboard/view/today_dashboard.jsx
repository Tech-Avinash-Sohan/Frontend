import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import LoadingState from "../../../components/common/loading_state";
import DataTable from "../../../components/common/data_table";
import { settingsService } from "../../../services/settings_service";
import { reportsService } from "../../../services/reports_service";
import { studentsService } from "../../../services/students_service";
import { useAuth } from "../../../hooks/use_auth";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { PATHS } from "../../../lib/route_paths";
import { formatCurrency } from "../../../utils/format_currency";
import { formatDate } from "../../../utils/format_date";
import { appBadge } from "../../student_management/view/student_directory";

/** W01 – GET /school/dashboard/ + latest admissions + first-time setup steps. */
export default function TodayDashboard() {
  const { user } = useAuth();
  const { school, years, classes, sections } = useSchool();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [today, setToday] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    Promise.all([settingsService.dashboard(), studentsService.list({ ordering: "-created_at", page_size: 6 })])
      .then(([d, r]) => {
        setData(d);
        setRecent(rows(r));
      })
      .catch((e) => setError(e.message));
    reportsService.dashboard().then(setToday).catch(() => {});
  };
  useEffect(load, []);

  if (error) return <LoadingState error={error} onRetry={load} />;
  if (!data) return <LoadingState />;
  const hour = new Date().getHours();
  const steps = [
    { done: years.length > 0, label: "Add the academic year", to: PATHS.academicYears },
    { done: classes.length > 0, label: "Add classes", to: PATHS.grades },
    { done: sections.length > 0, label: "Add sections", to: PATHS.sections },
    { done: data.teachers > 0, label: "Add teachers (they get their login on WhatsApp)", to: PATHS.staffForm() },
    { done: data.students > 0, label: "Admit the first student (parent gets the app login)", to: PATHS.newAdmission },
  ];
  const pending = steps.filter((s) => !s.done);
  const paidPct = data.parents ? Math.round((data.parents_app_active / data.parents) * 100) : 0;

  return (
    <>
      <PageHeader
        code="W01"
        title={`Good ${hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"}, ${user?.first_name || ""}`}
        subtitle={`${school?.name || ""} · ${formatDate(new Date().toISOString())}`}
        actions={<Link to={PATHS.newAdmission} className="btn btn-primary">+ New admission</Link>}
      />
      {pending.length > 0 && (
        <section className="card">
          <div className="card-head"><h3>Set up your school</h3><span className="muted">{steps.length - pending.length} of {steps.length} done</span></div>
          <ul className="steps-list">
            {steps.map((s) => (
              <li key={s.label} className={s.done ? "done" : ""}>
                <span>{s.done ? "✓ " : ""}{s.label}</span>
                {!s.done && <Link className="btn btn-ghost btn-sm" to={s.to}>Open</Link>}
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="stat-grid">
        <button className="stat-card" onClick={() => navigate(PATHS.students)}>
          <span className="stat-label">Active students</span>
          <strong className="stat-value">{data.students}</strong>
          <span className="stat-note">{classes.length} classes · {sections.length} sections</span>
        </button>
        <button className="stat-card" onClick={() => navigate(PATHS.staff)}>
          <span className="stat-label">Teachers</span>
          <strong className="stat-value">{data.teachers}</strong>
          <span className="stat-note">Teacher app is free</span>
        </button>
        <button className="stat-card" onClick={() => navigate(PATHS.staff)}>
          <span className="stat-label">Office &amp; support staff</span>
          <strong className="stat-value">{data.staff}</strong>
        </button>
        <button className="stat-card" onClick={() => navigate(PATHS.guardianAccess)}>
          <span className="stat-label">Parent app active</span>
          <strong className="stat-value">{data.parents_app_active} / {data.parents}</strong>
          <span className="stat-note">{paidPct}% paid · {formatCurrency(data.parent_app_collected)} collected</span>
        </button>
      </section>
      {today && (
        <section className="stat-grid">
          <button className="stat-card" onClick={() => navigate(PATHS.attendance)}>
            <span className="stat-label">Attendance today</span>
            <strong className="stat-value">{today.attendance_today.percentage ?? "—"}{today.attendance_today.percentage !== null && "%"}</strong>
            <span className="stat-note">{today.attendance_today.sections_marked}/{today.attendance_today.sections_total} sections marked · {today.attendance_today.absent} absent</span>
          </button>
          <button className="stat-card" onClick={() => navigate(PATHS.dayClose)}>
            <span className="stat-label">Fees collected today</span>
            <strong className="stat-value">{formatCurrency(today.fees_today.amount)}</strong>
            <span className="stat-note">{today.fees_today.receipts} receipts</span>
          </button>
          <button className="stat-card" onClick={() => navigate(PATHS.feeDuesReport)}>
            <span className="stat-label">Fees overdue</span>
            <strong className="stat-value danger-text">{formatCurrency(today.fees_overdue)}</strong>
          </button>
          <button className="stat-card" onClick={() => navigate(PATHS.approvals)}>
            <span className="stat-label">Waiting for approval</span>
            <strong className="stat-value">{today.pending_approvals}</strong>
            <span className="stat-note">{today.open_enquiries} open enquiries</span>
          </button>
        </section>
      )}
      {today?.birthdays_today?.length > 0 && <div className="alert alert-info">🎂 Birthdays today: {today.birthdays_today.map((b) => `${b.name} (${b.class})`).join(", ")}</div>}
      <section className="card">
        <div className="card-head"><h3>Recent admissions</h3><Link to={PATHS.students}>All students →</Link></div>
        <DataTable
          rows={recent}
          onRowClick={(s) => navigate(PATHS.studentProfile(s.id))}
          empty="No admissions yet."
          columns={[
            { key: "full_name", label: "Student", render: (s) => <span><strong>{s.full_name}</strong><br /><small className="muted">{s.admission_no}</small></span> },
            { key: "class", label: "Class", render: (s) => `${s.class_name}${s.section_name ? `-${s.section_name}` : ""}` },
            { key: "parent", label: "Parent", render: (s) => `${s.parent.name} · ${s.parent.mobile}` },
            { key: "app", label: "Parent app", render: (s) => appBadge(s.parent) },
            { key: "admission_date", label: "Admitted", render: (s) => formatDate(s.admission_date) },
          ]}
        />
      </section>
    </>
  );
}
