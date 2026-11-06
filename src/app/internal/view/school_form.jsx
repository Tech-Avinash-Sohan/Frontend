import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import FormInput from "../../../components/forms/form_input";
import FormSelect from "../../../components/forms/form_select";
import LoadingState from "../../../components/common/loading_state";
import { internalService } from "../../../services/internal_service";
import { useSchool } from "../../../context/school_context";
import { PATHS } from "../../../lib/route_paths";
import { apiErrors, rules, validate } from "../../../utils/validation";

export const BOARDS = [
  { value: "STATE", label: "State Board" }, { value: "CBSE", label: "CBSE" }, { value: "ICSE", label: "ICSE" },
  { value: "IB", label: "IB" }, { value: "OTHER", label: "Other" },
];
export const MEDIUMS = [
  { value: "ENGLISH", label: "English" }, { value: "HINDI", label: "Hindi" }, { value: "MARATHI", label: "Marathi" },
  { value: "SEMI_ENGLISH", label: "Semi English" }, { value: "OTHER", label: "Other" },
];
const EMPTY = {
  name: "", code: "", board: "STATE", medium: "ENGLISH", city: "", state: "", pincode: "", address: "", principal_name: "",
  email: "", alternate_mobile: "", udise_code: "", affiliation_no: "", website: "", parent_app_fee: 1000, licence_valid_till: "",
  contact_first_name: "", contact_last_name: "", login_mobile: "", login_email: "",
};

/** POST /internal/schools/ (create + send login) · PATCH /internal/schools/{id}/ (edit). */
export default function SchoolForm() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { notify } = useSchool();
  const [values, setValues] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);
  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (!isNew) internalService.school(id).then((s) => setValues({ ...EMPTY, ...Object.fromEntries(Object.entries(s).map(([k, v]) => [k, v ?? ""])) })).finally(() => setLoading(false));
  }, [id, isNew]);

  const submit = async (e) => {
    e.preventDefault();
    const schema = { name: [rules.required], email: [rules.email] };
    if (isNew) Object.assign(schema, { contact_first_name: [rules.required], login_mobile: [rules.required, rules.phone], login_email: [rules.email] });
    const errs = validate(values, schema);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const body = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== ""));
    body.parent_app_fee = Number(values.parent_app_fee || 0);
    try {
      if (isNew) {
        const res = await internalService.createSchool(body);
        setCreated(res);
        notify(`${res.name} created – login sent on WhatsApp and e-mail`);
      } else {
        await internalService.updateSchool(id, body);
        notify("School saved");
        navigate(PATHS.internalSchool(id));
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
        <h2>{created.name} is ready</h2>
        <p className="muted">The login below was sent by WhatsApp and e-mail. It is shown only once.</p>
        <div className="details">
          <div className="details-row"><span>School code</span><strong>{created.code}</strong></div>
          <div className="details-row"><span>Login mobile</span><strong>{created.login.mobile}</strong></div>
          <div className="details-row"><span>Password</span><strong>{created.login.password}</strong></div>
        </div>
        <div className="form-actions">
          <Link className="btn btn-ghost" to={PATHS.internalSchools}>All schools</Link>
          <Link className="btn btn-primary" to={PATHS.internalSchool(created.id)}>Open school</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={isNew ? "Create a school" : `Edit ${values.name}`}
        subtitle={isNew ? "We create the SCHOOL login and send the software link, login mobile and password on WhatsApp and e-mail." : "Details, Parent app fee and licence."}
        back={{ to: isNew ? PATHS.internalSchools : PATHS.internalSchool(id), label: isNew ? "Schools" : "School" }}
      />
      <form onSubmit={submit} noValidate>
        {errors._ && <div className="alert alert-error">{errors._}</div>}
        <section className="card form-card">
          <h3>School details</h3>
          <div className="form-grid">
            <FormInput label="School name" name="name" value={values.name} onChange={set} error={errors.name} required />
            <FormInput label="Code" name="code" value={values.code} onChange={set} error={errors.code} hint={isNew ? "Leave empty to create one (e.g. XYZ001)" : "Cannot be changed"} disabled={!isNew} />
            <FormSelect label="Board" name="board" value={values.board} onChange={set} options={BOARDS} placeholder={null} />
            <FormSelect label="Medium" name="medium" value={values.medium} onChange={set} options={MEDIUMS} placeholder={null} />
            <FormInput label="Principal" name="principal_name" value={values.principal_name} onChange={set} />
            <FormInput label="School e-mail" name="email" type="email" value={values.email} onChange={set} error={errors.email} />
            <FormInput label="City" name="city" value={values.city} onChange={set} />
            <FormInput label="State" name="state" value={values.state} onChange={set} />
            <FormInput label="Pincode" name="pincode" value={values.pincode} onChange={set} />
            <FormInput label="Alternate mobile" name="alternate_mobile" value={values.alternate_mobile} onChange={set} />
            <FormInput label="UDISE code" name="udise_code" value={values.udise_code} onChange={set} />
            <FormInput label="Affiliation no." name="affiliation_no" value={values.affiliation_no} onChange={set} />
            <FormInput label="Address" name="address" type="textarea" rows={2} value={values.address} onChange={set} className="span-2" />
          </div>
        </section>

        {isNew && (
          <section className="card form-card">
            <h3>School login <small className="muted">· user_type SCHOOL</small></h3>
            <div className="form-grid">
              <FormInput label="Contact first name" name="contact_first_name" value={values.contact_first_name} onChange={set} error={errors.contact_first_name} required />
              <FormInput label="Contact last name" name="contact_last_name" value={values.contact_last_name} onChange={set} />
              <FormInput label="Login mobile" name="login_mobile" value={values.login_mobile} onChange={set} error={errors.login_mobile} inputMode="numeric" maxLength={10} required />
              <FormInput label="Login e-mail" name="login_email" type="email" value={values.login_email} onChange={set} error={errors.login_email} />
            </div>
          </section>
        )}

        <section className="card form-card">
          <h3>Plan</h3>
          <div className="form-grid">
            <FormInput label="Parent app fee (₹ per year)" name="parent_app_fee" type="number" min="0" value={values.parent_app_fee} onChange={set} error={errors.parent_app_fee} hint="0 = free for this school's parents" />
            <FormInput label="Licence valid till" name="licence_valid_till" type="date" value={values.licence_valid_till} onChange={set} error={errors.licence_valid_till} />
          </div>
        </section>

        <div className="form-actions">
          <Link className="btn btn-ghost" to={PATHS.internalSchools}>Cancel</Link>
          <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : isNew ? "Create school & send login" : "Save"}</button>
        </div>
      </form>
    </>
  );
}
