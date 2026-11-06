import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import LoadingState from "../../../components/common/loading_state";
import StatusBadge from "../../../components/common/status_badge";
import { approvalsService } from "../../../services/approvals_service";
import { useSchool } from "../../../context/school_context";
import { PATHS } from "../../../lib/route_paths";
import { formatDateTime } from "../../../utils/format_date";
import { apiErrors } from "../../../utils/validation";

/** W39 – one request with a note: POST /approvals/{type}/{id}/approve|reject/ {note} */
export default function ApprovalDetail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { notify } = useSchool();
  const [r, setR] = useState(null);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => { approvalsService.get(type, id).then(setR).catch((e) => setErr(e.message)); }, [type, id]);
  if (err && !r) return <LoadingState error={err} />;
  if (!r) return <LoadingState />;
  const decide = async (ok) => {
    try {
      await approvalsService.decide(type, id, ok, note);
      notify(ok ? "Approved" : "Rejected");
      navigate(PATHS.approvals);
    } catch (e) {
      setErr(apiErrors(e)._);
    }
  };
  return (
    <>
      <PageHeader code="W39" title={r.type_label} back={{ to: PATHS.approvals, label: "Approvals" }} />
      <section className="card form-card">
        {err && <div className="alert alert-error">{err}</div>}
        <h3>{r.title}</h3>
        <dl className="details">
          <dt>Status</dt><dd><StatusBadge status={r.status.toLowerCase()} /></dd>
          <dt>Asked by</dt><dd>{r.requested_by || "—"} · {formatDateTime(r.created_at)}</dd>
          {r.decided_by && <><dt>Decided by</dt><dd>{r.decided_by} · {formatDateTime(r.decided_at)}</dd><dt>Note</dt><dd>{r.decision_note || "—"}</dd></>}
        </dl>
        {r.school_login_only && <p className="muted small">Only the school login can decide this.</p>}
        {r.status === "PENDING" && (<>
          <div className="field"><label htmlFor="note">Note (sent with the decision)</label><textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></div>
          <div className="form-actions"><button className="btn btn-ghost" onClick={() => decide(false)}>Reject</button><button className="btn btn-primary" onClick={() => decide(true)}>Approve</button></div></>)}
      </section>
    </>
  );
}
