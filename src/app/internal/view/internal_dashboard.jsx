import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import LoadingState from "../../../components/common/loading_state";
import DataTable from "../../../components/common/data_table";
import StatusBadge from "../../../components/common/status_badge";
import { internalService } from "../../../services/internal_service";
import { notificationsService } from "../../../services/notifications_service";
import { useAuth } from "../../../hooks/use_auth";
import { rows } from "../../../lib/api_client";
import { PATHS } from "../../../lib/route_paths";
import { formatCurrency } from "../../../utils/format_currency";
import { formatDateTime } from "../../../utils/format_date";

/** GET /internal/dashboard/ + latest schools + latest messages. */
export default function InternalDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [schools, setSchools] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    Promise.all([internalService.dashboard(), internalService.schools({ page_size: 6 }), notificationsService.logs({ page_size: 6 })])
      .then(([d, s, l]) => {
        setData(d);
        setSchools(rows(s));
        setLogs(rows(l));
      })
      .catch((e) => setError(e.message));
  };
  useEffect(load, []);

  if (error) return <LoadingState error={error} onRetry={load} />;
  if (!data) return <LoadingState />;
  const paidPct = data.parents ? Math.round((data.parents_app_active / data.parents) * 100) : 0;

  return (
    <>
      <PageHeader
        title={`Hello, ${user?.first_name || ""}`}
        subtitle="All schools at a glance"
        actions={<Link to={PATHS.internalSchoolForm()} className="btn btn-primary">+ Create school</Link>}
      />
      <section className="stat-grid">
        <button className="stat-card" onClick={() => navigate(PATHS.internalSchools)}>
          <span className="stat-label">Schools</span>
          <strong className="stat-value">{data.schools}</strong>
          <span className="stat-note">{data.schools_active} active</span>
        </button>
        <div className="stat-card">
          <span className="stat-label">Students</span>
          <strong className="stat-value">{data.students}</strong>
          <span className="stat-note">across all schools</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Parents with active app</span>
          <strong className="stat-value">{data.parents_app_active}</strong>
          <span className="stat-note">{paidPct}% of {data.parents} parents</span>
        </div>
        <button className="stat-card" onClick={() => navigate(PATHS.internalPayments)}>
          <span className="stat-label">Parent app collected</span>
          <strong className="stat-value">{formatCurrency(data.parent_app_collected)}</strong>
          <span className="stat-note">all time</span>
        </button>
      </section>

      <div className="grid-2">
        <section className="card">
          <div className="card-head">
            <h3>Latest schools</h3>
            <Link to={PATHS.internalSchools}>All schools →</Link>
          </div>
          <DataTable
            rows={schools}
            onRowClick={(s) => navigate(PATHS.internalSchool(s.id))}
            empty="No schools yet – create the first one."
            columns={[
              { key: "name", label: "School", render: (s) => <span><strong>{s.name}</strong><br /><small className="muted">{s.code} · {s.city || "—"}</small></span> },
              { key: "board", label: "Board" },
              { key: "is_active", label: "Status", render: (s) => <StatusBadge status={s.is_active} label={s.is_active ? "Active" : "Switched off"} /> },
            ]}
          />
        </section>
        <section className="card">
          <div className="card-head">
            <h3>Latest messages</h3>
            <Link to={PATHS.internalMessages}>Full log →</Link>
          </div>
          {logs.length === 0 ? (
            <p className="muted">No messages yet.</p>
          ) : (
            <ul className="list">
              {logs.map((l) => (
                <li key={l.id}>
                  <span>
                    <strong>{l.event.replace(/_/g, " ").toLowerCase()}</strong>
                    <small className="muted"> · {l.channel} to {l.to} · {formatDateTime(l.created_at)}</small>
                  </span>
                  <StatusBadge status={l.status === "SENT" ? "sent" : l.status === "FAILED" ? "error" : "pending"} label={l.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
