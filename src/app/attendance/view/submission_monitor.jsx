import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import LoadingState from "../../../components/common/loading_state";
import StatusBadge from "../../../components/common/status_badge";
import { attendanceService } from "../../../services/attendance_service";
import { PATHS } from "../../../lib/route_paths";
import { formatDate, todayISO } from "../../../utils/format_date";

/** W10 – GET /attendance/students/submissions/?date= : which sections have marked attendance. */
export default function SubmissionMonitor() {
  const navigate = useNavigate();
  const [date, setDate] = useState(todayISO());
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const load = () => { setData(null); setError(""); attendanceService.submissions(date).then(setData).catch((e) => setError(e.message)); };
  useEffect(load, [date]);
  if (error) return <LoadingState error={error} onRetry={load} />;
  if (!data) return <LoadingState />;
  const pct = data.present + data.absent ? Math.round((data.present * 100) / (data.present + data.absent + data.leave)) : 0;
  return (
    <>
      <PageHeader code="W10" title="Attendance submissions" subtitle={formatDate(date)}
        actions={<><input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} /><button className="btn btn-ghost" onClick={load}>Refresh</button></>} />
      <section className="stat-grid">
        <div className="stat-card"><span className="stat-label">Sections submitted</span><strong className="stat-value">{data.sections_submitted}/{data.sections_total}</strong>
          <div className="progress"><span style={{ width: `${data.sections_total ? (data.sections_submitted * 100) / data.sections_total : 0}%` }} /></div></div>
        <div className="stat-card"><span className="stat-label">Present</span><strong className="stat-value">{data.present}</strong><span className="stat-note">{pct}%</span></div>
        <div className="stat-card"><span className="stat-label">Absent</span><strong className="stat-value danger-text">{data.absent}</strong></div>
        <div className="stat-card"><span className="stat-label">On leave</span><strong className="stat-value">{data.leave}</strong></div>
      </section>
      <DataTable rows={data.sections} rowKey="section" empty="Add sections in Academics first."
        onRowClick={(r) => navigate(`${PATHS.attendanceRegister}?section=${r.section}&date=${date}`)}
        columns={[
          { key: "section_name", label: "Section", render: (r) => <strong>{r.section_name}</strong> },
          { key: "class_teacher", label: "Class teacher", render: (r) => r.class_teacher || "—" },
          { key: "submitted", label: "Status", render: (r) => <StatusBadge status={r.submitted ? "submitted" : "not_submitted"} /> },
          { key: "students", label: "Students", align: "right" },
          { key: "present", label: "Present", align: "right" },
          { key: "absent", label: "Absent", align: "right", render: (r) => <span className={r.absent ? "danger-text" : ""}>{r.absent}</span> },
          { key: "act", label: "", align: "right", render: (r) => <button className="btn btn-ghost btn-sm">{r.submitted ? "View" : "Mark now"}</button> },
        ]} />
    </>
  );
}
