import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import ConfirmModal from "../../../components/common/confirm_modal";
import { feesService } from "../../../services/fees_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { formatCurrency } from "../../../utils/format_currency";

/** W16 – preview, then bill a plan to its class: GET /fees/plans/{id}/preview/ · POST {id}/assign/. Safe to repeat. */
export default function AssessmentPreview() {
  const { notify } = useSchool();
  const [sp, setSp] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [preview, setPreview] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const plan = sp.get("plan") || "";
  useEffect(() => { feesService.plans.list({ is_active: true }).then((d) => setPlans(rows(d))); }, []);
  const load = () => plan && feesService.preview(plan).then(setPreview);
  useEffect(() => { setPreview(null); load(); }, [plan]);
  const assign = async () => {
    const r = await feesService.assign(plan);
    notify(`${r.created} fee lines billed`);
    setConfirm(false);
    load();
  };
  return (
    <>
      <PageHeader code="W16" title="Bill students" subtitle="Creates the dues of every active student of the class. New admissions? Run it again – existing dues are skipped." />
      <div className="card toolbar-card">
        <div className="field"><label htmlFor="plan">Fee plan</label>
          <select id="plan" value={plan} onChange={(e) => setSp({ plan: e.target.value })}><option value="">Choose…</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.class_name} · {p.academic_year_name}</option>)}</select></div>
        {preview && <div className="toolbar-summary"><span>Students <b>{preview.students}</b></span><span>Plan total <b>{formatCurrency(preview.plan_total)}</b></span><span>New billing <b>{formatCurrency(preview.total_new_amount)}</b></span></div>}
        {preview && <button className="btn btn-primary" disabled={!Number(preview.total_new_amount)} onClick={() => setConfirm(true)}>Bill {preview.rows.filter((r) => r.new_lines).length} students</button>}
      </div>
      {preview && <DataTable rows={preview.rows} rowKey="student" empty="No active students in this class."
        columns={[{ key: "name", label: "Student", render: (r) => <span><strong>{r.name}</strong> <small className="muted">{r.admission_no}</small></span> },
          { key: "already_assigned", label: "Already billed lines", align: "right" }, { key: "new_lines", label: "New lines", align: "right" },
          { key: "amount", label: "New amount", align: "right", render: (r) => formatCurrency(r.amount) }]} />}
      <ConfirmModal open={confirm} title="Bill students?" message={`Creates ${formatCurrency(preview?.total_new_amount)} of dues. Parents see them in the Parent app.`} confirmText="Bill now" onConfirm={assign} onCancel={() => setConfirm(false)} />
    </>
  );
}
