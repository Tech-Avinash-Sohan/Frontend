import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import ConfirmModal from "../../../components/common/confirm_modal";
import { FieldGrid } from "../../../components/common/crud_screen";
import { useStudentOptions } from "../../attendance/view/student_leaves";
import { feesService } from "../../../services/fees_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { PATHS } from "../../../lib/route_paths";
import { formatCurrency } from "../../../utils/format_currency";
import { formatDate } from "../../../utils/format_date";
import { apiErrors } from "../../../utils/validation";

/** W19 – every due and receipt of one student with running balance: GET /fees/student-fees/ledger/?student= */
export default function StudentLedger() {
  const { notify, currentYear } = useSchool();
  const [sp, setSp] = useSearchParams();
  const student = sp.get("student") || "";
  const students = useStudentOptions();
  const [data, setData] = useState(null);
  const [extra, setExtra] = useState(null);
  const [headOpts, setHeadOpts] = useState([]);
  const [errors, setErrors] = useState({});
  const load = () => student && feesService.ledger(student).then(setData);
  useEffect(() => { setData(null); load(); }, [student]);
  useEffect(() => { feesService.heads.list().then((h) => setHeadOpts(rows(h).map((x) => ({ value: x.id, label: x.name })))); }, []);
  const addDue = async () => {
    try {
      await feesService.studentFees.save({ ...extra, student: Number(student), academic_year: currentYear?.id });
      notify("Due added");
      setExtra(null);
      load();
    } catch (e) {
      setErrors(apiErrors(e));
    }
  };
  const s = data?.summary;
  return (
    <>
      <PageHeader code="W19" title="Student ledger" actions={student && <><button className="btn btn-ghost" onClick={() => { setErrors({}); setExtra({ installment: 1 }); }}>+ One-off due</button>
        <Link className="btn btn-primary" to={`${PATHS.collectionDesk}?student=${student}`}>Collect</Link></>} />
      <div className="card toolbar-card">
        <div className="field" style={{ minWidth: 360 }}><label htmlFor="st">Student</label>
          <select id="st" value={student} onChange={(e) => setSp({ student: e.target.value })}><option value="">Choose…</option>{students.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
        {s && <div className="toolbar-summary"><span>Total <b>{formatCurrency(s.total)}</b></span><span>Discount <b>{formatCurrency(s.discount)}</b></span><span>Paid <b>{formatCurrency(s.paid)}</b></span><span>Balance <b>{formatCurrency(s.balance)}</b></span><span>Overdue <b className="danger-text">{formatCurrency(s.overdue)}</b></span></div>}
      </div>
      {data && <DataTable rows={data.entries.map((e, i) => ({ ...e, id: i }))} empty="No dues or receipts yet."
        columns={[{ key: "date", label: "Date", render: (e) => formatDate(e.date) }, { key: "text", label: "Entry", render: (e) => e.payment ? <Link to={PATHS.receipt(e.payment)}>{e.text}</Link> : e.text },
          { key: "debit", label: "Debit", align: "right", render: (e) => Number(e.debit) ? formatCurrency(e.debit, true) : "" },
          { key: "credit", label: "Credit", align: "right", render: (e) => Number(e.credit) ? formatCurrency(e.credit, true) : "" },
          { key: "balance", label: "Balance", align: "right", render: (e) => <b>{formatCurrency(e.balance, true)}</b> }]} />}
      <ConfirmModal open={!!extra} title="Add a one-off due" confirmText="Add" onConfirm={addDue} onCancel={() => setExtra(null)}>
        {errors._ && <div className="alert alert-error">{errors._}</div>}
        {extra && <FieldGrid values={extra} errors={errors} set={(k, v) => setExtra((x) => ({ ...x, [k]: v }))} fields={[
          { name: "head", label: "Head", type: "select", options: headOpts, required: true }, { name: "amount", label: "Amount ₹", type: "number", required: true },
          { name: "due_date", label: "Due date", type: "date", required: true }, { name: "note", label: "Note (trip, fine …)", span: true }]} />}
      </ConfirmModal>
    </>
  );
}
