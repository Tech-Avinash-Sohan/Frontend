import CrudScreen from "../../../components/common/crud_screen";
import StatusBadge from "../../../components/common/status_badge";
import { ATT_STATUS, corrections } from "../../../services/attendance_service";
import { approvalsService } from "../../../services/approvals_service";
import { useSchool } from "../../../context/school_context";
import { formatDate } from "../../../utils/format_date";

const label = (v) => ATT_STATUS.find((o) => o.value === v)?.label || v;

/** W12 – /attendance/corrections/: change already-saved attendance. School approves. */
export default function CorrectionRequests() {
  const { notify } = useSchool();
  const decide = (r, ok, reload) => approvalsService.decide("attendance_correction", r.id, ok).then(() => { notify(ok ? "Approved – attendance changed" : "Rejected"); reload(); });
  return (
    <CrudScreen code="W12" title="Attendance corrections" subtitle="Teachers ask to fix a saved attendance; you approve or reject."
      service={corrections} canCreate={false} canEdit={false} search={false}
      filters={[{ key: "status", label: "Status", options: [{ value: "PENDING", label: "Pending" }, { value: "APPROVED", label: "Approved" }, { value: "REJECTED", label: "Rejected" }] }]}
      columns={[
        { key: "student_name", label: "Student", render: (r) => <strong>{r.student_name}</strong> },
        { key: "date", label: "Date", render: (r) => formatDate(r.date) },
        { key: "chg", label: "Change", render: (r) => `${label(r.old_status)} → ${label(r.new_status)}` },
        { key: "reason", label: "Reason" },
        { key: "requested_by_name", label: "Asked by" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status.toLowerCase()} /> },
      ]}
      rowActions={(r, reload) => r.status === "PENDING" && (<>
        <button className="btn btn-primary btn-sm" onClick={() => decide(r, true, reload)}>Approve</button>
        <button className="btn btn-ghost btn-sm" onClick={() => decide(r, false, reload)}>Reject</button></>)}
      empty="No correction requests." />
  );
}
