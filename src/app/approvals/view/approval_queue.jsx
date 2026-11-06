import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import FilterBar from "../../../components/common/filter_bar";
import StatusBadge from "../../../components/common/status_badge";
import { approvalsService, APPROVAL_TYPES } from "../../../services/approvals_service";
import { useSchool } from "../../../context/school_context";
import { PATHS } from "../../../lib/route_paths";
import { formatDateTime } from "../../../utils/format_date";

/** W38 – everything waiting for a yes / no: GET /approvals/?status=&type= */
export default function ApprovalQueue() {
  const { notify } = useSchool();
  const navigate = useNavigate();
  const [f, setF] = useState({ status: "PENDING" });
  const [data, setData] = useState(null);
  const load = () => approvalsService.queue({ status: f.status || "ALL", type: f.type }).then(setData);
  useEffect(() => { load(); }, [f.status, f.type]);
  const decide = async (r, ok) => {
    try {
      await approvalsService.decide(r.type, r.id, ok);
      notify(ok ? "Approved" : "Rejected");
      load();
    } catch (e) {
      notify(e.message, "error");
    }
  };
  return (
    <>
      <PageHeader code="W38" title="Approvals" subtitle={data ? `${data.pending_total} waiting` : ""} />
      {data && <div className="chip-row" style={{ marginBottom: 12 }}>
        {APPROVAL_TYPES.map((t) => <button key={t.value} className={`chip chip-toggle ${f.type === t.value ? "on" : ""}`} onClick={() => setF((x) => ({ ...x, type: x.type === t.value ? undefined : t.value }))}>{t.label} · {data.pending_counts[t.value]}</button>)}
      </div>}
      <FilterBar filters={[{ key: "status", label: "Status", all: "All", options: [{ value: "PENDING", label: "Pending" }, { value: "APPROVED", label: "Approved" }, { value: "REJECTED", label: "Rejected" }] }]}
        values={f} onChange={(k, v) => setF((x) => ({ ...x, [k]: v }))} />
      <DataTable rows={(data?.results || []).map((r) => ({ ...r, key: `${r.type}-${r.id}` }))} rowKey="key" loading={!data} empty="Nothing waiting."
        onRowClick={(r) => navigate(PATHS.approvalDetail(r.type, r.id))}
        columns={[
          { key: "type_label", label: "Type", render: (r) => <span className="chip">{r.type_label}</span> },
          { key: "title", label: "Request", render: (r) => <strong>{r.title}</strong> },
          { key: "requested_by", label: "Asked by", render: (r) => r.requested_by || "—" },
          { key: "created_at", label: "When", render: (r) => formatDateTime(r.created_at) },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status.toLowerCase()} /> },
          { key: "act", label: "", align: "right", render: (r) => r.status === "PENDING" && (
            <span className="row-actions" onClick={(e) => e.stopPropagation()}>
              <button className="btn btn-primary btn-sm" onClick={() => decide(r, true)}>Approve</button>
              <button className="btn btn-ghost btn-sm" onClick={() => decide(r, false)}>Reject</button></span>) },
        ]} />
    </>
  );
}
