import { useEffect, useState } from "react";
import PageHeader from "../../../components/layout/page_header";
import ConfirmModal from "../../../components/common/confirm_modal";
import { FieldGrid } from "../../../components/common/crud_screen";
import { DAYS, slots, timetableService } from "../../../services/timetable_service";
import { useSchool } from "../../../context/school_context";
import { apiErrors } from "../../../utils/validation";

/** W50 – weekly timetable of a section (GET /timetable/slots/section_grid/) or a teacher. Click a cell to set it. */
export default function TimetableGrid() {
  const { divisionOptions, subjectOptions, teacherOptions, notify } = useSchool();
  const [mode, setMode] = useState("section");
  const [id, setId] = useState("");
  const [grid, setGrid] = useState(null);
  const [edit, setEdit] = useState(null);
  const [errors, setErrors] = useState({});
  const load = () => {
    if (!id) return setGrid(null);
    (mode === "section" ? timetableService.sectionGrid(id) : timetableService.teacherGrid(id)).then(setGrid);
  };
  useEffect(load, [id, mode]);
  const cell = (day, period) => (grid?.days[DAYS.find((d) => d.value === day).label] || []).find((s) => s.period === period.id);
  const open = (day, period) => {
    if (mode !== "section" || period.is_break) return;
    const s = cell(day, period);
    setErrors({});
    setEdit(s ? { id: s.id, subject: s.subject, teacher: s.teacher || "", room: s.room, day, period: period.id }
      : { section: Number(id), day, period: period.id, subject: "", teacher: "", room: "" });
  };
  const save = async () => {
    try {
      await slots.save({ ...edit, teacher: edit.teacher || null });
      notify("Saved");
      setEdit(null);
      load();
    } catch (e) {
      setErrors(apiErrors(e));
    }
  };
  const remove = async () => {
    await slots.remove(edit.id);
    setEdit(null);
    load();
  };
  return (
    <>
      <PageHeader code="W50" title="Timetable" subtitle="A teacher cannot be in two sections in the same period – the server refuses it." />
      <div className="card toolbar-card">
        <div className="field"><label htmlFor="m">Show</label><select id="m" value={mode} onChange={(e) => { setMode(e.target.value); setId(""); }}><option value="section">Section</option><option value="teacher">Teacher</option></select></div>
        <div className="field"><label htmlFor="w">{mode === "section" ? "Section" : "Teacher"}</label>
          <select id="w" value={id} onChange={(e) => setId(e.target.value)}><option value="">Choose…</option>{(mode === "section" ? divisionOptions : teacherOptions).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
      </div>
      {grid && !grid.periods.length && <div className="alert alert-info">Add bell periods first (Bell periods tab).</div>}
      {grid && grid.periods.length > 0 && (
        <div className="table-card"><div className="table-scroll">
          <table className="tt-grid">
            <thead><tr><th>Day</th>{grid.periods.map((p) => <th key={p.id}>{p.name}<br /><small className="muted">{p.start_time.slice(0, 5)}–{p.end_time.slice(0, 5)}</small></th>)}</tr></thead>
            <tbody>{DAYS.map((d) => (
              <tr key={d.value}><th>{d.label}</th>{grid.periods.map((p) => {
                const s = cell(d.value, p);
                return <td key={p.id}>{p.is_break ? <span className="muted">Break</span> : s
                  ? <div className="tt-cell" onClick={() => open(d.value, p)}><b>{s.subject_name}</b><br /><small>{mode === "section" ? s.teacher_name || "No teacher" : s.section_name}</small></div>
                  : <div className="tt-empty" onClick={() => open(d.value, p)}>{mode === "section" ? "+" : ""}</div>}</td>;
              })}</tr>))}</tbody>
          </table>
        </div></div>
      )}
      <ConfirmModal open={!!edit} title={edit?.id ? "Change period" : "Set period"} confirmText="Save" onConfirm={save} onCancel={() => setEdit(null)}>
        {errors._ && <div className="alert alert-error">{errors._}</div>}
        {edit && <FieldGrid values={edit} errors={errors} set={(k, v) => setEdit((x) => ({ ...x, [k]: v }))} fields={[
          { name: "subject", label: "Subject", type: "select", options: subjectOptions, required: true }, { name: "teacher", label: "Teacher", type: "select", options: teacherOptions },
          { name: "room", label: "Room" }]} />}
        {edit?.id && <button className="btn btn-ghost btn-sm danger" onClick={remove}>Clear this period</button>}
      </ConfirmModal>
    </>
  );
}
