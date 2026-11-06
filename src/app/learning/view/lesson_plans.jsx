import { useEffect, useState } from "react";
import CrudScreen from "../../../components/common/crud_screen";
import StatusBadge from "../../../components/common/status_badge";
import { chapters, learningService, lessonPlans } from "../../../services/learning_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { formatDate } from "../../../utils/format_date";

/** W47 – syllabus chapters per class/subject + lesson plans per section, and syllabus coverage. */
export default function LessonPlans() {
  const { classOptions, subjectOptions, divisionOptions, teacherOptions, notify } = useSchool();
  const [chapterOpts, setChapterOpts] = useState([]);
  const [cov, setCov] = useState(null);
  const [section, setSection] = useState("");
  useEffect(() => { chapters.list({ page_size: 200 }).then((d) => setChapterOpts(rows(d).map((c) => ({ value: c.id, label: `${c.class_name} · ${c.subject_name} · ${c.name}` })))); }, []);
  useEffect(() => { if (section) learningService.coverage(section).then(setCov); }, [section]);
  return (
    <>
      <CrudScreen code="W47" title="Lesson plans" service={lessonPlans} search={false} createLabel="+ Plan a lesson"
        filters={[{ key: "section", label: "Section", options: divisionOptions }, { key: "teacher", label: "Teacher", options: teacherOptions },
          { key: "status", label: "Status", options: [{ value: "PLANNED", label: "Planned" }, { value: "IN_PROGRESS", label: "In progress" }, { value: "COMPLETED", label: "Completed" }] }]}
        fields={[{ name: "teacher", label: "Teacher", type: "select", options: teacherOptions, required: true }, { name: "section", label: "Section", type: "select", options: divisionOptions, required: true },
          { name: "subject", label: "Subject", type: "select", options: subjectOptions, required: true }, { name: "chapter", label: "Chapter", type: "select", options: chapterOpts },
          { name: "title", label: "Lesson", required: true }, { name: "planned_date", label: "Date", type: "date", required: true },
          { name: "objectives", label: "Objectives", type: "textarea" }, { name: "activities", label: "Activities", type: "textarea" }]}
        columns={[{ key: "title", label: "Lesson", render: (r) => <span><strong>{r.title}</strong><br /><small className="muted">{r.chapter_name || ""}</small></span> },
          { key: "section_name", label: "Section" }, { key: "subject_name", label: "Subject" }, { key: "teacher_name", label: "Teacher" },
          { key: "planned_date", label: "Date", render: (r) => formatDate(r.planned_date) }, { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status === "COMPLETED" ? "approved" : "planned"} label={r.status.replace("_", " ")} /> }]}
        rowActions={(r, reload) => r.status !== "COMPLETED" && <button className="btn btn-ghost btn-sm" onClick={() => lessonPlans.action(r.id, "complete").then(() => { notify("Marked completed"); reload(); })}>Done</button>}
        empty="No lesson plans." />
      <div style={{ height: 24 }} />
      <section className="card">
        <div className="card-head"><h3>Syllabus coverage</h3><select value={section} onChange={(e) => setSection(e.target.value)} aria-label="Section"><option value="">Section…</option>{divisionOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
        {cov && <ul className="steps-list">{cov.subjects.map((s) => <li key={s.subject}><span>{s.subject_name}: {s.completed}/{s.chapters} chapters</span><div className="progress" style={{ width: 160 }}><span style={{ width: `${s.percentage}%` }} /></div></li>)}
          {!cov.subjects.length && <li className="muted">Add chapters below for this class.</li>}</ul>}
      </section>
      <div style={{ height: 24 }} />
      <CrudScreen title="Syllabus chapters" service={chapters} search createLabel="+ Add chapter"
        filters={[{ key: "school_class", label: "Class", options: classOptions }, { key: "subject", label: "Subject", options: subjectOptions }]}
        fields={[{ name: "school_class", label: "Class", type: "select", options: classOptions, required: true }, { name: "subject", label: "Subject", type: "select", options: subjectOptions, required: true },
          { name: "name", label: "Chapter", required: true }, { name: "order", label: "Order", type: "number" }, { name: "planned_periods", label: "Periods planned", type: "number" }]}
        columns={[{ key: "order", label: "#" }, { key: "name", label: "Chapter", render: (r) => <strong>{r.name}</strong> }, { key: "class_name", label: "Class" }, { key: "subject_name", label: "Subject" }]}
        empty="No chapters." />
    </>
  );
}
