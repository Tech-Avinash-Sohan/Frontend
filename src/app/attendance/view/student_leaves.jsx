import { useEffect, useState } from "react";
import CrudScreen from "../../../components/common/crud_screen";
import StatusBadge from "../../../components/common/status_badge";
import { studentLeaves } from "../../../services/attendance_service";
import { studentsService } from "../../../services/students_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { formatDate } from "../../../utils/format_date";

export const STATUS_FILTER = { key: "status", label: "Status", options: [{ value: "PENDING", label: "Pending" }, { value: "APPROVED", label: "Approved" }, { value: "REJECTED", label: "Rejected" }, { value: "CANCELLED", label: "Cancelled" }] };

/** Hook: active students as select options (for forms). */
export function useStudentOptions(params = {}) {
  const [opts, setOpts] = useState([]);
  const key = JSON.stringify(params);
  useEffect(() => {
    studentsService.list({ status: "ACTIVE", page_size: 200, ...params }).then((d) =>
      setOpts(rows(d).map((s) => ({ value: s.id, label: `${s.full_name} · ${s.class_name}${s.section_name ? `-${s.section_name}` : ""} · ${s.admission_no}` }))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return opts;
}

/** Student leave – parents apply in the Parent app, or the office enters it. Approve = days become "On leave". */
export default function StudentLeaves() {
  const { notify, divisionOptions } = useSchool();
  const students = useStudentOptions();
  const decide = (r, ok, reload) => studentLeaves.action(r.id, ok ? "approve" : "reject").then(() => { notify(ok ? "Approved – parent told on WhatsApp" : "Rejected"); reload(); });
  return (
    <CrudScreen code="W12b" title="Student leave" subtitle="From the Parent app or entered here. Approving marks those days 'On leave'."
      service={studentLeaves} canEdit={false} createLabel="+ Enter leave" search={false}
      filters={[STATUS_FILTER, { key: "student__section", label: "Section", options: divisionOptions }]}
      fields={[
        { name: "student", label: "Student", type: "select", options: students, required: true, span: true },
        { name: "from_date", label: "From", type: "date", required: true },
        { name: "to_date", label: "To", type: "date", required: true },
        { name: "reason", label: "Reason", type: "textarea", required: true },
      ]}
      columns={[
        { key: "student_name", label: "Student", render: (r) => <span><strong>{r.student_name}</strong><br /><small className="muted">{r.section_name}</small></span> },
        { key: "dates", label: "Dates", render: (r) => `${formatDate(r.from_date)} – ${formatDate(r.to_date)} (${r.days} d)` },
        { key: "reason", label: "Reason" },
        { key: "requested_by_name", label: "Applied by" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status.toLowerCase()} /> },
      ]}
      rowActions={(r, reload) => r.status === "PENDING" && (<>
        <button className="btn btn-primary btn-sm" onClick={() => decide(r, true, reload)}>Approve</button>
        <button className="btn btn-ghost btn-sm" onClick={() => decide(r, false, reload)}>Reject</button></>)}
      empty="No leave applications." />
  );
}
