import CrudScreen from "../../../components/common/crud_screen";
import StatusBadge from "../../../components/common/status_badge";
import { COMPLAINT_STATUS, complaints } from "../../../services/notices_service";
import { useSchool } from "../../../context/school_context";
import { formatDate } from "../../../utils/format_date";

/** W33d – parents' complaints (from the Parent app). Changing the status WhatsApps the parent. */
export default function Complaints() {
  const { staffOptions } = useSchool();
  return (
    <CrudScreen code="W33d" title="Complaints" subtitle="Reply and change the status – the parent is told on WhatsApp." service={complaints}
      canCreate={false} canDelete={false} filters={[{ key: "status", label: "Status", options: COMPLAINT_STATUS }]}
      fields={[{ name: "status", label: "Status", type: "select", options: COMPLAINT_STATUS, placeholder: null },
        { name: "assigned_to", label: "Assigned to", type: "select", options: staffOptions }, { name: "response", label: "Reply to the parent", type: "textarea" }]}
      toForm={(r) => ({ id: r.id, status: r.status, assigned_to: r.assigned_to || "", response: r.response })}
      columns={[{ key: "subject", label: "Subject", render: (r) => <span><strong>{r.subject}</strong><br /><small className="muted">{r.description}</small></span> },
        { key: "parent_name", label: "Parent", render: (r) => `${r.parent_name} · ${r.parent_mobile}` }, { key: "student_name", label: "Child" },
        { key: "category", label: "Category" }, { key: "created_at", label: "Date", render: (r) => formatDate(r.created_at) },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={["RESOLVED", "CLOSED"].includes(r.status) ? "closed_ok" : "pending"} label={r.status.replace("_", " ")} /> }]}
      empty="No complaints." />
  );
}
