import { useEffect, useState } from "react";
import PageHeader from "../../../components/layout/page_header";
import LoadingState from "../../../components/common/loading_state";
import DataTable from "../../../components/common/data_table";
import { reportsService } from "../../../services/reports_service";
import { formatCurrency } from "../../../utils/format_currency";

/** W34 – GET /reports/dashboard/ + /reports/student-strength/ */
export default function ReportsOverview() {
  const [d, setD] = useState(null);
  const [s, setS] = useState(null);
  useEffect(() => { reportsService.dashboard().then(setD); reportsService.strength().then(setS); }, []);
  if (!d || !s) return <LoadingState />;
  const a = d.attendance_today;
  return (
    <>
      <PageHeader code="W34" title="Reports" subtitle="School at a glance" />
      <section className="stat-grid">
        <div className="stat-card"><span className="stat-label">Students</span><strong className="stat-value">{d.students}</strong><span className="stat-note">{d.boys} boys · {d.girls} girls</span></div>
        <div className="stat-card"><span className="stat-label">Attendance today</span><strong className="stat-value">{a.percentage ?? "—"}{a.percentage !== null && "%"}</strong><span className="stat-note">{a.sections_marked}/{a.sections_total} sections marked</span></div>
        <div className="stat-card"><span className="stat-label">Fees today</span><strong className="stat-value">{formatCurrency(d.fees_today.amount)}</strong><span className="stat-note">{d.fees_today.receipts} receipts</span></div>
        <div className="stat-card"><span className="stat-label">Fees overdue</span><strong className="stat-value danger-text">{formatCurrency(d.fees_overdue)}</strong></div>
        <div className="stat-card"><span className="stat-label">Teachers · staff</span><strong className="stat-value">{d.teachers} · {d.staff}</strong><span className="stat-note">{d.staff_present_today} present today</span></div>
        <div className="stat-card"><span className="stat-label">Parent app paid</span><strong className="stat-value">{d.parent_app_paid}/{d.parents}</strong></div>
        <div className="stat-card"><span className="stat-label">Pending approvals</span><strong className="stat-value">{d.pending_approvals}</strong></div>
        <div className="stat-card"><span className="stat-label">Open enquiries</span><strong className="stat-value">{d.open_enquiries}</strong></div>
      </section>
      <section className="card">
        <div className="card-head"><h3>Strength by section · {s.total} students{s.without_section ? ` (${s.without_section} without section)` : ""}</h3></div>
        <DataTable rows={s.rows.map((r, i) => ({ ...r, id: i }))} empty="No sections yet." columns={[
          { key: "sec", label: "Section", render: (r) => <strong>{r.class}-{r.section}</strong> }, { key: "class_teacher", label: "Class teacher" },
          { key: "total", label: "Total", align: "right" }, { key: "boys", label: "Boys", align: "right" }, { key: "girls", label: "Girls", align: "right" },
          { key: "rte", label: "RTE", align: "right" }, { key: "capacity", label: "Capacity", align: "right" },
          { key: "fill", label: "Filled", render: (r) => <div className="progress"><span style={{ width: `${Math.min(100, (r.total * 100) / (r.capacity || 1))}%` }} /></div> }]} />
      </section>
      {d.upcoming.length > 0 && <section className="card"><div className="card-head"><h3>Next 30 days</h3></div>
        <ul className="steps-list">{d.upcoming.map((e) => <li key={e.title + e.date}><span>{e.title}</span><span className="muted">{e.date}</span></li>)}</ul></section>}
    </>
  );
}
