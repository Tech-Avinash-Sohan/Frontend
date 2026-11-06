import { useEffect, useState } from "react";
import PageHeader from "../../../components/layout/page_header";
import FormInput from "../../../components/forms/form_input";
import FormSelect from "../../../components/forms/form_select";
import LoadingState from "../../../components/common/loading_state";
import { settingsService } from "../../../services/settings_service";
import { useSchool } from "../../../context/school_context";
import { formatDate } from "../../../utils/format_date";
import { apiErrors } from "../../../utils/validation";
import { BOARDS, MEDIUMS } from "../../internal/view/school_form";

const FIELDS = ["name", "email", "alternate_mobile", "principal_name", "address", "city", "state", "pincode", "board", "medium", "udise_code", "affiliation_no", "logo_url", "website"];

/** W40 – GET / PATCH /school/profile/. Code, login mobile, Parent app fee and licence are set by our team. */
export default function SchoolProfile() {
  const { notify, reload } = useSchool();
  const [s, setS] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setValues((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    settingsService.school().then((d) => {
      setS(d);
      setValues(Object.fromEntries(FIELDS.map((k) => [k, d[k] ?? ""])));
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v === "" ? null : v]));
      body.name = values.name;
      setS(await settingsService.saveSchool(body));
      notify("School profile saved");
      reload();
    } catch (err) {
      setErrors(apiErrors(err));
    } finally {
      setBusy(false);
    }
  };

  if (!s) return <LoadingState />;
  return (
    <>
      <PageHeader code="W40" title="School profile" subtitle={`${s.code} · login mobile ${s.mobile}`} />
      <div className="grid-2-wide">
        <form onSubmit={submit} noValidate className="card form-card">
          {errors._ && <div className="alert alert-error">{errors._}</div>}
          <div className="form-grid">
            <FormInput label="School name" name="name" value={values.name} onChange={set} error={errors.name} required className="span-2" />
            <FormSelect label="Board" name="board" value={values.board} onChange={set} options={BOARDS} placeholder={null} />
            <FormSelect label="Medium" name="medium" value={values.medium} onChange={set} options={MEDIUMS} placeholder={null} />
            <FormInput label="Principal" name="principal_name" value={values.principal_name} onChange={set} />
            <FormInput label="E-mail" name="email" type="email" value={values.email} onChange={set} error={errors.email} />
            <FormInput label="Alternate mobile" name="alternate_mobile" value={values.alternate_mobile} onChange={set} />
            <FormInput label="Website" name="website" value={values.website} onChange={set} error={errors.website} placeholder="https://" />
            <FormInput label="City" name="city" value={values.city} onChange={set} />
            <FormInput label="State" name="state" value={values.state} onChange={set} />
            <FormInput label="Pincode" name="pincode" value={values.pincode} onChange={set} />
            <FormInput label="UDISE code" name="udise_code" value={values.udise_code} onChange={set} />
            <FormInput label="Affiliation no." name="affiliation_no" value={values.affiliation_no} onChange={set} />
            <FormInput label="Logo URL" name="logo_url" value={values.logo_url} onChange={set} />
            <FormInput label="Address" name="address" type="textarea" rows={2} value={values.address} onChange={set} className="span-2" />
          </div>
          <div className="form-actions"><button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button></div>
        </form>
        <section className="card">
          <div className="card-head"><h3>Plan (set by our team)</h3></div>
          <dl className="details">
            <dt>School code</dt><dd>{s.code}</dd>
            <dt>Parent app fee</dt><dd>{s.parent_app_fee ? `₹${s.parent_app_fee} per parent per year` : "Free"}</dd>
            <dt>Licence till</dt><dd>{s.licence_valid_till ? formatDate(s.licence_valid_till) : "No end date"}</dd>
          </dl>
        </section>
      </div>
    </>
  );
}
