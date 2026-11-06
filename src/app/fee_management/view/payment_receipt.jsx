import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import LoadingState from "../../../components/common/loading_state";
import StatusBadge from "../../../components/common/status_badge";
import ConfirmModal from "../../../components/common/confirm_modal";
import { feesService } from "../../../services/fees_service";
import { useSchool } from "../../../context/school_context";
import { PATHS } from "../../../lib/route_paths";
import { formatCurrency } from "../../../utils/format_currency";
import { formatDate } from "../../../utils/format_date";
import { apiErrors } from "../../../utils/validation";

/** W18 – receipt GET /fees/payments/{id}/ ; print; ask to cancel (POST {id}/cancel/ → approval). */
export default function PaymentReceipt() {
  const { id } = useParams();
  const { school, notify } = useSchool();
  const [p, setP] = useState(null);
  const [cancel, setCancel] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { feesService.receipt(id).then(setP); }, [id]);
  if (!p) return <LoadingState />;
  const ask = async () => {
    try {
      await feesService.cancelReceipt(id, cancel);
      notify("Cancellation sent for approval");
      setCancel(null);
    } catch (e) {
      setErr(apiErrors(e)._ || apiErrors(e).reason);
    }
  };
  return (
    <>
      <PageHeader code="W18" title={`Receipt ${p.receipt_no}`} back={{ to: PATHS.collectionDesk, label: "Collect" }}
        actions={<><button className="btn btn-ghost" onClick={() => window.print()}>Print</button>
          {p.status === "ACTIVE" && <button className="btn btn-ghost danger" onClick={() => { setErr(""); setCancel({ reason: "", is_refund: false }); }}>Cancel / refund</button>}</>} />
      <section className="card receipt">
        <div className="card-head"><h3>{school?.name}</h3><StatusBadge status={p.status === "ACTIVE" ? "paid" : "cancelled"} label={p.status === "ACTIVE" ? "Paid" : "Cancelled"} /></div>
        <dl className="details">
          <dt>Receipt no.</dt><dd>{p.receipt_no}</dd><dt>Date</dt><dd>{formatDate(p.paid_on)}</dd>
          <dt>Student</dt><dd>{p.student_name} ({p.admission_no}) · {p.class_name}</dd><dt>Mode</dt><dd>{p.mode_display}{p.reference ? ` · ${p.reference}` : ""}</dd>
          <dt>Collected by</dt><dd>{p.collected_by_name || "Parent app"}</dd>
        </dl>
        <table className="data-table" style={{ marginTop: 12 }}>
          <thead><tr><th>Head</th><th>Installment</th><th>Due</th><th style={{ textAlign: "right" }}>Paid</th></tr></thead>
          <tbody>
            {p.lines.map((l) => <tr key={l.student_fee}><td>{l.head}</td><td>{l.installment}</td><td>{formatDate(l.due_date)}</td><td style={{ textAlign: "right" }}>{formatCurrency(l.amount, true)}</td></tr>)}
            {Number(p.late_fee) > 0 && <tr><td colSpan={3}>Late fee</td><td style={{ textAlign: "right" }}>{formatCurrency(p.late_fee, true)}</td></tr>}
          </tbody>
          <tfoot><tr><th colSpan={3}>Total</th><th style={{ textAlign: "right" }}>{formatCurrency(p.amount, true)}</th></tr></tfoot>
        </table>
        <p className="muted small"><Link to={`${PATHS.ledger}?student=${p.student}`}>Open ledger</Link></p>
      </section>
      <ConfirmModal open={!!cancel} danger title="Cancel this receipt?" message="The school login approves it in Approvals; then the dues open again." confirmText="Send for approval" onConfirm={ask} onCancel={() => setCancel(null)}>
        {err && <div className="alert alert-error">{err}</div>}
        {cancel && <>
          <div className="field"><label htmlFor="r">Reason</label><textarea id="r" rows={3} value={cancel.reason} onChange={(e) => setCancel({ ...cancel, reason: e.target.value })} /></div>
          <label className="field-check"><input type="checkbox" checked={cancel.is_refund} onChange={(e) => setCancel({ ...cancel, is_refund: e.target.checked })} /> Money was refunded to the parent</label></>}
      </ConfirmModal>
    </>
  );
}
