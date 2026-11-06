import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import FilterBar from "../../../components/common/filter_bar";
import ConfirmModal from "../../../components/common/confirm_modal";
import { reportsService } from "../../../services/reports_service";
import { feesService } from "../../../services/fees_service";
import { useSchool } from "../../../context/school_context";
import { PATHS } from "../../../lib/route_paths";
import { formatCurrency } from "../../../utils/format_currency";

/** W35 – overdue fees per student (GET /reports/fee-dues/) + WhatsApp reminders + CSV. */
export default function FeeDuesReport() {
  const { classOptions, sectionOptions, notify } = useSchool();
  const navigate = useNavigate();
  const [f, setF] = useState({});
  const [d, setD] = useState(null);
  const [remind, setRemind] = useState(false);
  useEffect(() => { setD(null); reportsService.feeDues(f).then(setD); }, [f.school_class, f.section]);
  const send = async () => {
    const r = await feesService.reminders(f);
    notify(`${r.reminders_sent} reminders sent`);
    setRemind(false);
  };
  return (
    <>
      <PageHeader code="W35" title="Fee dues" subtitle={d ? `${d.students} students · ${formatCurrency(d.total_due)} overdue` : ""}
        actions={<><button className="btn btn-ghost" onClick={() => reportsService.downloadCsv("/reports/fee-dues/", f, "fee_dues.csv")}>Download CSV</button>
          <button className="btn btn-primary" disabled={!d?.students} onClick={() => setRemind(true)}>Send reminders</button></>} />
      <FilterBar filters={[{ key: "school_class", label: "Class", options: classOptions }, { key: "section", label: "Section", options: sectionOptions(f.school_class) }]}
        values={f} onChange={(k, v) => setF((x) => ({ ...x, [k]: v || undefined, ...(k === "school_class" ? { section: undefined } : {}) }))} />
      <DataTable rows={d?.rows || []} rowKey="student" loading={!d} empty="No overdue fees." onRowClick={(r) => navigate(`${PATHS.collectionDesk}?student=${r.student}`)}
        columns={[{ key: "name", label: "Student", render: (r) => <span><strong>{r.name}</strong> <small className="muted">{r.admission_no}</small></span> },
          { key: "cls", label: "Class", render: (r) => `${r.class}${r.section ? `-${r.section}` : ""}` }, { key: "parent", label: "Parent", render: (r) => `${r.parent} · ${r.mobile}` },
          { key: "due", label: "Overdue", align: "right", render: (r) => <b className="danger-text">{formatCurrency(r.due)}</b> }]} />
      <ConfirmModal open={remind} title="Send fee reminders?" message={`WhatsApp + e-mail to ${d?.students} parents.`} confirmText="Send" onConfirm={send} onCancel={() => setRemind(false)} />
    </>
  );
}
