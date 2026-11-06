import { useEffect, useState } from "react";
import CrudScreen from "../../../components/common/crud_screen";
import StatusBadge from "../../../components/common/status_badge";
import { useStudentOptions, STATUS_FILTER } from "../../attendance/view/student_leaves";
import { cancellations, discounts, feesService } from "../../../services/fees_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { formatCurrency } from "../../../utils/format_currency";
import { formatDate } from "../../../utils/format_date";

/** W20 – fee discounts (approval → dues reduced) and receipt cancellations / refunds (approval → dues re-open). */
export default function FinancialCorrections() {
  const { notify } = useSchool();
  const students = useStudentOptions();
  const [headOpts, setHeadOpts] = useState([]);
  useEffect(() => { feesService.heads.list().then((h) => setHeadOpts(rows(h).map((x) => ({ value: x.id, label: x.name })))); }, []);
  const decide = (svc, r, ok, reload) => svc.action(r.id, ok ? "approve" : "reject").then(() => { notify(ok ? "Approved" : "Rejected"); reload(); }).catch((e) => notify(e.message, "error"));
  const buttons = (svc) => (r, reload) => r.status === "PENDING" && (<>
    <button className="btn btn-primary btn-sm" onClick={() => decide(svc, r, true, reload)}>Approve</button>
    <button className="btn btn-ghost btn-sm" onClick={() => decide(svc, r, false, reload)}>Reject</button></>);
  return (
    <>
      <CrudScreen code="W20" title="Discounts" subtitle="Sibling, staff ward, merit … Approval by the school login reduces the dues."
        service={discounts} canEdit={false} search={false} createLabel="+ New discount" filters={[STATUS_FILTER]} defaults={{ discount_type: "AMOUNT" }}
        fields={[{ name: "student", label: "Student", type: "select", options: students, required: true, span: true },
          { name: "head", label: "Fee head (empty = all)", type: "select", options: headOpts },
          { name: "discount_type", label: "Type", type: "select", options: [{ value: "AMOUNT", label: "Fixed ₹" }, { value: "PERCENT", label: "Percent" }], placeholder: null },
          { name: "value", label: "Value", type: "number", required: true }, { name: "reason", label: "Reason", required: true, span: true }]}
        columns={[{ key: "student_name", label: "Student", render: (r) => <strong>{r.student_name}</strong> }, { key: "head_name", label: "Head", render: (r) => r.head_name || "All" },
          { key: "value", label: "Value", render: (r) => r.discount_type === "PERCENT" ? `${Number(r.value)}%` : formatCurrency(r.value) },
          { key: "applied_amount", label: "Applied", align: "right", render: (r) => formatCurrency(r.applied_amount) }, { key: "reason", label: "Reason" },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status.toLowerCase()} /> }]}
        rowActions={buttons(discounts)} empty="No discounts." />
      <div style={{ height: 24 }} />
      <CrudScreen title="Receipt cancellations & refunds" subtitle="Asked from a receipt (Cancel / refund)." service={cancellations}
        canCreate={false} canEdit={false} canDelete={false} search={false} filters={[STATUS_FILTER]}
        columns={[{ key: "receipt_no", label: "Receipt", render: (r) => <strong>{r.receipt_no}</strong> }, { key: "student_name", label: "Student" },
          { key: "amount", label: "Amount", align: "right", render: (r) => formatCurrency(r.amount) }, { key: "is_refund", label: "Refund", render: (r) => (r.is_refund ? "Yes" : "No") },
          { key: "reason", label: "Reason" }, { key: "created_at", label: "Asked", render: (r) => formatDate(r.created_at) },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status.toLowerCase()} /> }]}
        rowActions={buttons(cancellations)} empty="No cancellation requests." />
    </>
  );
}
