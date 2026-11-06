import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import LoadingState from "../../../components/common/loading_state";
import { FieldGrid } from "../../../components/common/crud_screen";
import { feesService, heads } from "../../../services/fees_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { PATHS } from "../../../lib/route_paths";
import { formatCurrency } from "../../../utils/format_currency";
import { apiErrors } from "../../../utils/validation";

/** W15 – create / edit a plan with its lines. POST or PATCH /fees/plans/ {…, lines:[{head, installment, due_date, amount}]} */
export default function FeePlanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { yearOptions, classOptions, currentYear, notify } = useSchool();
  const [plan, setPlan] = useState(null);
  const [headOpts, setHeadOpts] = useState([]);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    heads.list().then((h) => setHeadOpts(rows(h)));
    if (id === "new") setPlan({ name: "", academic_year: currentYear?.id || "", school_class: "", late_fee_per_day: 0, max_late_fee: 0, lines: [] });
    else feesService.plans.get(id).then(setPlan);
  }, [id, currentYear]);
  if (!plan) return <LoadingState />;
  const set = (k, v) => setPlan((p) => ({ ...p, [k]: v }));
  const setLine = (i, k, v) => setPlan((p) => ({ ...p, lines: p.lines.map((l, j) => (j === i ? { ...l, [k]: v } : l)) }));
  const total = plan.lines.reduce((n, l) => n + Number(l.amount || 0), 0);
  const save = async () => {
    setBusy(true);
    setErrors({});
    try {
      const body = { ...plan, lines: plan.lines.map((l) => ({ ...(l.id ? { id: l.id } : {}), head: Number(l.head), installment: Number(l.installment), due_date: l.due_date, amount: l.amount })) };
      const saved = await feesService.plans.save(body);
      notify("Fee plan saved");
      navigate(PATHS.feePlanForm(saved.id), { replace: true });
      setPlan(saved);
    } catch (e) {
      setErrors(apiErrors(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeader code="W15" title={id === "new" ? "New fee plan" : plan.name} back={{ to: PATHS.feePlans, label: "Fee plans" }} />
      <section className="card form-card">
        {errors._ && <div className="alert alert-error">{errors._}</div>}
        <FieldGrid values={plan} set={set} errors={errors} fields={[
          { name: "name", label: "Plan name", required: true },
          { name: "academic_year", label: "Academic year", type: "select", options: yearOptions, required: true },
          { name: "school_class", label: "Class", type: "select", options: classOptions, required: true },
          { name: "late_fee_per_day", label: "Late fee per day (₹)", type: "number" },
          { name: "max_late_fee", label: "Max late fee (₹, 0 = no cap)", type: "number" },
          { name: "is_active", label: "Active", type: "checkbox" }]} />
      </section>
      <section className="card">
        <div className="card-head"><h3>Lines · total {formatCurrency(total)}</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => set("lines", [...plan.lines, { head: headOpts[0]?.id || "", installment: (plan.lines.at(-1)?.installment || 0) + 1, due_date: "", amount: "" }])}>+ Add line</button></div>
        {!headOpts.length && <div className="alert alert-info">Add fee heads first (Fee plans screen).</div>}
        {errors.lines && <div className="alert alert-error">{errors.lines}</div>}
        <table className="data-table">
          <thead><tr><th>Head</th><th>Installment</th><th>Due date</th><th style={{ textAlign: "right" }}>Amount ₹</th><th /></tr></thead>
          <tbody>
            {plan.lines.map((l, i) => (
              <tr key={l.id || `n${i}`}>
                <td><select value={l.head} onChange={(e) => setLine(i, "head", e.target.value)}>{headOpts.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</select></td>
                <td><input type="number" min="1" value={l.installment} onChange={(e) => setLine(i, "installment", e.target.value)} style={{ width: 80 }} /></td>
                <td><input type="date" value={l.due_date} onChange={(e) => setLine(i, "due_date", e.target.value)} /></td>
                <td style={{ textAlign: "right" }}><input type="number" min="0" value={l.amount} onChange={(e) => setLine(i, "amount", e.target.value)} style={{ width: 120 }} /></td>
                <td><button className="btn btn-ghost btn-sm danger" onClick={() => set("lines", plan.lines.filter((_, j) => j !== i))}>Remove</button></td>
              </tr>
            ))}
            {!plan.lines.length && <tr><td colSpan={5} className="table-empty">Add the first line (e.g. Tuition · installment 1 · 10 Apr · 12,000).</td></tr>}
          </tbody>
        </table>
        <p className="muted small">Lines already billed to students are kept even if removed here.</p>
      </section>
      <div className="form-actions"><button className="btn btn-primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save plan"}</button></div>
    </>
  );
}
