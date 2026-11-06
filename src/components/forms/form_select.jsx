/**
 * <FormSelect label="Class" name="school_class" value={v.school_class} onChange={set}
 *             options={[{ value: 1, label: "Std 1" }]} placeholder="Choose…" error={errors.school_class} />
 */
export default function FormSelect({ label, name, value, onChange, options = [], placeholder = "Choose…", error, required, hint, className = "", ...rest }) {
  const id = `f-${name}`;
  return (
    <div className={`field ${error ? "has-error" : ""} ${className}`}>
      {label && (
        <label htmlFor={id}>
          {label}
          {required && <span className="req">*</span>}
        </label>
      )}
      <select id={id} name={name} value={value ?? ""} onChange={(e) => onChange?.(name, e.target.value)} {...rest}>
        {placeholder !== null && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <small className="field-error">{error}</small> : hint ? <small className="field-hint">{hint}</small> : null}
    </div>
  );
}
