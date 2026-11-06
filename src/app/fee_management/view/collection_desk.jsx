import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import SearchBar from "../../../components/common/search_bar";
import StatusBadge from "../../../components/common/status_badge";
import { FieldGrid } from "../../../components/common/crud_screen";
import { feesService, MODES } from "../../../services/fees_service";
import { studentsService } from "../../../services/students_service";
import { useDebounce } from "../../../hooks/use_debounce";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { PATHS } from "../../../lib/route_paths";
import { formatCurrency } from "../../../utils/format_currency";
import { formatDate } from "../../../utils/format_date";
import { apiErrors } from "../../../utils/validation";

/** W17 – find a student, see dues, take payment: POST /fees/payments/collect/ (receipt goes on WhatsApp). */
export default function CollectionDesk() {
  const { notify } = useSchool();
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState("");
  const query = useDebounce(q, 300);
  const [found, setFound] = useState([]);
  const studentId = sp.get("student");
  const [student, setStudent] = useState(null);
  const [summary, setSummary] = useState(null);
  const [dues, setDues] = useState([]);
  const [pick, setPick] = useState([]);
  const [pay, setPay] = useState({ mode: "CASH", amount: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (query.length < 2) return setFound([]);
    studentsService.list({ search: query, status: "ACTIVE", page_size: 10 }).then((d) => setFound(rows(d)));
  }, [query]);
  const load = () => {
    if (!studentId) return;
    Promise.all([studentsService.get(studentId), feesService.summary(studentId), feesService.studentFees.list({ student: studentId, status__in: "UNPAID,PARTIAL", page_size: 100 })])
      .then(([s, sm, d]) => { setStudent(s); setSummary(sm); setDues(rows(d)); setPick([]); setPay({ mode: "CASH", amount: String(Number(sm.balance) + Number(sm.late_fee)) }); });
  };
  useEffect(load, [studentId]);
  useEffect(() => {
    if (!pick.length || !summary) return;
    const sum = dues.filter((d) => pick.includes(d.id)).reduce((n, d) => n + Number(d.balance), 0);
    setPay((p) => ({ ...p, amount: String(sum + Number(summary.late_fee)) }));
  }, [pick]);

  const collect = async () => {
    setBusy(true);
    setErrors({});
    try {
      const r = await feesService.collect({ student: Number(studentId), amount: pay.amount, mode: pay.mode, reference: pay.reference || "",
        note: pay.note || "", ...(pick.length ? { student_fee_ids: pick } : {}), ...(pay.waive_late ? { late_fee: 0 } : {}) });
      notify(`Receipt ${r.receipt_no} · sent to the parent`);
      navigate(PATHS.receipt(r.id));
    } catch (e) {
      setErrors(apiErrors(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeader code="W17" title="Collect fees" subtitle="Search by name, admission no. or parent mobile." />
      <div className="card">
        <SearchBar value={q} onChange={setQ} placeholder="Student name / admission no / parent mobile" autoFocus />
        {found.length > 0 && (
          <div className="chip-row" style={{ marginTop: 8 }}>
            {found.map((s) => <button key={s.id} className="chip chip-toggle" onClick={() => { setSp({ student: s.id }); setQ(""); }}>{s.full_name} · {s.class_name}{s.section_name ? `-${s.section_name}` : ""} · {s.admission_no}</button>)}
          </div>
        )}
      </div>
      {student && summary && (
        <div className="grid-2-wide">
          <section className="card">
            <div className="card-head"><h3>{student.full_name} · {student.class_name}{student.section_name ? `-${student.section_name}` : ""}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate(`${PATHS.ledger}?student=${student.id}`)}>Ledger</button></div>
            <div className="toolbar-summary"><span>Total <b>{formatCurrency(summary.total)}</b></span><span>Paid <b>{formatCurrency(summary.paid)}</b></span>
              <span>Discount <b>{formatCurrency(summary.discount)}</b></span><span>Balance <b>{formatCurrency(summary.balance)}</b></span>
              <span>Overdue <b className="danger-text">{formatCurrency(summary.overdue)}</b></span><span>Late fee today <b>{formatCurrency(summary.late_fee)}</b></span></div>
            <DataTable rows={dues} selectable selected={pick} onSelect={setPick} empty="No dues – fully paid."
              columns={[{ key: "head_name", label: "Head" }, { key: "installment", label: "Inst.", align: "right" },
                { key: "due_date", label: "Due", render: (d) => formatDate(d.due_date) }, { key: "amount", label: "Amount", align: "right", render: (d) => formatCurrency(d.amount) },
                { key: "balance", label: "Balance", align: "right", render: (d) => <b>{formatCurrency(d.balance)}</b> }, { key: "status", label: "", render: (d) => <StatusBadge status={d.status === "PARTIAL" ? "pending" : "overdue"} label={d.status === "PARTIAL" ? "Part paid" : "Unpaid"} /> }]} />
            <p className="muted small">Tick dues to pay only those; otherwise the amount goes to the oldest dues first.</p>
          </section>
          <section className="card form-card">
            <div className="card-head"><h3>Payment</h3></div>
            {errors._ && <div className="alert alert-error">{errors._}</div>}
            <FieldGrid values={pay} errors={errors} set={(k, v) => setPay((p) => ({ ...p, [k]: v }))} fields={[
              { name: "amount", label: "Amount received ₹", type: "number", required: true, span: true },
              { name: "mode", label: "Mode", type: "select", options: MODES, placeholder: null },
              { name: "reference", label: "UPI ref / cheque no.", hidden: (v) => v.mode === "CASH" },
              { name: "waive_late", label: `Waive late fee (${formatCurrency(summary.late_fee)})`, type: "checkbox", hidden: () => !Number(summary.late_fee) },
              { name: "note", label: "Note", span: true }]} />
            <div className="form-actions"><button className="btn btn-primary" disabled={busy || !Number(pay.amount)} onClick={collect}>{busy ? "Saving…" : `Collect ${formatCurrency(pay.amount)}`}</button></div>
          </section>
        </div>
      )}
    </>
  );
}
