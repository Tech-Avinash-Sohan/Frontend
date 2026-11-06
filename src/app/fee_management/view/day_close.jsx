import { useEffect, useState } from "react";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import LoadingState from "../../../components/common/loading_state";
import { feesService } from "../../../services/fees_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { formatCurrency } from "../../../utils/format_currency";
import { formatDate, todayISO } from "../../../utils/format_date";
import { apiErrors } from "../../../utils/validation";

/** W21 – end-of-day: GET /fees/day-close/today/?date= totals by mode; POST /fees/day-close/close/ locks the day. */
export default function DayClose() {
  const { notify } = useSchool();
  const [date, setDate] = useState(todayISO());
  const [t, setT] = useState(null);
  const [cash, setCash] = useState("");
  const [note, setNote] = useState("");
  const [history, setHistory] = useState([]);
  const load = () => { setT(null); feesService.dayTotals(date).then(setT); feesService.dayCloses({ page_size: 30 }).then((d) => setHistory(rows(d))); };
  useEffect(load, [date]);
  const close = async () => {
    try {
      const r = await feesService.closeDay({ date, cash_counted: cash === "" ? null : cash, note });
      notify(`Day closed · difference ${formatCurrency(r.difference)}`);
      load();
    } catch (e) {
      notify(apiErrors(e)._, "error");
    }
  };
  if (!t) return <LoadingState />;
  return (
    <>
      <PageHeader code="W21" title="Day close" subtitle="After closing, no receipt can be made with that date." actions={<input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />} />
      <section className="stat-grid">
        {Object.entries(t.totals).filter(([, v]) => Number(v)).map(([k, v]) => <div key={k} className="stat-card"><span className="stat-label">{k}</span><strong className="stat-value">{formatCurrency(v)}</strong></div>)}
        <div className="stat-card"><span className="stat-label">Total · {t.receipts} receipts</span><strong className="stat-value">{formatCurrency(t.total)}</strong></div>
      </section>
      <section className="card form-card">
        {t.closed ? <div className="alert alert-info">This day is closed.</div> : (<>
          <div className="form-grid">
            <div className="field"><label htmlFor="cash">Cash counted in drawer ₹</label><input id="cash" type="number" value={cash} onChange={(e) => setCash(e.target.value)} /></div>
            <div className="field span-2"><label htmlFor="note">Note</label><input id="note" value={note} onChange={(e) => setNote(e.target.value)} /></div>
          </div>
          {cash !== "" && <p>Difference: <b className={Number(cash) - Number(t.totals.CASH) ? "danger-text" : ""}>{formatCurrency(Number(cash) - Number(t.totals.CASH))}</b></p>}
          <div className="form-actions"><button className="btn btn-primary" onClick={close}>Close {formatDate(date)}</button></div></>)}
        {Object.keys(t.by_collector).length > 0 && <p className="muted small">By collector: {Object.entries(t.by_collector).map(([k, v]) => `${k} ${formatCurrency(v)}`).join(" · ")}</p>}
      </section>
      <section className="card"><div className="card-head"><h3>Closed days</h3></div>
        <DataTable rows={history} columns={[{ key: "date", label: "Date", render: (r) => formatDate(r.date) }, { key: "receipts", label: "Receipts", align: "right" },
          { key: "total", label: "Total", align: "right", render: (r) => formatCurrency(r.total) }, { key: "difference", label: "Cash difference", align: "right", render: (r) => formatCurrency(r.difference) },
          { key: "closed_by_name", label: "Closed by" }]} /></section>
    </>
  );
}
