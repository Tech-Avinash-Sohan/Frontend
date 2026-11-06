import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import SearchBar from "../../../components/common/search_bar";
import FilterBar from "../../../components/common/filter_bar";
import StatusBadge from "../../../components/common/status_badge";
import { STAFF_TYPES, staffService } from "../../../services/staff_service";
import { useDebounce } from "../../../hooks/use_debounce";
import { PATHS } from "../../../lib/route_paths";

export const typeLabel = (v) => STAFF_TYPES.find((t) => t.value === v)?.label || v;

/** W22 – GET /staff/. Teachers get the Teacher app free. */
export default function StaffDirectory() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ staff_type: "", is_active: "true" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const search = useDebounce(q, 300);

  useEffect(() => {
    setLoading(true);
    staffService.list({ search, page, ...filters }).then(setData).finally(() => setLoading(false));
  }, [search, page, filters]);

  return (
    <>
      <PageHeader code="W22" title="Teachers & staff" subtitle={`${data.count} people`} actions={<Link to={PATHS.staffForm()} className="btn btn-primary">+ Add teacher / staff</Link>} />
      <div className="toolbar">
        <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Name, mobile, employee code" />
        <FilterBar
          values={filters}
          onChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }}
          filters={[
            { key: "staff_type", label: "Type", options: STAFF_TYPES },
            { key: "is_active", label: "Status", options: [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }] },
          ]}
        />
      </div>
      <DataTable
        loading={loading}
        rows={data.results}
        count={data.count}
        page={page}
        onPage={setPage}
        onRowClick={(s) => navigate(PATHS.staffProfile(s.id))}
        empty="No teachers or staff yet."
        columns={[
          { key: "name", label: "Name", render: (s) => <span className="cell-person"><span className="avatar avatar-sm">{s.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span><span><strong>{s.name}</strong><br /><small className="muted">{s.employee_code || "—"}</small></span></span> },
          { key: "staff_type", label: "Type", render: (s) => typeLabel(s.staff_type) },
          { key: "designation", label: "Designation" },
          { key: "mobile", label: "Mobile (login)" },
          { key: "is_active", label: "Status", render: (s) => <StatusBadge status={s.is_active} /> },
        ]}
      />
    </>
  );
}
