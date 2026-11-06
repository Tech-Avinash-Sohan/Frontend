import { useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import FormInput from "../../../components/forms/form_input";
import { authService } from "../../../services/auth_service";
import { PATHS } from "../../../lib/route_paths";
import { apiErrors, rules, validate } from "../../../utils/validation";

const LENGTH = Number(import.meta.env.VITE_OTP_LENGTH || 4);

/** Forgot password, step 2: POST /auth/password/reset/ { mobile, otp, new_password }. */
export default function VerifyCode() {
  const location = useLocation();
  const navigate = useNavigate();
  const mobile = location.state?.mobile;
  const [digits, setDigits] = useState(Array(LENGTH).fill(""));
  const [values, setValues] = useState({ new_password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const refs = useRef([]);

  if (!mobile) return <Navigate to={PATHS.resetPassword} replace />;

  const setDigit = (i, v) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < LENGTH - 1) refs.current[i + 1]?.focus();
  };
  const onKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };
  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const otp = digits.join("");
    const errs = validate(values, {
      new_password: [rules.required, rules.minLength(8)],
      confirm: [rules.required, (v, all) => (v !== all.new_password ? "Passwords do not match" : null)],
    });
    if (otp.length !== LENGTH) errs._ = `Enter the ${LENGTH}-digit OTP.`;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await authService.resetPassword(mobile, otp, values.new_password);
      navigate(PATHS.login, { replace: true, state: { message: "Password reset. Log in with your new password." } });
    } catch (err) {
      setErrors(apiErrors(err));
      setDigits(Array(LENGTH).fill(""));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <h2>Enter the OTP</h2>
      <p className="muted">
        Sent to <strong>{mobile}</strong> on WhatsApp and SMS. Valid for 5 minutes.
      </p>
      {errors._ && <div className="alert alert-error">{errors._}</div>}
      <div className="otp-boxes">
        {digits.map((d, i) => (
          <input key={i} ref={(el) => (refs.current[i] = el)} value={d} onChange={(e) => setDigit(i, e.target.value)} onKeyDown={(e) => onKey(i, e)} inputMode="numeric" maxLength={1} aria-label={`Digit ${i + 1}`} autoFocus={i === 0} />
        ))}
      </div>
      <FormInput label="New password" name="new_password" type="password" value={values.new_password} onChange={set} error={errors.new_password} required />
      <FormInput label="Repeat new password" name="confirm" type="password" value={values.confirm} onChange={set} error={errors.confirm} required />
      <button className="btn btn-primary btn-block" disabled={busy}>
        {busy ? "Saving…" : "Set new password"}
      </button>
      <div className="auth-links">
        <Link to={PATHS.resetPassword}>← Send the OTP again</Link>
      </div>
    </form>
  );
}
