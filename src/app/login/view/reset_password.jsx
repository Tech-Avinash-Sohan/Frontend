import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../../../components/forms/form_input";
import { authService } from "../../../services/auth_service";
import { PATHS } from "../../../lib/route_paths";
import { apiErrors, rules, validate } from "../../../utils/validation";

/** Forgot password, step 1: POST /auth/password/forgot/ { mobile } -> OTP on WhatsApp / SMS. */
export default function ResetPassword() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate({ mobile }, { mobile: [rules.required, rules.phone] });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await authService.forgotPassword(mobile);
      navigate(PATHS.verify, { state: { mobile } });
    } catch (err) {
      setErrors(apiErrors(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <h2>Forgot password</h2>
      <p className="muted">We will send an OTP to your mobile on WhatsApp and SMS.</p>
      {errors._ && <div className="alert alert-error">{errors._}</div>}
      <FormInput label="Mobile number" name="mobile" value={mobile} onChange={(_, v) => setMobile(v)} error={errors.mobile} inputMode="numeric" maxLength={10} autoFocus required />
      <button className="btn btn-primary btn-block" disabled={busy}>
        {busy ? "Sending…" : "Send OTP"}
      </button>
      <div className="auth-links">
        <Link to={PATHS.login}>← Back to log in</Link>
      </div>
    </form>
  );
}
