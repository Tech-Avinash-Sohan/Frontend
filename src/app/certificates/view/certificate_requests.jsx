import CrudScreen from "../../../components/common/crud_screen";
import StatusBadge from "../../../components/common/status_badge";
import { useStudentOptions, STATUS_FILTER } from "../../attendance/view/student_leaves";
import { CERT_TYPES, requests } from "../../../services/certificates_service";
import { useSchool } from "../../../context/school_context";
import { formatDate } from "../../../utils/format_date";

/** W65 – certificate requests (from parents or office). Approve = issued with the next serial; parent gets WhatsApp. */
export default function CertificateRequests() {
  const { notify } = useSchool();
  const students = useStudentOptions();
  const decide = (r, ok, reload) => requests.action(r.id, ok ? "approve" : "reject").then(() => { notify(ok ? "Issued" : "Rejected"); reload(); }).catch((e) => notify(e.message, "error"));
  return (
    <CrudScreen code="W65" title="Certificate requests" service={requests} canEdit={false} search={false} createLabel="+ New request" defaults={{ certificate_type: "BONAFIDE" }}
      filters={[STATUS_FILTER, { key: "certificate_type", label: "Type", options: CERT_TYPES }]}
      fields={[{ name: "student", label: "Student", type: "select", options: students, required: true, span: true },
        { name: "certificate_type", label: "Type", type: "select", options: CERT_TYPES, placeholder: null }, { name: "purpose", label: "Purpose" }]}
      columns={[{ key: "student_name", label: "Student", render: (r) => <strong>{r.student_name}</strong> }, { key: "type_display", label: "Certificate" }, { key: "purpose", label: "Purpose" },
        { key: "requested_by_name", label: "Asked by" }, { key: "created_at", label: "Date", render: (r) => formatDate(r.created_at) },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status.toLowerCase()} /> }]}
      rowActions={(r, reload) => r.status === "PENDING" && (<>
        <button className="btn btn-primary btn-sm" onClick={() => decide(r, true, reload)}>Approve & issue</button>
        <button className="btn btn-ghost btn-sm" onClick={() => decide(r, false, reload)}>Reject</button></>)}
      empty="No requests." />
  );
}
