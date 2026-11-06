import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import LoadingState from "../../../components/common/loading_state";
import { examsService } from "../../../services/exams_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { apiErrors } from "../../../utils/validation";

/** W55 – marks of one paper for one section: GET /exams/marks/sheet/ · POST /exams/marks/bulk/ */
export default function MarksEntry() {
  const { sectionOptions, notify } = useSchool();
  const [sp, setSp] = useSearchParams();
  const exam = sp.get("exam") || "";
  const paper = sp.get("paper") || "";
  const section = sp.get("section") || "";
  const [examList, setExamList] = useState([]);
  const [paperList, setPaperList] = useState([]);
  const [sheet, setSheet] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  useEffect(() => { examsService.exams.list({ page_size: 100 }).then((d) => setExamList(rows(d))); }, []);
  useEffect(() => { if (exam) examsService.papers.list({ exam }).then((d) => setPaperList(rows(d))); }, [exam]);
  const paperObj = paperList.find((p) => String(p.id) === paper);
  useEffect(() => {
    setSheet(null);
    if (paper && section) examsService.marksSheet(paper, section).then(setSheet);
  }, [paper, section]);
  const upd = (st, k, v) => setSheet((s) => ({ ...s, students: s.students.map((r) => (r.student === st ? { ...r, [k]: v } : r)) }));
  const save = async () => {
    setBusy(true);
    setErrors({});
    try {
      const entries = sheet.students.filter((r) => r.is_absent || (r.marks !== null && r.marks !== "")).map((r) => ({ student: r.student, marks: r.is_absent ? null : r.marks, is_absent: r.is_absent, remark: r.remark || "" }));
      const r = await examsService.saveMarks(Number(paper), entries);
      notify(`${r.saved} marks saved`);
      setSheet(await examsService.marksSheet(paper, section));
    } catch (e) {
      const er = apiErrors(e);
      setErrors({ _: er._, rows: e.data?.errors || {} });
    } finally {
      setBusy(false);
    }
  };
  const set = (k, v) => setSp({ exam, paper, section, [k]: v, ...(k === "exam" ? { paper: "", section: "" } : {}) });
  return (
    <>
      <PageHeader code="W55" title="Marks entry" subtitle={paperObj ? `${paperObj.subject_name} · max ${paperObj.max_marks} · pass ${paperObj.pass_marks}` : "Choose exam, paper and section"} />
      <div className="card toolbar-card">
        <div className="field"><label htmlFor="e">Exam</label><select id="e" value={exam} onChange={(e) => set("exam", e.target.value)}><option value="">Choose…</option>{examList.map((x) => <option key={x.id} value={x.id}>{x.name} ({x.status_display})</option>)}</select></div>
        <div className="field"><label htmlFor="p">Paper</label><select id="p" value={paper} onChange={(e) => set("paper", e.target.value)}><option value="">Choose…</option>{paperList.map((x) => <option key={x.id} value={x.id}>{x.class_name} · {x.subject_name}</option>)}</select></div>
        <div className="field"><label htmlFor="s">Section</label><select id="s" value={section} onChange={(e) => set("section", e.target.value)}><option value="">Choose…</option>{sectionOptions(paperObj?.school_class).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
      </div>
      {errors._ && <div className="alert alert-error">{errors._}</div>}
      {paper && section && !sheet && <LoadingState />}
      {sheet && (
        <section className="card">
          <table className="data-table">
            <thead><tr><th>Roll</th><th>Student</th><th>Marks / {sheet.paper.max_marks}</th><th>Absent</th><th>Grade</th><th>Remark</th></tr></thead>
            <tbody>{sheet.students.map((r) => (
              <tr key={r.student}>
                <td>{r.roll_no ?? "—"}</td><td>{r.name}{errors.rows?.[r.student] && <div className="danger-text small">{errors.rows[r.student]}</div>}</td>
                <td><input type="number" min="0" max={sheet.paper.max_marks} step="0.5" disabled={r.is_absent} value={r.marks ?? ""} onChange={(e) => upd(r.student, "marks", e.target.value)} style={{ width: 90 }} /></td>
                <td><input type="checkbox" checked={r.is_absent} onChange={(e) => upd(r.student, "is_absent", e.target.checked)} /></td>
                <td>{r.grade || "—"}</td>
                <td><input value={r.remark || ""} onChange={(e) => upd(r.student, "remark", e.target.value)} /></td>
              </tr>))}</tbody>
          </table>
          <div className="form-actions"><button className="btn btn-primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save marks"}</button></div>
        </section>
      )}
    </>
  );
}
