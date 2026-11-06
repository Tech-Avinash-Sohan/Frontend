import { useEffect, useState } from "react";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import FormSelect from "../../../components/forms/form_select";
import { attendanceService } from "../../../services/attendance_service";
import { reportsService } from "../../../services/reports_service";
import { useSchool } from "../../../context/school_context";

/** W13 – GET /attendance/students/report/?section=&month= : monthly attendance % per student (+ CSV). */
export default function AttendanceReport() {
  const { divisionOptions, notify } = useSchool();
  const [section, setSection] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!section) return;
    setLoading(true);
    attendanceService.report({ section, month }).then(setData).finally(() => setLoading(false));
  }, [section, month]);
  const csv = () => reportsService.downloadCsv("/attendance/students/report/", { section, month }, `attendance_${month}.csv`).catch((e) => notify(e.message, "error"));
  return (
    <>
      <PageHeader code="W13" title="Attendance report" subtitle="Monthly attendance per student" actions={section && <button className="btn btn-ghost" onClick={csv}>Download CSV</button>} />
      <div className="card toolbar-card">
        <FormSelect label="Section" name="section" value={section} options={divisionOptions} onChange={(_, v) => setSection(v)} />
        <div className="field"><label htmlFor="m">Month</label><input id="m" type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></div>
      </div>
      {section ? (
        <DataTable rows={data?.students || []} rowKey="student" loading={loading} empty="No attendance in this month."
          columns={[
            { key: "roll_no", label: "Roll", render: (r) => r.roll_no ?? "—" },
            { key: "name", label: "Student", render: (r) => <strong>{r.name}</strong> },
            { key: "days_marked", label: "Days", align: "right" },
            { key: "present", label: "Present", align: "right" },
            { key: "absent", label: "Absent", align: "right" },
            { key: "leave", label: "Leave", align: "right" },
            { key: "percentage", label: "%", align: "right", render: (r) => r.percentage === null ? "—" : <b className={r.percentage < 75 ? "danger-text" : ""}>{r.percentage}%</b> },
          ]} />
      ) : <div className="card"><p className="muted">Choose a section.</p></div>}
    </>
  );
}
