import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormInput from "../../../components/forms/form_input";
import { useAuth } from "../../../hooks/use_auth";
import { PATHS } from "../../../lib/route_paths";
import { apiErrors, rules, validate } from "../../../utils/validation";

/** First login with the generated password (must_change_password) – or "Change password" from the menu.
 *  POST /auth/password/change/ { old_password, new_password }. Every device is signed out afterwards. */
export default function ActivateInvitation() {
  const { user, changePassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const first = !!user?.must_change_password;
  const [values, setValues] = useState({ old_password: location.state?.password || "", new_password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  if (!user) {
    navigate(PATHS.login, { replace: true });
    return null;
  }

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(values, {
      old_password: [rules.required],
      new_password: [rules.required, rules.minLength(8)],
      confirm: [rules.required, (v, all) => (v !== all.new_password ? "Passwords do not match" : null)],
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await changePassword(values.old_password, values.new_password);
      navigate(PATHS.login, { replace: true, state: { message: "Password changed. Log in with your new password." } });
    } catch (err) {
      setErrors(apiErrors(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <h2>{first ? "Set your own password" : "Change password"}</h2>
      <p className="muted">{first ? `Welcome ${user.first_name}. Replace the password we sent you before you continue.` : "You will be signed out of every device."}</p>
      {errors._ && <div className="alert alert-error">{errors._}</div>}
      <FormInput label={first ? "Password from WhatsApp" : "Current password"} name="old_password" type="password" value={values.old_password} onChange={set} error={errors.old_password} required />
      <FormInput label="New password" name="new_password" type="password" value={values.new_password} onChange={set} error={errors.new_password} hint="At least 8 characters, not a common password" required />
      <FormInput label="Repeat new password" name="confirm" type="password" value={values.confirm} onChange={set} error={errors.confirm} required />
      <button className="btn btn-primary btn-block" disabled={busy}>
        {busy ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}
