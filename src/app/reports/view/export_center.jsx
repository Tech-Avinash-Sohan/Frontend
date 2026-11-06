import { useState } from "react";
import PageHeader from "../../../components/layout/page_header";
import { GOV_REPORTS, REPORTS, reportsService } from "../../../services/reports_service";
import { useSchool } from "../../../context/school_context";
import { todayISO } from "../../../utils/format_date";

/** W37 – download any report or government return as CSV (?export=csv). */
export default function ExportCenter() {
  const { notify } = useSchool();
  const [range, setRange] = useState({ from: `${todayISO().slice(0, 8)}01`, to: todayISO() });
  const [busy, setBusy] = useState("");
  const dl = async (path, params, name) => {
    setBusy(path);
    try {
      await reportsService.downloadCsv(path, params, `${name}.csv`);
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy("");
    }
  };
  const Row = ({ label, path, params, name }) => (
    <li><span>{label}</span><button className="btn btn-ghost btn-sm" disabled={busy === path} onClick={() => dl(path, params, name)}>{busy === path ? "…" : "Download CSV"}</button></li>
  );
  return (
    <>
      <PageHeader code="W37" title="Export centre" subtitle="CSV files open in Excel / Google Sheets."
        actions={<><span className="muted small">Date range</span><input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
          <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} /></>} />
      <div className="grid-2">
        <section className="card"><div className="card-head"><h3>School reports</h3></div>
          <ul className="steps-list">{REPORTS.map((r) => <Row key={r.key} label={r.label} path={`/reports/${r.key}/`} name={r.key} params={{ ...(r.range ? range : {}), ...(r.params || {}) }} />)}</ul></section>
        <section className="card"><div className="card-head"><h3>Government (UDISE+ / RTE)</h3></div>
          <ul className="steps-list">{GOV_REPORTS.map((r) => <Row key={r.key} label={r.label} path={`/government/${r.key}/`} name={r.key.replace("/", "_")} params={{}} />)}</ul>
          <p className="muted small">Aadhaar is masked in the student file. Fill PEN, category and mother tongue in the student profile first.</p></section>
      </div>
    </>
  );
}
