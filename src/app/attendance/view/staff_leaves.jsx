import CrudScreen from "../../../components/common/crud_screen";
import StatusBadge from "../../../components/common/status_badge";
import { LEAVE_TYPES, staffLeaves } from "../../../services/attendance_service";
import { useSchool } from "../../../context/school_context";
import { formatDate } from "../../../utils/format_date";
import { STATUS_FILTER } from "./student_leaves";

/** Staff leave – teachers apply in the Teacher app; the school login approves (days marked 'On leave'). */
export default function StaffLeaves() {
  const { staffOptions, notify } = useSchool();
  const decide = (r, ok, reload) => staffLeaves.action(r.id, ok ? "approve" : "reject").then(() => { notify(ok ? "Approved" : "Rejected"); reload(); });
  return (
    <CrudScreen code="W13c" title="Staff leave" subtitle="Leave days per type are set in Settings → Leave policy."
      service={staffLeaves} canEdit={false} createLabel="+ Enter leave" search={false}
      filters={[STATUS_FILTER, { key: "leave_type", label: "Type", options: LEAVE_TYPES }, { key: "staff", label: "Staff", options: staffOptions }]}
      defaults={{ leave_type: "CL" }}
      fields={[
        { name: "staff", label: "Teacher / staff", type: "select", options: staffOptions, required: true },
        { name: "leave_type", label: "Type", type: "select", options: LEAVE_TYPES, placeholder: null },
        { name: "from_date", label: "From", type: "date", required: true },
        { name: "to_date", label: "To", type: "date", required: true },
        { name: "half_day", label: "Half day", type: "checkbox" },
        { name: "reason", label: "Reason", type: "textarea", required: true },
      ]}
      columns={[
        { key: "staff_name", label: "Name", render: (r) => <strong>{r.staff_name}</strong> },
        { key: "leave_type_display", label: "Type" },
        { key: "dates", label: "Dates", render: (r) => `${formatDate(r.from_date)} – ${formatDate(r.to_date)} (${r.days} d)` },
        { key: "reason", label: "Reason" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status.toLowerCase()} /> },
      ]}
      rowActions={(r, reload) => r.status === "PENDING" && (<>
        <button className="btn btn-primary btn-sm" onClick={() => decide(r, true, reload)}>Approve</button>
        <button className="btn btn-ghost btn-sm" onClick={() => decide(r, false, reload)}>Reject</button></>)}
      empty="No leave applications." />
  );
}
