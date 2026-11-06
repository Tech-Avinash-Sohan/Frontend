import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import LoadingState from "../../../components/common/loading_state";
import ConfirmModal from "../../../components/common/confirm_modal";
import StatusBadge from "../../../components/common/status_badge";
import { FieldGrid } from "../../../components/common/crud_screen";
import { admissionsService, ENQUIRY_STATUS } from "../../../services/admissions_service";
import { useSchool } from "../../../context/school_context";
import { PATHS } from "../../../lib/route_paths";
import { formatDate, formatDateTime } from "../../../utils/format_date";
import { apiErrors } from "../../../utils/validation";

/** W63 – one enquiry: follow-ups (POST {id}/follow_up/) and Admit (POST {id}/convert/ – parent login sent). */
export default function EnquiryDetail() {
  const { id } = useParams();
  const { sectionOptions, notify, reload } = useSchool();
  const [e, setE] = useState(null);
  const [fu, setFu] = useState({ note: "", status_after: "" });
  const [conv, setConv] = useState(null);
  const [done, setDone] = useState(null);
  const [errors, setErrors] = useState({});
  const load = () => admissionsService.enquiries.get(id).then(setE);
  useEffect(() => { load(); }, [id]);
  if (!e) return <LoadingState />;
  const addFollow = async () => {
    try {
      setE(await admissionsService.followUp(id, { ...fu, status_after: fu.status_after || "", next_follow_up: fu.next_follow_up || null }));
      setFu({ note: "", status_after: "" });
      notify("Follow-up saved");
    } catch (err) {
      setErrors(apiErrors(err));
    }
  };
  const convert = async () => {
    try {
      const s = await admissionsService.convert(id, { ...conv, section: conv.section || null });
      setDone(s);
      setConv(null);
      load();
      reload();
    } catch (err) {
      setErrors(apiErrors(err));
    }
  };
  const statusOpts = ENQUIRY_STATUS.filter((s) => s.value !== "CONVERTED");
  return (
    <>
      <PageHeader code="W63" title={`${e.student_first_name} ${e.student_last_name}`} subtitle={`${e.class_name} · ${e.parent_name} · ${e.mobile}`} back={{ to: PATHS.enquiries, label: "Enquiries" }}
        actions={e.status !== "CONVERTED" ? <button className="btn btn-primary" onClick={() => { setErrors({}); setConv({ section: "", parent_relation: "FATHER" }); }}>Admit</button>
          : e.student && <Link className="btn btn-ghost" to={PATHS.studentProfile(e.student)}>Open student</Link>} />
      {done && <div className="alert alert-info">Admitted {done.full_name} ({done.admission_no}). Parent login {done.parent_login.mobile}{done.parent_login.password ? ` · password ${done.parent_login.password}` : ""} – sent on WhatsApp + e-mail.</div>}
      <div className="grid-2-wide">
        <section className="card">
          <div className="card-head"><h3>Follow-ups</h3><StatusBadge status="pending" label={e.status_display} /></div>
          {e.status !== "CONVERTED" && (<div className="form-card">
            {errors._ && <div className="alert alert-error">{errors._}</div>}
            <FieldGrid values={fu} errors={errors} set={(k, v) => setFu((x) => ({ ...x, [k]: v }))} fields={[
              { name: "note", label: "What happened", type: "textarea", required: true }, { name: "status_after", label: "New status", type: "select", options: statusOpts, placeholder: "Keep" },
              { name: "next_follow_up", label: "Next follow-up", type: "date" }]} />
            <div className="form-actions"><button className="btn btn-ghost" disabled={!fu.note} onClick={addFollow}>Save follow-up</button></div></div>)}
          <ul className="steps-list">{e.follow_ups.map((f) => <li key={f.id}><span>{f.note}{f.status_after && <> → <b>{f.status_after}</b></>}</span><span className="muted small">{f.by_name} · {formatDateTime(f.created_at)}</span></li>)}
            {!e.follow_ups.length && <li className="muted">No follow-ups yet.</li>}</ul>
        </section>
        <section className="card"><dl className="details">
          <dt>Date of birth</dt><dd>{formatDate(e.date_of_birth)}</dd><dt>Gender</dt><dd>{e.gender || "—"}</dd><dt>Previous school</dt><dd>{e.previous_school || "—"}</dd>
          <dt>E-mail</dt><dd>{e.email || "—"}</dd><dt>Source</dt><dd>{e.source}</dd><dt>Follow-up by</dt><dd>{e.assigned_to_name || "—"}</dd>
          <dt>Next follow-up</dt><dd>{formatDate(e.next_follow_up)}</dd><dt>Notes</dt><dd>{e.notes || "—"}</dd></dl></section>
      </div>
      <ConfirmModal open={!!conv} title="Admit this child" message="Creates the student and the parent's Parent app login (sent on WhatsApp + e-mail). Missing details come from the enquiry." confirmText="Admit" onConfirm={convert} onCancel={() => setConv(null)}>
        {Object.entries(errors).filter(([k]) => k !== "_").map(([k, v]) => <div key={k} className="alert alert-error">{k}: {v}</div>)}
        {errors._ && <div className="alert alert-error">{errors._}</div>}
        {conv && <FieldGrid values={conv} errors={errors} set={(k, v) => setConv((x) => ({ ...x, [k]: v }))} fields={[
          { name: "section", label: "Section", type: "select", options: sectionOptions(e.class_sought) },
          { name: "gender", label: "Gender", type: "select", options: [{ value: "MALE", label: "Male" }, { value: "FEMALE", label: "Female" }, { value: "OTHER", label: "Other" }], hidden: () => !!e.gender },
          { name: "date_of_birth", label: "Date of birth", type: "date", hidden: () => !!e.date_of_birth },
          { name: "father_name", label: "Father's name" }, { name: "mother_name", label: "Mother's name" }]} />}
      </ConfirmModal>
    </>
  );
}
