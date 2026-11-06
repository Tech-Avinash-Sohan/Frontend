import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import ConfirmModal from "../../../components/common/confirm_modal";
import { FieldGrid } from "../../../components/common/crud_screen";
import { feesService, heads } from "../../../services/fees_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { PATHS } from "../../../lib/route_paths";
import { formatCurrency } from "../../../utils/format_currency";
import { apiErrors } from "../../../utils/validation";

/** W14 – fee plans per class & year (/fees/plans/) and fee heads (/fees/heads/). */
export default function FeePlanList() {
  const { yearOptions, currentYear, classOptions, notify } = useSchool();
  const navigate = useNavigate();
  const [year, setYear] = useState("");
  const [plans, setPlans] = useState([]);
  const [headRows, setHeadRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null);
  const [errors, setErrors] = useState({});
  const y = year || currentYear?.id || "";

  const load = () => {
    setLoading(true);
    Promise.all([feesService.plans.list({ academic_year: y || undefined }), heads.list()]).then(([p, h]) => {
      setPlans(rows(p));
      setHeadRows(rows(h));
    }).finally(() => setLoading(false));
  };
  useEffect(load, [y]);

  const saveHead = async () => {
    try {
      await heads.save(edit);
      notify("Fee head saved");
      setEdit(null);
      load();
    } catch (e) {
      setErrors(apiErrors(e));
    }
  };
  return (
    <>
      <PageHeader code="W14" title="Fee plans" subtitle="One plan per class per year: heads × installments × due dates."
        actions={<><select value={y} onChange={(e) => setYear(e.target.value)} aria-label="Year">{yearOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          <Link className="btn btn-primary" to={PATHS.feePlanForm()}>+ New plan</Link></>} />
      {!classOptions.length && <div className="alert alert-info">Add classes in Academics first.</div>}
      <DataTable rows={plans} loading={loading} empty="No fee plans for this year." onRowClick={(p) => navigate(PATHS.feePlanForm(p.id))}
        columns={[
          { key: "name", label: "Plan", render: (p) => <strong>{p.name}</strong> },
          { key: "class_name", label: "Class" },
          { key: "lines", label: "Lines", align: "right", render: (p) => p.lines.length },
          { key: "total", label: "Total / student", align: "right", render: (p) => formatCurrency(p.total) },
          { key: "students_assigned", label: "Students billed", align: "right" },
          { key: "act", label: "", align: "right", render: (p) => <span className="row-actions" onClick={(e) => e.stopPropagation()}>
            <Link className="btn btn-ghost btn-sm" to={`${PATHS.feeAssessment}?plan=${p.id}`}>Bill students</Link></span> },
        ]} />
      <section className="card">
        <div className="card-head"><h3>Fee heads</h3><button className="btn btn-ghost btn-sm" onClick={() => { setErrors({}); setEdit({ order: headRows.length + 1 }); }}>+ Add head</button></div>
        <div className="chip-row">
          {headRows.map((h) => <button key={h.id} className="chip chip-toggle" onClick={() => { setErrors({}); setEdit(h); }}>{h.name}{h.is_one_time ? " · one time" : ""}</button>)}
          {!headRows.length && <span className="muted">Add Tuition, Admission, Transport …</span>}
        </div>
      </section>
      <ConfirmModal open={!!edit} title={edit?.id ? "Edit fee head" : "New fee head"} confirmText="Save" onConfirm={saveHead} onCancel={() => setEdit(null)}>
        {errors._ && <div className="alert alert-error">{errors._}</div>}
        {edit && <FieldGrid values={edit} errors={errors} set={(k, v) => setEdit((e) => ({ ...e, [k]: v }))} fields={[
          { name: "name", label: "Name", required: true }, { name: "code", label: "Code" }, { name: "order", label: "Order", type: "number" },
          { name: "is_one_time", label: "One-time fee (e.g. admission)", type: "checkbox" }, { name: "is_refundable", label: "Refundable", type: "checkbox" }]} />}
      </ConfirmModal>
    </>
  );
}
