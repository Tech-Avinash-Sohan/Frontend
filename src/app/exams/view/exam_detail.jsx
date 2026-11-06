import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import LoadingState from "../../../components/common/loading_state";
import StatusBadge from "../../../components/common/status_badge";
import CrudScreen from "../../../components/common/crud_screen";
import ConfirmModal from "../../../components/common/confirm_modal";
import { examsService, papers } from "../../../services/exams_service";
import { useSchool } from "../../../context/school_context";
import { PATHS } from "../../../lib/route_paths";
import { formatDate } from "../../../utils/format_date";
import { apiErrors } from "../../../utils/validation";

const NEXT = { DRAFT: ["schedule", "Publish date sheet"], SCHEDULED: ["open_marks", "Open marks entry"], MARKS_ENTRY: ["publish", "Publish result"], PUBLISHED: ["unpublish", "Unpublish"] };

/** W54 – one exam: papers (date sheet) + status actions. */
export default function ExamDetail() {
  const { id } = useParams();
  const { classOptions, subjectOptions, notify } = useSchool();
  const [e, setE] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [k, setK] = useState(0);
  const load = () => examsService.exams.get(id).then(setE);
  useEffect(() => { load(); }, [id]);
  if (!e) return <LoadingState />;
  const [act, label] = NEXT[e.status];
  const step = async () => {
    try {
      const r = await examsService.setStatus(id, act);
      notify(act === "publish" ? `Result published · ${r.parents_notified} parents told` : "Done");
      setConfirm(false);
      load();
    } catch (err) {
      notify(apiErrors(err)._, "error");
    }
  };
  const examClasses = classOptions.filter((c) => e.classes.includes(c.value));
  return (
    <>
      <PageHeader code="W54" title={e.name} subtitle={`${e.academic_year_name} · ${e.class_names.join(", ")}`} back={{ to: PATHS.exams, label: "Exams" }}
        actions={<><StatusBadge status={e.status === "PUBLISHED" ? "approved" : "scheduled"} label={e.status_display} />
          <Link className="btn btn-ghost" to={`${PATHS.marksEntry}?exam=${e.id}`}>Marks</Link><Link className="btn btn-ghost" to={`${PATHS.resultSheet}?exam=${e.id}`}>Results</Link>
          <button className="btn btn-primary" onClick={() => setConfirm(true)}>{label}</button></>} />
      <CrudScreen title="Papers / date sheet" service={papers} params={{ exam: id }} reloadKey={k} search={false} createLabel="+ Add paper"
        defaults={{ exam: Number(id), max_marks: 100, pass_marks: 35, duration_minutes: 60 }}
        filters={[{ key: "school_class", label: "Class", options: examClasses }]}
        fields={[{ name: "school_class", label: "Class", type: "select", options: examClasses, required: true }, { name: "subject", label: "Subject", type: "select", options: subjectOptions, required: true },
          { name: "exam_date", label: "Date", type: "date" }, { name: "start_time", label: "Time", type: "time" }, { name: "duration_minutes", label: "Minutes", type: "number" },
          { name: "max_marks", label: "Max marks", type: "number", required: true }, { name: "pass_marks", label: "Pass marks", type: "number", required: true }]}
        toForm={(r) => ({ ...r, start_time: r.start_time?.slice(0, 5) || "" })}
        columns={[{ key: "class_name", label: "Class" }, { key: "subject_name", label: "Subject", render: (r) => <strong>{r.subject_name}</strong> },
          { key: "exam_date", label: "Date", render: (r) => formatDate(r.exam_date) }, { key: "max_marks", label: "Max", align: "right" }, { key: "pass_marks", label: "Pass", align: "right" },
          { key: "marks_entered", label: "Marks entered", align: "right" }]}
        empty="Add a paper for each class + subject." />
      <ConfirmModal open={confirm} title={label} message={act === "publish" ? "Marks get locked and parents see the report card (WhatsApp sent)." : ""} confirmText={label}
        onConfirm={() => { step(); setK((x) => x + 1); }} onCancel={() => setConfirm(false)} />
    </>
  );
}
