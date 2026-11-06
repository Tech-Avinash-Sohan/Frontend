import CrudScreen from "../../../components/common/crud_screen";
import StatusBadge from "../../../components/common/status_badge";
import { useStudentOptions } from "../../attendance/view/student_leaves";
import { disciplineService, INCIDENT_STATUS, incidents, SEVERITY } from "../../../services/discipline_service";
import { useSchool } from "../../../context/school_context";
import { formatDate, todayISO } from "../../../utils/format_date";

/** W68 – discipline incidents (/discipline/incidents/). "Inform parents" sends WhatsApp + e-mail. */
export default function Incidents() {
  const { notify } = useSchool();
  const students = useStudentOptions();
  return (
    <CrudScreen code="W68" title="Incidents" service={incidents} createLabel="+ Record incident" defaults={{ date: todayISO(), severity: "LOW", status: "OPEN", students: [] }}
      filters={[{ key: "status", label: "Status", options: INCIDENT_STATUS }, { key: "severity", label: "Severity", options: SEVERITY }]}
      fields={[{ name: "title", label: "Title", required: true }, { name: "date", label: "Date", type: "date", required: true },
        { name: "severity", label: "Severity", type: "select", options: SEVERITY, placeholder: null }, { name: "status", label: "Status", type: "select", options: INCIDENT_STATUS, placeholder: null },
        { name: "students", label: "Students", type: "multiselect", options: students, required: true }, { name: "description", label: "What happened", type: "textarea", required: true },
        { name: "action_taken", label: "Action taken", type: "textarea" }]}
      columns={[{ key: "title", label: "Incident", render: (r) => <span><strong>{r.title}</strong><br /><small className="muted">{r.student_names.join(", ")}</small></span> },
        { key: "date", label: "Date", render: (r) => formatDate(r.date) }, { key: "severity", label: "Severity", render: (r) => <StatusBadge status={r.severity.toLowerCase()} label={r.severity} /> },
        { key: "status", label: "Status" }, { key: "parents_informed", label: "Parents told", render: (r) => (r.parents_informed ? "Yes" : "No") }]}
      rowActions={(r, reload) => !r.parents_informed && <button className="btn btn-ghost btn-sm" onClick={() => disciplineService.informParents(r.id).then(() => { notify("Parents informed"); reload(); })}>Inform parents</button>}
      empty="No incidents." />
  );
}
