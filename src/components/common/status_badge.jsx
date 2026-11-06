const TONES = {
  success: ["active", "approved", "sent", "submitted", "paid", "cleared", "ok", "present", "P", "current", "issued", "closed_ok"],
  warning: ["pending", "draft", "scheduled", "invited", "planned", "warning", "L", "LT", "late", "medium", "processing"],
  danger: ["blocked", "rejected", "cancelled", "bounced", "error", "overdue", "absent", "A", "left", "high", "inactive", "not_submitted"],
  info: ["not_invited", "low", "closed", "H", "holiday", "event", "exam"],
};
const LABELS = {
  P: "Present", A: "Absent", L: "Leave", LT: "Late", H: "Holiday",
  not_invited: "Not invited", not_submitted: "Not submitted",
};

export default function StatusBadge({ status, label }) {
  const s = status === true ? "active" : status === false ? "inactive" : String(status ?? "");
  const tone = Object.keys(TONES).find((t) => TONES[t].includes(s)) || "neutral";
  const text = label || LABELS[s] || s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
  return <span className={`badge badge-${tone}`}>{text || "—"}</span>;
}
