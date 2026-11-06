/**
 * <FormInput label="Mobile" name="phone" value={v.phone} onChange={set} error={errors.phone} type="tel" required />
 * onChange receives (name, value). type="textarea" renders a textarea. type="checkbox" passes true/false.
 */
export default function FormInput({ label, name, value, onChange, error, type = "text", hint, required, className = "", ...rest }) {
  const id = `f-${name}`;
  const handle = (e) => onChange?.(name, type === "checkbox" ? e.target.checked : e.target.value);

  if (type === "checkbox") {
    return (
      <label className={`field field-check ${className}`} htmlFor={id}>
        <input id={id} type="checkbox" checked={!!value} onChange={handle} {...rest} />
        <span>{label}</span>
      </label>
    );
  }
  return (
    <div className={`field ${error ? "has-error" : ""} ${className}`}>
      {label && (
        <label htmlFor={id}>
          {label}
          {required && <span className="req">*</span>}
        </label>
      )}
      {type === "textarea" ? (
        <textarea id={id} name={name} value={value ?? ""} onChange={handle} rows={rest.rows || 4} {...rest} />
      ) : (
        <input id={id} name={name} type={type} value={value ?? ""} onChange={handle} {...rest} />
      )}
      {error ? <small className="field-error">{error}</small> : hint ? <small className="field-hint">{hint}</small> : null}
    </div>
  );
}
