/**
 * <FilterBar filters={[{ key: "status", label: "Status", options: [{value, label}] }]} values={...} onChange={(key, value) => ...}>
 *   extra buttons
 * </FilterBar>
 */
export default function FilterBar({ filters = [], values = {}, onChange, children }) {
  return (
    <div className="filter-bar">
      {filters.map((f) => (
        <label key={f.key} className="filter">
          <span>{f.label}</span>
          {f.type === "date" ? (
            <input type="date" value={values[f.key] || ""} onChange={(e) => onChange(f.key, e.target.value)} />
          ) : (
            <select value={values[f.key] ?? ""} onChange={(e) => onChange(f.key, e.target.value)}>
              <option value="">{f.all || "All"}</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </label>
      ))}
      {children && <div className="filter-actions">{children}</div>}
    </div>
  );
}
