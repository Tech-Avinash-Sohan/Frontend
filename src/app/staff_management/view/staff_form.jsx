import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import FormInput from "../../../components/forms/form_input";
import FormSelect from "../../../components/forms/form_select";
import LoadingState from "../../../components/common/loading_state";
import { EMPLOYMENT_TYPES, STAFF_TYPES, staffService } from "../../../services/staff_service";
import { academicsService } from "../../../services/academics_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { PATHS } from "../../../lib/route_paths";
import { apiErrors, rules, validate } from "../../../utils/validation";

const EMPTY = {
  first_name: "", last_name: "", mobile: "", email: "", staff_type: "TEACHER", employment_type: "FULL_TIME", employee_code: "",
  designation: "", department: "", qualification: "", experience_years: 0, gender: "", date_of_birth: "", joining_date: "", address: "", subjects: [],
};
const GENDERS = [{ value: "MALE", label: "Male" }, { value: "FEMALE", label: "Female" }, { value: "OTHER", label: "Other" }];

/** W23 – POST /staff/ (creates the TEACHER / STAFF login, sends it on WhatsApp + e-mail) · PATCH /staff/{id}/ */
export default function StaffForm() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { notify } = useSchool();
  const [values, setValues] = useState(EMPTY);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);
  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    academicsService.subjects().then((d) => setSubjects(rows(d)));
    if (!isNew) staffService.get(id).then((s) => setValues({ ...EMPTY, ...Object.fromEntries(Object.entries(s).map(([k, v]) => [k, v ?? ""])) })).finally(() => setLoading(false));
  }, [id, isNew]);

  const toggleSubject = (sid) => set("subjects", values.subjects.includes(sid) ? values.subjects.filter((x) => x !== sid) : [...values.subjects, sid]);

  const submit = async (e) => {
    e.preventDefault();
    const schema = isNew ? { first_name: [rules.required], mobile: [rules.required, rules.phone], email: [rules.email] } : {};
    const errs = validate(values, schema);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const body = Object.fromEntries(Object.entries(values).filter(([k, v]) => v !== "" && !(["first_name", "last_name", "mobile", "email"].includes(k) && !isNew)));
    body.experience_years = Number(values.experience_years || 0);
    body.subjects = values.subjects;
    try {
      if (isNew) {
        const res = await staffService.create(body);
        setCreated(res);
        notify(`${res.name} added`);
      } else {
        await staffService.update(id, body);
        notify("Saved");
        navigate(PATHS.staffProfile(id));
      }
    } catch (err) {
      setErrors(apiErrors(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingState />;
  if (created) {
    return (
      <div className="card success-card">
        <h2>{created.name} is added</h2>
        <p className="muted">{created.login.note}</p>
        <div className="login-box">
          <div>Login mobile <strong>{created.login.mobile}</strong></div>
          {created.login.password && <div>Password <strong>{created.login.password}</strong></div>}
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={() => { setCreated(null); setValues(EMPTY); }}>Add another</button>
          <Link className="btn btn-primary" to={PATHS.staffProfile(created.id)}>Open profile</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader code="W23" title={isNew ? "Add teacher / staff" : `Edit ${values.name || ""}`} subtitle={isNew ? "The mobile number becomes their login. We send the password on WhatsApp and e-mail." : "Job details. Name and mobile are the login."} back={{ to: isNew ? PATHS.staff : PATHS.staffProfile(id), label: isNew ? "Teachers & staff" : "Profile" }} />
      <form onSubmit={submit} noValidate>
        {errors._ && <div className="alert alert-error">{errors._}</div>}
        {isNew && (
          <section className="card form-card">
            <h3>Person &amp; login</h3>
            <div className="form-grid">
              <FormInput label="First name" name="first_name" value={values.first_name} onChange={set} error={errors.first_name} required />
              <FormInput label="Last name" name="last_name" value={values.last_name} onChange={set} />
              <FormInput label="Mobile (login)" name="mobile" value={values.mobile} onChange={set} error={errors.mobile} inputMode="numeric" maxLength={10} required />
              <FormInput label="E-mail" name="email" type="email" value={values.email} onChange={set} error={errors.email} />
            </div>
          </section>
        )}
        <section className="card form-card">
          <h3>Job</h3>
          <div className="form-grid">
            <FormSelect label="Type" name="staff_type" value={values.staff_type} onChange={set} options={STAFF_TYPES} placeholder={null} error={errors.staff_type} />
            <FormSelect label="Employment" name="employment_type" value={values.employment_type} onChange={set} options={EMPLOYMENT_TYPES} placeholder={null} />
            <FormInput label="Employee code" name="employee_code" value={values.employee_code} onChange={set} error={errors.employee_code} />
            <FormInput label="Designation" name="designation" value={values.designation} onChange={set} placeholder="Class Teacher" />
            <FormInput label="Department" name="department" value={values.department} onChange={set} />
            <FormInput label="Qualification" name="qualification" value={values.qualification} onChange={set} placeholder="B.Ed, M.Sc" />
            <FormInput label="Experience (years)" name="experience_years" type="number" min="0" value={values.experience_years} onChange={set} />
            <FormInput label="Joining date" name="joining_date" type="date" value={values.joining_date} onChange={set} error={errors.joining_date} />
            <FormSelect label="Gender" name="gender" value={values.gender} onChange={set} options={GENDERS} />
            <FormInput label="Date of birth" name="date_of_birth" type="date" value={values.date_of_birth} onChange={set} error={errors.date_of_birth} />
            <FormInput label="Address" name="address" type="textarea" rows={2} value={values.address} onChange={set} className="span-2" />
          </div>
        </section>
        {values.staff_type === "TEACHER" && (
          <section className="card form-card">
            <h3>Subjects</h3>
            {subjects.length === 0 ? (
              <p className="muted">No subjects yet – add them in Academics → Subjects &amp; teachers.</p>
            ) : (
              <div className="chip-row">
                {subjects.map((s) => (
                  <button type="button" key={s.id} className={`chip chip-toggle ${values.subjects.includes(s.id) ? "on" : ""}`} aria-pressed={values.subjects.includes(s.id)} onClick={() => toggleSubject(s.id)}>
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
        <div className="form-actions">
          <Link className="btn btn-ghost" to={PATHS.staff}>Cancel</Link>
          <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : isNew ? "Add & send login" : "Save"}</button>
        </div>
      </form>
    </>
  );
}
