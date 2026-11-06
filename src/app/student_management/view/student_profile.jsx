import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import LoadingState from "../../../components/common/loading_state";
import StatusBadge from "../../../components/common/status_badge";
import ConfirmModal from "../../../components/common/confirm_modal";
import FormInput from "../../../components/forms/form_input";
import FormSelect from "../../../components/forms/form_select";
import { studentsService } from "../../../services/students_service";
import { paymentsService } from "../../../services/payments_service";
import { useSchool } from "../../../context/school_context";
import { PATHS } from "../../../lib/route_paths";
import { formatDate } from "../../../utils/format_date";
import { apiErrors } from "../../../utils/validation";
import { BLOOD, GENDERS } from "./new_admission";
import { appBadge } from "./student_directory";

const EDITABLE = ["first_name", "middle_name", "last_name", "gender", "date_of_birth", "blood_group", "father_name", "mother_name", "aadhaar_no", "address", "previous_school", "school_class", "section", "roll_no"];

/** W05 – GET / PATCH /students/{id}/ · mark left · parent login + Parent app status. */
export default function StudentProfile() {
  const { id } = useParams();
  const { classOptions, sectionOptions, notify, reload } = useSchool();
  const [s, setS] = useState(null);
  const [edit, setEdit] = useState(null);
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(null); // left | resend | cash
  const [left, setLeft] = useState({ status: "LEFT", left_on: "" });
  const [login, setLogin] = useState(null);
  const [busy, setBusy] = useState(false);
  const setE = (k, v) => setEdit((f) => ({ ...f, [k]: v, ...(k === "school_class" ? { section: "" } : {}) }));

  const load = () => studentsService.get(id).then(setS);
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const save = async () => {
    setBusy(true);
    try {
      const body = Object.fromEntries(EDITABLE.map((k) => [k, edit[k] === "" ? null : edit[k]]).filter(([k, v]) => !(v === null && ["first_name", "last_name", "gender", "date_of_birth", "school_class"].includes(k))));
      setS(await studentsService.update(id, body));
      setEdit(null);
      notify("Saved");
      reload();
    } catch (err) {
      setErrors(apiErrors(err));
    } finally {
      setBusy(false);
    }
  };
  const confirm = async () => {
    setBusy(true);
    try {
      if (modal === "left") {
        setS(await studentsService.markLeft(id, left.status, left.left_on || null));
        notify("Status changed");
      } else if (modal === "resend") {
        setLogin(await studentsService.resendParentLogin(s.parent.id));
        notify("New parent password sent");
      } else if (modal === "cash") {
        await paymentsService.activateManually(s.parent.id, "Cash at school office");
        notify("Parent app activated for one year");
        load();
      }
      setModal(null);
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  if (!s) return <LoadingState />;
  return (
    <>
      <PageHeader
        code="W05"
        title={s.full_name}
        subtitle={`${s.admission_no} · ${s.class_name}${s.section_name ? `-${s.section_name}` : ""} · roll ${s.roll_no ?? "—"}`}
        back={{ to: PATHS.students, label: "Students" }}
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => { setErrors({}); setEdit(Object.fromEntries(EDITABLE.map((k) => [k, s[k] ?? ""]))); }}>Edit</button>
            {s.status === "ACTIVE" && <button className="btn btn-danger-ghost" onClick={() => setModal("left")}>Mark left</button>}
          </>
        }
      />
      {login && <div className="alert alert-success">New parent login sent – mobile <strong>{login.mobile}</strong>, password <strong>{login.password}</strong></div>}
      <div className="grid-2">
        <section className="card">
          <div className="card-head"><h3>Student</h3><StatusBadge status={s.status.toLowerCase()} /></div>
          <div className="details">
            <div className="details-row"><span>Gender</span><strong>{s.gender}</strong></div>
            <div className="details-row"><span>Date of birth</span><strong>{formatDate(s.date_of_birth)}</strong></div>
            <div className="details-row"><span>Blood group</span><strong>{s.blood_group || "—"}</strong></div>
            <div className="details-row"><span>Father / Mother</span><strong>{s.father_name || "—"} / {s.mother_name || "—"}</strong></div>
            <div className="details-row"><span>Aadhaar</span><strong>{s.aadhaar_no ? `•••• ${s.aadhaar_no.slice(-4)}` : "—"}</strong></div>
            <div className="details-row"><span>Admitted on</span><strong>{formatDate(s.admission_date)}</strong></div>
            <div className="details-row"><span>Previous school</span><strong>{s.previous_school || "—"}</strong></div>
            <div className="details-row"><span>Address</span><strong>{s.address || "—"}</strong></div>
            {s.left_on && <div className="details-row"><span>Left on</span><strong>{formatDate(s.left_on)}</strong></div>}
          </div>
        </section>
        <section className="card">
          <div className="card-head"><h3>Parent &amp; Parent app</h3>{appBadge(s.parent)}</div>
          <div className="details">
            <div className="details-row"><span>Name</span><strong>{s.parent.name} ({s.parent_relation.toLowerCase()})</strong></div>
            <div className="details-row"><span>Mobile (login)</span><strong>{s.parent.mobile}</strong></div>
            <div className="details-row"><span>E-mail</span><strong>{s.parent.email || "—"}</strong></div>
          </div>
          <div className="form-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setModal("resend")}>Resend parent login</button>
            {!s.parent.app_status && <button className="btn btn-primary btn-sm" onClick={() => setModal("cash")}>Parent paid cash – activate app</button>}
          </div>
        </section>
      </div>

      <ConfirmModal open={!!edit} title="Edit student" confirmText="Save" busy={busy} onConfirm={save} onCancel={() => setEdit(null)} wide>
        {edit && (
          <div className="form-grid">
            {errors._ && <div className="alert alert-error span-2">{errors._}</div>}
            <FormInput label="First name" name="first_name" value={edit.first_name} onChange={setE} error={errors.first_name} />
            <FormInput label="Middle name" name="middle_name" value={edit.middle_name} onChange={setE} />
            <FormInput label="Last name" name="last_name" value={edit.last_name} onChange={setE} error={errors.last_name} />
            <FormSelect label="Gender" name="gender" value={edit.gender} onChange={setE} options={GENDERS} placeholder={null} />
            <FormInput label="Date of birth" name="date_of_birth" type="date" value={edit.date_of_birth} onChange={setE} error={errors.date_of_birth} />
            <FormSelect label="Blood group" name="blood_group" value={edit.blood_group} onChange={setE} options={BLOOD} />
            <FormSelect label="Class" name="school_class" value={edit.school_class} onChange={setE} options={classOptions} placeholder={null} />
            <FormSelect label="Section" name="section" value={edit.section} onChange={setE} options={sectionOptions(edit.school_class)} error={errors.section} />
            <FormInput label="Roll no." name="roll_no" type="number" value={edit.roll_no} onChange={setE} />
            <FormInput label="Father's name" name="father_name" value={edit.father_name} onChange={setE} />
            <FormInput label="Mother's name" name="mother_name" value={edit.mother_name} onChange={setE} />
            <FormInput label="Aadhaar no." name="aadhaar_no" value={edit.aadhaar_no} onChange={setE} />
            <FormInput label="Address" name="address" type="textarea" rows={2} value={edit.address} onChange={setE} className="span-2" />
          </div>
        )}
      </ConfirmModal>
      <ConfirmModal
        open={!!modal}
        title={modal === "left" ? "Mark this student as left?" : modal === "resend" ? "Send the parent a new password?" : "Activate the Parent app for one year?"}
        message={modal === "resend" ? `A new password goes to ${s.parent.mobile}.` : modal === "cash" ? `Records a cash payment and activates ${s.parent.name}'s Parent app for a year.` : null}
        confirmText={modal === "left" ? "Save" : modal === "resend" ? "Send" : "Activate"}
        danger={modal === "left"}
        busy={busy}
        onConfirm={confirm}
        onCancel={() => setModal(null)}
      >
        {modal === "left" && (
          <div className="form-grid">
            <FormSelect label="Status" name="status" value={left.status} onChange={(k, v) => setLeft((x) => ({ ...x, [k]: v }))} options={[{ value: "LEFT", label: "Left school" }, { value: "PASSED_OUT", label: "Passed out" }, { value: "CANCELLED", label: "Admission cancelled" }]} placeholder={null} />
            <FormInput label="Date" name="left_on" type="date" value={left.left_on} onChange={(k, v) => setLeft((x) => ({ ...x, [k]: v }))} />
          </div>
        )}
      </ConfirmModal>
    </>
  );
}
