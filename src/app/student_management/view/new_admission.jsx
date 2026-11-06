import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import FormInput from "../../../components/forms/form_input";
import FormSelect from "../../../components/forms/form_select";
import { studentsService } from "../../../services/students_service";
import { useSchool } from "../../../context/school_context";
import { PATHS } from "../../../lib/route_paths";
import { apiErrors, rules, validate } from "../../../utils/validation";

export const GENDERS = [{ value: "MALE", label: "Male" }, { value: "FEMALE", label: "Female" }, { value: "OTHER", label: "Other" }];
export const BLOOD = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((b) => ({ value: b, label: b }));
export const RELATIONS = [{ value: "FATHER", label: "Father" }, { value: "MOTHER", label: "Mother" }, { value: "GUARDIAN", label: "Guardian" }];

const EMPTY = {
  first_name: "", middle_name: "", last_name: "", gender: "", date_of_birth: "", blood_group: "", aadhaar_no: "",
  academic_year: "", school_class: "", section: "", admission_date: "", previous_school: "", father_name: "", mother_name: "", address: "",
  parent_relation: "FATHER", parent_first_name: "", parent_last_name: "", parent_mobile: "", parent_email: "", parent_occupation: "",
};

/** W04 – POST /students/admission/: parent into the user table (PARENT) + parent table, child into the student table.
 *  The parent gets WhatsApp + e-mail: admission done, Parent app link, login mobile + password. */
export default function NewAdmission() {
  const { classOptions, sectionOptions, yearOptions, currentYear, notify, reload } = useSchool();
  const [values, setValues] = useState({ ...EMPTY, academic_year: currentYear?.id || "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const set = (k, v) => setValues((s) => ({ ...s, [k]: v, ...(k === "school_class" ? { section: "" } : {}) }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(values, {
      first_name: [rules.required], last_name: [rules.required], gender: [rules.required], date_of_birth: [rules.required, rules.pastDate],
      school_class: [rules.required], parent_first_name: [rules.required], parent_mobile: [rules.required, rules.phone], parent_email: [rules.email],
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const body = Object.fromEntries(Object.entries({ ...values, academic_year: values.academic_year || currentYear?.id }).filter(([, v]) => v !== "" && v !== undefined));
      const res = await studentsService.admit(body);
      setResult(res);
      notify(`Admitted – admission no. ${res.admission_no}`);
      reload();
    } catch (err) {
      setErrors(apiErrors(err));
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    const pl = result.parent_login;
    return (
      <div className="card success-card">
        <h2>{result.full_name} is admitted</h2>
        <p className="muted">Admission no. <strong>{result.admission_no}</strong> · {result.class_name}{result.section_name ? `-${result.section_name}` : ""} · roll {result.roll_no ?? "—"}</p>
        <div className="login-box">
          <div>Parent: <strong>{result.parent.name}</strong> · {pl.mobile}</div>
          {pl.password ? <div>Parent app password <strong>{pl.password}</strong></div> : <div>{pl.note}</div>}
          <small className="muted">Sent on WhatsApp and e-mail with the Parent app link.</small>
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={() => { setResult(null); setValues({ ...EMPTY, academic_year: currentYear?.id || "" }); }}>Admit another</button>
          <Link className="btn btn-primary" to={PATHS.studentProfile(result.id)}>Open profile</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader code="W04" title="New admission" subtitle="The parent's mobile becomes their Parent app login. Same mobile for a brother or sister = same login." />
      <form onSubmit={submit} noValidate>
        {errors._ && <div className="alert alert-error">{errors._}</div>}
        {!classOptions.length && <div className="alert alert-info">Add classes and sections in Academics first.</div>}
        <section className="card form-card">
          <h3>1 · Student</h3>
          <div className="form-grid">
            <FormInput label="First name" name="first_name" value={values.first_name} onChange={set} error={errors.first_name} required />
            <FormInput label="Middle name" name="middle_name" value={values.middle_name} onChange={set} />
            <FormInput label="Last name" name="last_name" value={values.last_name} onChange={set} error={errors.last_name} required />
            <FormSelect label="Gender" name="gender" value={values.gender} onChange={set} options={GENDERS} error={errors.gender} required />
            <FormInput label="Date of birth" name="date_of_birth" type="date" value={values.date_of_birth} onChange={set} error={errors.date_of_birth} required />
            <FormSelect label="Blood group" name="blood_group" value={values.blood_group} onChange={set} options={BLOOD} />
            <FormInput label="Father's name" name="father_name" value={values.father_name} onChange={set} />
            <FormInput label="Mother's name" name="mother_name" value={values.mother_name} onChange={set} />
            <FormInput label="Aadhaar no." name="aadhaar_no" value={values.aadhaar_no} onChange={set} error={errors.aadhaar_no} maxLength={12} />
            <FormInput label="Previous school" name="previous_school" value={values.previous_school} onChange={set} />
            <FormInput label="Address" name="address" type="textarea" rows={2} value={values.address} onChange={set} className="span-2" />
          </div>
        </section>
        <section className="card form-card">
          <h3>2 · Class</h3>
          <div className="form-grid">
            <FormSelect label="Academic year" name="academic_year" value={values.academic_year} onChange={set} options={yearOptions} placeholder="Current year" />
            <FormSelect label="Class" name="school_class" value={values.school_class} onChange={set} options={classOptions} error={errors.school_class} required />
            <FormSelect label="Section" name="section" value={values.section} onChange={set} options={sectionOptions(values.school_class)} error={errors.section} placeholder={values.school_class ? "Choose…" : "Choose the class first"} />
            <FormInput label="Admission date" name="admission_date" type="date" value={values.admission_date} onChange={set} hint="Empty = today" />
          </div>
          <p className="muted small">Admission no. and roll no. are given automatically.</p>
        </section>
        <section className="card form-card">
          <h3>3 · Parent <small className="muted">· Parent app login</small></h3>
          <div className="form-grid">
            <FormSelect label="Relation" name="parent_relation" value={values.parent_relation} onChange={set} options={RELATIONS} placeholder={null} />
            <FormInput label="First name" name="parent_first_name" value={values.parent_first_name} onChange={set} error={errors.parent_first_name} required />
            <FormInput label="Last name" name="parent_last_name" value={values.parent_last_name} onChange={set} />
            <FormInput label="Mobile (login)" name="parent_mobile" value={values.parent_mobile} onChange={set} error={errors.parent_mobile} inputMode="numeric" maxLength={10} required />
            <FormInput label="E-mail" name="parent_email" type="email" value={values.parent_email} onChange={set} error={errors.parent_email} />
            <FormInput label="Occupation" name="parent_occupation" value={values.parent_occupation} onChange={set} />
          </div>
        </section>
        <div className="form-actions sticky-actions">
          <Link className="btn btn-ghost" to={PATHS.students}>Cancel</Link>
          <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Admit & send parent login"}</button>
        </div>
      </form>
    </>
  );
}
