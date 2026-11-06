import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import LoadingState from "../../../components/common/loading_state";
import StatusBadge from "../../../components/common/status_badge";
import ConfirmModal from "../../../components/common/confirm_modal";
import DataTable from "../../../components/common/data_table";
import { internalService } from "../../../services/internal_service";
import { paymentsService } from "../../../services/payments_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { PATHS } from "../../../lib/route_paths";
import { formatCurrency } from "../../../utils/format_currency";
import { formatDate } from "../../../utils/format_date";

/** One school: details, stats, switch on/off, resend login, its parent app payments. */
export default function SchoolDetail() {
  const { id } = useParams();
  const { notify } = useSchool();
  const [school, setSchool] = useState(null);
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [modal, setModal] = useState(null); // "toggle" | "resend"
  const [busy, setBusy] = useState(false);
  const [login, setLogin] = useState(null);
  const [error, setError] = useState("");

  const load = () =>
    Promise.all([internalService.school(id), internalService.stats(id), paymentsService.list({ school: id, page_size: 10 })])
      .then(([s, st, p]) => {
        setSchool(s);
        setStats(st);
        setPayments(rows(p));
      })
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const confirm = async () => {
    setBusy(true);
    try {
      if (modal === "toggle") {
        setSchool(await internalService.setActive(id, !school.is_active));
        notify(school.is_active ? "School switched off – its logins stop working" : "School switched on");
      } else {
        setLogin(await internalService.resendLogin(id));
        notify("New password sent by WhatsApp and e-mail");
      }
      setModal(null);
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  if (error) return <LoadingState error={error} onRetry={load} />;
  if (!school || !stats) return <LoadingState />;

  return (
    <>
      <PageHeader
        title={school.name}
        subtitle={`${school.code} · ${school.city || "—"} · ${school.board}`}
        back={{ to: PATHS.internalSchools, label: "Schools" }}
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setModal("resend")}>Resend login</button>
            <Link className="btn btn-ghost" to={PATHS.internalSchoolForm(id)}>Edit</Link>
            <button className={`btn ${school.is_active ? "btn-danger-ghost" : "btn-primary"}`} onClick={() => setModal("toggle")}>
              {school.is_active ? "Switch off" : "Switch on"}
            </button>
          </>
        }
      />
      {login && (
        <div className="alert alert-success">
          New login sent – mobile <strong>{login.mobile}</strong>, password <strong>{login.password}</strong>
        </div>
      )}
      <section className="stat-grid">
        <div className="stat-card"><span className="stat-label">Active students</span><strong className="stat-value">{stats.students}</strong></div>
        <div className="stat-card"><span className="stat-label">Teachers / staff</span><strong className="stat-value">{stats.teachers} / {stats.staff}</strong></div>
        <div className="stat-card"><span className="stat-label">Parents with active app</span><strong className="stat-value">{stats.parents_app_active} / {stats.parents}</strong></div>
        <div className="stat-card"><span className="stat-label">Parent app collected</span><strong className="stat-value">{formatCurrency(stats.parent_app_collected)}</strong></div>
      </section>

      <div className="grid-2">
        <section className="card">
          <div className="card-head"><h3>Details</h3><StatusBadge status={school.is_active} label={school.is_active ? "Active" : "Switched off"} /></div>
          <div className="details">
            <div className="details-row"><span>Login</span><strong>{school.contact_name} · {school.login_mobile}</strong></div>
            <div className="details-row"><span>Principal</span><strong>{school.principal_name || "—"}</strong></div>
            <div className="details-row"><span>E-mail</span><strong>{school.email || "—"}</strong></div>
            <div className="details-row"><span>Address</span><strong>{school.address || "—"}</strong></div>
            <div className="details-row"><span>Medium</span><strong>{school.medium}</strong></div>
            <div className="details-row"><span>Parent app fee</span><strong>{school.parent_app_fee ? `₹${school.parent_app_fee} per year` : "Free"}</strong></div>
            <div className="details-row"><span>Licence till</span><strong>{school.licence_valid_till ? formatDate(school.licence_valid_till) : "No end date"}</strong></div>
            <div className="details-row"><span>Created</span><strong>{formatDate(school.created_at)}</strong></div>
          </div>
        </section>
        <section className="card">
          <div className="card-head"><h3>Parent app payments</h3><Link to={`${PATHS.internalPayments}?school=${id}`}>All →</Link></div>
          <DataTable
            rows={payments}
            empty="No payments yet."
            columns={[
              { key: "parent_name", label: "Parent", render: (p) => <span>{p.parent_name}<br /><small className="muted">{p.parent_mobile}</small></span> },
              { key: "amount", label: "Amount", align: "right", render: (p) => formatCurrency(p.amount) },
              { key: "valid_till", label: "Valid till", render: (p) => (p.valid_till ? formatDate(p.valid_till) : "—") },
              { key: "status", label: "Status", render: (p) => <StatusBadge status={p.status === "SUCCESS" ? "paid" : p.status === "FAILED" ? "error" : "pending"} label={p.status} /> },
            ]}
          />
        </section>
      </div>

      <ConfirmModal
        open={!!modal}
        title={modal === "toggle" ? (school.is_active ? "Switch off this school?" : "Switch on this school?") : "Send a new password?"}
        message={modal === "toggle" ? (school.is_active ? "The school, its teachers and parents can no longer use any app until you switch it on." : "Everyone at this school can log in again.") : `A new password goes to ${school.login_mobile} on WhatsApp and e-mail. The old one stops working.`}
        confirmText={modal === "toggle" ? (school.is_active ? "Switch off" : "Switch on") : "Send"}
        danger={modal === "toggle" && school.is_active}
        busy={busy}
        onConfirm={confirm}
        onCancel={() => setModal(null)}
      />
    </>
  );
}
