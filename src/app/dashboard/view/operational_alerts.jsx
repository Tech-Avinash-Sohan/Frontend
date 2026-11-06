import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import LoadingState from "../../../components/common/loading_state";
import { studentsService } from "../../../services/students_service";
import { notificationsService } from "../../../services/notifications_service";
import { reportsService } from "../../../services/reports_service";
import { formatCurrency } from "../../../utils/format_currency";
import { rows } from "../../../lib/api_client";
import { PATHS } from "../../../lib/route_paths";
import { formatDateTime } from "../../../utils/format_date";

/** W02 – what needs attention: parents who have not paid, messages that failed, students without a section. */
export default function OperationalAlerts() {
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([
      studentsService.parents({ app_status: false, page_size: 1 }),
      notificationsService.logs({ status: "FAILED", page_size: 5 }),
      studentsService.list({ status: "ACTIVE", page_size: 200 }),
      reportsService.dashboard(),
    ]).then(([p, f, s, d]) => setData({ unpaid: p.count, failed: rows(f), failedCount: f.count, noSection: rows(s).filter((x) => !x.section), d }));
  }, []);

  if (!data) return <LoadingState />;
  const a = data.d.attendance_today;
  const notMarked = a.sections_total - a.sections_marked;
  const none = !data.unpaid && !data.failedCount && !data.noSection.length && !notMarked && !data.d.pending_approvals && !Number(data.d.fees_overdue);
  return (
    <>
      <PageHeader code="W02" title="Needs attention" subtitle="Things the office should follow up today." />
      {none && <div className="card"><p className="muted">Nothing needs attention.</p></div>}
      <div className="alert-list">
        {notMarked > 0 && (
          <div className="alert-card sev-high">
            <div><strong>{notMarked} sections have not marked attendance today</strong><div className="alert-meta">{a.sections_marked} of {a.sections_total} done</div></div>
            <div className="alert-actions"><Link className="btn btn-ghost btn-sm" to={PATHS.attendance}>Open</Link></div>
          </div>
        )}
        {data.d.pending_approvals > 0 && (
          <div className="alert-card">
            <div><strong>{data.d.pending_approvals} requests waiting for your approval</strong><div className="alert-meta">Leave, discounts, cancellations, certificates, corrections</div></div>
            <div className="alert-actions"><Link className="btn btn-ghost btn-sm" to={PATHS.approvals}>Approvals</Link></div>
          </div>
        )}
        {Number(data.d.fees_overdue) > 0 && (
          <div className="alert-card">
            <div><strong>{formatCurrency(data.d.fees_overdue)} fees overdue</strong><div className="alert-meta">Send reminders from the fee dues report.</div></div>
            <div className="alert-actions"><Link className="btn btn-ghost btn-sm" to={PATHS.feeDuesReport}>Fee dues</Link></div>
          </div>
        )}
        {data.unpaid > 0 && (
          <div className="alert-card">
            <div><strong>{data.unpaid} parents have not paid for the Parent app</strong><div className="alert-meta">They can log in but only see the instructions and payment screens.</div></div>
            <div className="alert-actions"><Link className="btn btn-ghost btn-sm" to={PATHS.guardianAccess}>Open parents</Link></div>
          </div>
        )}
        {data.failedCount > 0 && (
          <div className="alert-card">
            <div>
              <strong>{data.failedCount} WhatsApp / e-mail messages failed</strong>
              <div className="alert-meta">{data.failed.map((l) => `${l.channel} to ${l.to} (${formatDateTime(l.created_at)})`).join(" · ")}</div>
            </div>
            <div className="alert-actions"><Link className="btn btn-ghost btn-sm" to={PATHS.messages}>Open log</Link></div>
          </div>
        )}
        {data.noSection.length > 0 && (
          <div className="alert-card">
            <div><strong>{data.noSection.length} students have no section</strong><div className="alert-meta">{data.noSection.slice(0, 6).map((s) => s.full_name).join(", ")}</div></div>
            <div className="alert-actions"><Link className="btn btn-ghost btn-sm" to={PATHS.enrollment}>Assign sections</Link></div>
          </div>
        )}
      </div>
    </>
  );
}
