import { useState } from "react";
import CrudScreen from "../../../components/common/crud_screen";
import ConfirmModal from "../../../components/common/confirm_modal";
import DataTable from "../../../components/common/data_table";
import StatusBadge from "../../../components/common/status_badge";
import { homework, learningService, SUBMISSION_STATUS } from "../../../services/learning_service";
import { useSchool } from "../../../context/school_context";
import { formatDate, todayISO } from "../../../utils/format_date";

/** W45 – homework per section (/learning/homework/). Create → every student gets a 'not submitted' row, parents get WhatsApp. */
export default function HomeworkList() {
  const { divisionOptions, subjectOptions, notify } = useSchool();
  const [open, setOpen] = useState(null);
  const [subs, setSubs] = useState([]);
  const show = (hw) => { setOpen(hw); learningService.submissions(hw.id).then(setSubs); };
  const setSub = (st, status) => setSubs((x) => x.map((s) => (s.student === st ? { ...s, status } : s)));
  const saveCheck = async () => {
    await learningService.check(open.id, subs.map((s) => ({ student: s.student, status: s.status, remark: s.remark })));
    notify("Submissions saved");
    setOpen(null);
  };
  return (
    <>
      <CrudScreen code="W45" title="Homework" service={homework} createLabel="+ Give homework"
        defaults={{ assigned_on: todayISO(), needs_submission: true, notify_parents: true }}
        filters={[{ key: "section", label: "Section", options: divisionOptions }, { key: "subject", label: "Subject", options: subjectOptions }]}
        fields={[{ name: "section", label: "Section", type: "select", options: divisionOptions, required: true }, { name: "subject", label: "Subject", type: "select", options: subjectOptions, required: true },
          { name: "title", label: "Title", required: true, span: true }, { name: "description", label: "Details", type: "textarea" },
          { name: "assigned_on", label: "Given on", type: "date", required: true }, { name: "due_date", label: "Due", type: "date", required: true },
          { name: "attachment_url", label: "Attachment URL", span: true }, { name: "needs_submission", label: "Students must submit", type: "checkbox" },
          { name: "notify_parents", label: "WhatsApp the parents", type: "checkbox", hidden: (v) => !!v.id }]}
        columns={[{ key: "title", label: "Homework", render: (r) => <span><strong>{r.title}</strong><br /><small className="muted">{r.subject_name} · {r.section_name}</small></span> },
          { key: "assigned_on", label: "Given", render: (r) => formatDate(r.assigned_on) }, { key: "due_date", label: "Due", render: (r) => formatDate(r.due_date) },
          { key: "submitted_count", label: "Submitted", align: "right" }, { key: "assigned_by_name", label: "By" }]}
        rowActions={(r) => r.needs_submission && <button className="btn btn-ghost btn-sm" onClick={() => show(r)}>Check</button>}
        empty="No homework yet." />
      <ConfirmModal open={!!open} wide title={open ? `${open.title} – submissions` : ""} confirmText="Save" onConfirm={saveCheck} onCancel={() => setOpen(null)}>
        <DataTable rows={subs} columns={[{ key: "roll_no", label: "Roll" }, { key: "student_name", label: "Student" },
          { key: "status", label: "Status", render: (s) => <select value={s.status} onChange={(e) => setSub(s.student, e.target.value)}>{SUBMISSION_STATUS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select> },
          { key: "note", label: "Parent note", render: (s) => s.note || "—" }, { key: "file_url", label: "File", render: (s) => (s.file_url ? <a href={s.file_url} target="_blank" rel="noreferrer">Open</a> : "—") },
          { key: "x", label: "", render: (s) => s.status !== "PENDING" && <StatusBadge status="submitted" label="✓" /> }]} />
      </ConfirmModal>
    </>
  );
}
