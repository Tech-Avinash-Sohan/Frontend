import { useEffect, useState } from "react";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import { attendanceService, ATT_STATUS } from "../../../services/attendance_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { apiErrors } from "../../../utils/validation";
import { todayISO } from "../../../utils/format_date";

/** Staff attendance – mark the day (POST /attendance/staff/mark/) and the monthly summary. */
export default function StaffAttendance() {
  const { staff, notify } = useSchool();
  const [date, setDate] = useState(todayISO());
  const [marks, setMarks] = useState({});
  const [month, setMonth] = useState(todayISO().slice(0, 7));
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    attendanceService.staffAttendance.list({ date, page_size: 200 }).then((d) => {
      const m = Object.fromEntries(staff.map((s) => [s.id, { status: "P", check_in: "" }]));
      rows(d).forEach((r) => (m[r.staff] = { status: r.status, check_in: r.check_in?.slice(0, 5) || "" }));
      setMarks(m);
    });
  }, [date, staff]);
  useEffect(() => { attendanceService.staffReport(month).then(setReport); }, [month]);
  const save = async () => {
    setBusy(true);
    try {
      await attendanceService.markStaff({ date, entries: Object.entries(marks).map(([id, v]) => ({ staff: Number(id), status: v.status, check_in: v.check_in || null })) });
      notify("Staff attendance saved");
      attendanceService.staffReport(month).then(setReport);
    } catch (e) {
      notify(apiErrors(e)._ || "Could not save", "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeader code="W13b" title="Staff attendance" subtitle="Teachers can also check in from the Teacher app."
        actions={<input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />} />
      <DataTable rows={staff} empty="Add teachers / staff first."
        columns={[
          { key: "name", label: "Name", render: (s) => <strong>{s.name}</strong> },
          { key: "staff_type", label: "Type", render: (s) => s.designation || s.staff_type },
          { key: "status", label: "Status", render: (s) => (
            <select value={marks[s.id]?.status || "P"} onChange={(e) => setMarks((m) => ({ ...m, [s.id]: { ...m[s.id], status: e.target.value } }))}>
              {ATT_STATUS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>) },
          { key: "check_in", label: "Check-in", render: (s) => <input type="time" value={marks[s.id]?.check_in || ""} onChange={(e) => setMarks((m) => ({ ...m, [s.id]: { ...m[s.id], check_in: e.target.value } }))} /> },
        ]} />
      <div className="form-actions"><button className="btn btn-primary" disabled={busy || !staff.length} onClick={save}>{busy ? "Saving…" : "Save staff attendance"}</button></div>
      <section className="card">
        <div className="card-head"><h3>Monthly summary</h3><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></div>
        <DataTable rows={report?.staff || []} rowKey="staff" columns={[
          { key: "name", label: "Name" }, { key: "present", label: "Present", align: "right" }, { key: "half_day", label: "Half day", align: "right" },
          { key: "absent", label: "Absent", align: "right" }, { key: "leave", label: "Leave", align: "right" }]} />
      </section>
    </>
  );
}
