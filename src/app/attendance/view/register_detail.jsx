import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import FormSelect from "../../../components/forms/form_select";
import LoadingState from "../../../components/common/loading_state";
import { attendanceService, ATT_STATUS } from "../../../services/attendance_service";
import { useSchool } from "../../../context/school_context";
import { apiErrors } from "../../../utils/validation";
import { todayISO } from "../../../utils/format_date";

const SHORT = { P: "P", A: "A", LT: "Late", HD: "½", L: "Leave" };

/** W11 – mark / view one section for one day. GET register + POST /attendance/students/mark/. */
export default function RegisterDetail() {
  const { divisionOptions, notify } = useSchool();
  const [sp, setSp] = useSearchParams();
  const section = sp.get("section") || "";
  const date = sp.get("date") || todayISO();
  const [reg, setReg] = useState(null);
  const [marks, setMarks] = useState({});
  const [notifyAbsent, setNotifyAbsent] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!section) return;
    setReg(null);
    setError("");
    attendanceService.register(section, date).then((r) => {
      setReg(r);
      setMarks(Object.fromEntries(r.students.map((s) => [s.student, s.status || "P"])));
    }).catch((e) => setError(e.message));
  }, [section, date]);

  const setAll = (st) => setMarks(Object.fromEntries(Object.keys(marks).map((k) => [k, st])));
  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const r = await attendanceService.mark({ section: Number(section), date, notify_absent: notifyAbsent,
        entries: Object.entries(marks).map(([student, status]) => ({ student: Number(student), status })) });
      notify(`Saved · ${r.counts.A || 0} absent${r.absent_notified ? ` · ${r.absent_notified} parents told on WhatsApp` : ""}`);
      setReg(await attendanceService.register(section, date));
    } catch (err) {
      setError(apiErrors(err)._ || err.message);
    } finally {
      setBusy(false);
    }
  };
  const count = (st) => Object.values(marks).filter((v) => v === st).length;

  return (
    <>
      <PageHeader code="W11" title="Mark attendance" subtitle="Everyone starts Present – tap to change. Saving again updates the same day." />
      <div className="card toolbar-card">
        <FormSelect label="Section" name="section" value={section} options={divisionOptions} onChange={(_, v) => setSp({ section: v, date })} />
        <div className="field"><label htmlFor="att-date">Date</label><input id="att-date" type="date" value={date} max={todayISO()} onChange={(e) => setSp({ section, date: e.target.value })} /></div>
        {reg && <div className="toolbar-summary"><span>Present <b>{count("P") + count("LT") + count("HD")}</b></span><span>Absent <b className="danger-text">{count("A")}</b></span><span>Leave <b>{count("L")}</b></span></div>}
      </div>
      {!section && <div className="card"><p className="muted">Choose a section.</p></div>}
      {error && <div className="alert alert-error">{error}</div>}
      {section && !reg && !error && <LoadingState />}
      {reg && reg.is_holiday && <div className="alert alert-info">This day is a holiday in the school calendar – attendance cannot be saved.</div>}
      {reg && (
        <section className="card">
          <div className="card-head">
            <h3>{reg.section_name} · {reg.students.length} students {reg.submitted && <span className="badge badge-success">Saved</span>}</h3>
            <div className="row-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setAll("P")}>All present</button>
              <label className="field-check"><input type="checkbox" checked={notifyAbsent} onChange={(e) => setNotifyAbsent(e.target.checked)} /> WhatsApp parents of absentees</label>
            </div>
          </div>
          <div className="att-list">
            {reg.students.map((s) => (
              <div key={s.student} className="att-row">
                <span className="att-roll">{s.roll_no ?? "–"}</span>
                <span className="att-name">{s.name}<small className="muted"> {s.admission_no}</small></span>
                <span className="att-btns">
                  {ATT_STATUS.map((o) => (
                    <button key={o.value} type="button" title={o.label} className={`att-btn att-${o.value} ${marks[s.student] === o.value ? "on" : ""}`}
                      onClick={() => setMarks((m) => ({ ...m, [s.student]: o.value }))}>{SHORT[o.value]}</button>
                  ))}
                </span>
              </div>
            ))}
            {!reg.students.length && <p className="muted">No active students in this section.</p>}
          </div>
          <div className="form-actions"><button className="btn btn-primary" disabled={busy || reg.is_holiday || !reg.students.length} onClick={save}>{busy ? "Saving…" : "Save attendance"}</button></div>
        </section>
      )}
    </>
  );
}
