// Same rules as the Django API, so most mistakes are caught before the request is sent.
export const isPhone = (v) => /^[6-9]\d{9}$/.test(String(v || ""));
export const isEmail = (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isOtp = (v, length = 4) => new RegExp(`^\\d{${length}}$`).test(String(v || ""));

/**
 * validate(values, { phone: [required, phone], email: [email] }) -> { phone: "Required" }
 */
export const rules = {
  required: (v) => (v === undefined || v === null || String(v).trim() === "" ? "Required" : null),
  phone: (v) => (v && !isPhone(v) ? "Enter a 10-digit mobile number" : null),
  email: (v) => (!isEmail(v) ? "Enter a valid email" : null),
  positive: (v) => (v !== "" && v !== undefined && Number(v) <= 0 ? "Must be more than 0" : null),
  minLength: (n) => (v) => (v && String(v).length < n ? `At least ${n} characters` : null),
  pastDate: (v) => (v && v > new Date().toISOString().slice(0, 10) ? "Cannot be in the future" : null),
};

export function validate(values, schema) {
  const errors = {};
  Object.entries(schema).forEach(([field, checks]) => {
    for (const check of checks) {
      const msg = check(values[field], values);
      if (msg) {
        errors[field] = msg;
        break;
      }
    }
  });
  return errors;
}

/** Turn a DRF error body ({field: ["msg"]} or {detail: "msg"}) into { field: "msg" } + a top message */
export function apiErrors(err) {
  const data = err?.data;
  if (!data || typeof data !== "object") return { _: err?.message || "Something went wrong" };
  const out = {};
  Object.entries(data).forEach(([k, v]) => (out[k === "detail" || k === "non_field_errors" ? "_" : k] = Array.isArray(v) ? v.join(" ") : String(v)));
  return out;
}
