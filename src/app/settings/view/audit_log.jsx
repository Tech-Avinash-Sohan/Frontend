import CrudScreen from "../../../components/common/crud_screen";
import { crud } from "../../../lib/crud";
import { formatDateTime } from "../../../utils/format_date";

const audit = crud("/reports/audit-log/");
const ACTIONS = ["CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT", "COLLECT", "DAY_CLOSE", "PUBLISH", "ISSUE", "MARK", "ASSIGN", "WAIVE", "PROMOTE", "CONVERT"].map((a) => ({ value: a, label: a }));

/** W44 – who did what: GET /reports/audit-log/ (school login only). */
export default function AuditLog() {
  return (
    <CrudScreen code="W44" title="Audit log" subtitle="Every create / change / delete / approval in your school." service={audit}
      canCreate={false} canEdit={false} canDelete={false} filters={[{ key: "action", label: "Action", options: ACTIONS }]}
      columns={[{ key: "created_at", label: "When", render: (r) => formatDateTime(r.created_at) }, { key: "user_name", label: "Who", render: (r) => r.user_name || "—" },
        { key: "action", label: "Action", render: (r) => <span className="chip">{r.action}</span> }, { key: "model", label: "What", render: (r) => r.model.split(".")[1] || r.model },
        { key: "summary", label: "Details" }, { key: "ip", label: "IP" }]} empty="Nothing logged yet." />
  );
}
