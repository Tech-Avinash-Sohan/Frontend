import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import { reportsService } from "../../../services/reports_service";
import { PATHS } from "../../../lib/route_paths";
import { formatCurrency } from "../../../utils/format_currency";
import { formatDate, todayISO } from "../../../utils/format_date";

/** W36 – fee collection between two dates: GET /reports/fee-collection/?from=&to= */
export default function CollectionReport() {
  const [range, setRange] = useState({ from: `${todayISO().slice(0, 8)}01`, to: todayISO() });
  const [d, setD] = useState(null);
  useEffect(() => { setD(null); reportsService.collection(range).then(setD); }, [range.from, range.to]);
  return (
    <>
      <PageHeader code="W36" title="Fee collection" actions={<>
        <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
        <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
        <button className="btn btn-ghost" onClick={() => reportsService.downloadCsv("/reports/fee-collection/", range, "fee_collection.csv")}>CSV</button></>} />
      {d && <section className="stat-grid">
        <div className="stat-card"><span className="stat-label">Total · {d.receipts} receipts</span><strong className="stat-value">{formatCurrency(d.total)}</strong></div>
        {Object.entries(d.by_mode).map(([k, v]) => <div key={k} className="stat-card"><span className="stat-label">{k}</span><strong className="stat-value">{formatCurrency(v)}</strong></div>)}
        <div className="stat-card"><span className="stat-label">Late fee</span><strong className="stat-value">{formatCurrency(d.late_fee)}</strong></div>
      </section>}
      {d && Object.keys(d.by_head).length > 0 && <div className="chip-row" style={{ marginBottom: 12 }}>{Object.entries(d.by_head).map(([k, v]) => <span key={k} className="chip">{k}: {formatCurrency(v)}</span>)}</div>}
      <DataTable rows={d?.rows || []} rowKey="receipt_no" loading={!d} empty="No receipts in these dates."
        columns={[{ key: "receipt_no", label: "Receipt", render: (r) => <strong>{r.receipt_no}</strong> }, { key: "date", label: "Date", render: (r) => formatDate(r.date) },
          { key: "student", label: "Student", render: (r) => `${r.student} (${r.class})` }, { key: "mode", label: "Mode" },
          { key: "amount", label: "Amount", align: "right", render: (r) => formatCurrency(r.amount) }, { key: "collected_by", label: "By" }]} />
      <p className="muted small"><Link to={PATHS.dayClose}>Day close</Link></p>
    </>
  );
}
