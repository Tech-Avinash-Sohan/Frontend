import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FormInput from "../../../components/forms/form_input";
import { useAuth } from "../../../hooks/use_auth";
import { PATHS } from "../../../lib/route_paths";
import { apiErrors, rules, validate } from "../../../utils/validation";

/** POST /auth/login/ { mobile, password }. First login (generated password) -> set your own password. */
export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ mobile: "", password: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(values, { mobile: [rules.required, rules.phone], password: [rules.required] });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const res = await signIn(values.mobile.trim(), values.password);
      if (res.next_step === "change_password") return navigate(PATHS.activate, { replace: true, state: { password: values.password } });
      const home = res.user.user_type.includes("SUPER_ADMIN") ? PATHS.internal : PATHS.dashboard;
      navigate(location.state?.from && location.state.from !== "/" ? location.state.from : home, { replace: true });
    } catch (err) {
      setErrors(apiErrors(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <h2>Log in</h2>
      <p className="muted">Use the mobile number and password you got on WhatsApp / e-mail.</p>
      {location.state?.message && <div className="alert alert-success">{location.state.message}</div>}
      {errors._ && <div className="alert alert-error">{errors._}</div>}
      <FormInput label="Mobile number" name="mobile" value={values.mobile} onChange={set} error={errors.mobile} inputMode="numeric" maxLength={10} autoComplete="username" autoFocus required />
      <FormInput label="Password" name="password" type="password" value={values.password} onChange={set} error={errors.password} autoComplete="current-password" required />
      <button className="btn btn-primary btn-block" disabled={busy}>
        {busy ? "Logging in…" : "Log in"}
      </button>
      <div className="auth-links">
        <Link to={PATHS.resetPassword}>Forgot password?</Link>
      </div>
    </form>
  );
}
