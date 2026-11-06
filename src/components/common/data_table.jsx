import LoadingState from "./loading_state";

/**
 * <DataTable columns={[{ key, label, render?, align?, width? }]} rows={[]} loading onRowClick
 *            page count pageSize onPage selectable selected onSelect />
 */
export default function DataTable({
  columns,
  rows = [],
  loading = false,
  empty = "Nothing to show yet.",
  onRowClick,
  rowKey = "id",
  page,
  count,
  pageSize = 50,
  onPage,
  selectable = false,
  selected = [],
  onSelect,
  footer,
}) {
  const pages = count ? Math.max(1, Math.ceil(count / pageSize)) : 1;
  const allIds = rows.map((r) => r[rowKey]);
  const allChecked = selectable && rows.length > 0 && allIds.every((id) => selected.includes(id));

  const toggle = (id) => onSelect?.(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  const toggleAll = () => onSelect?.(allChecked ? selected.filter((x) => !allIds.includes(x)) : [...new Set([...selected, ...allIds])]);

  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {selectable && (
                <th className="col-check">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Select all" />
                </th>
              )}
              {columns.map((c) => (
                <th key={c.key} style={{ textAlign: c.align || "left", width: c.width }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)}>
                  <LoadingState compact />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="table-empty">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={row[rowKey] ?? i} onClick={onRowClick ? () => onRowClick(row) : undefined} className={onRowClick ? "clickable" : ""}>
                  {selectable && (
                    <td className="col-check" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.includes(row[rowKey])} onChange={() => toggle(row[rowKey])} aria-label="Select row" />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} style={{ textAlign: c.align || "left" }}>
                      {c.render ? c.render(row, i) : (row[c.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          {footer && <tfoot>{footer}</tfoot>}
        </table>
      </div>
      {onPage && count > pageSize && (
        <div className="table-pager">
          <span>
            {count} records · page {page} of {pages}
          </span>
          <div className="pager-buttons">
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
              ← Previous
            </button>
            <button className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
