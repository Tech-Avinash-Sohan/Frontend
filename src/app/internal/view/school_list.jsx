import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import SearchBar from "../../../components/common/search_bar";
import FilterBar from "../../../components/common/filter_bar";
import StatusBadge from "../../../components/common/status_badge";
import { internalService } from "../../../services/internal_service";
import { useDebounce } from "../../../hooks/use_debounce";
import { PATHS } from "../../../lib/route_paths";
import { formatDate } from "../../../utils/format_date";

/** GET /internal/schools/ – every school we sold to. */
export default function SchoolList() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ is_active: "", board: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const search = useDebounce(q, 300);

  useEffect(() => {
    setLoading(true);
    internalService.schools({ search, page, ...filters }).then(setData).finally(() => setLoading(false));
  }, [search, page, filters]);

  return (
    <>
      <PageHeader title="Schools" subtitle={`${data.count} schools`} actions={<Link to={PATHS.internalSchoolForm()} className="btn btn-primary">+ Create school</Link>} />
      <div className="toolbar">
        <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search name, code, mobile, city" />
        <FilterBar
          values={filters}
          onChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }}
          filters={[
            { key: "is_active", label: "Status", options: [{ value: "true", label: "Active" }, { value: "false", label: "Switched off" }] },
            { key: "board", label: "Board", options: ["STATE", "CBSE", "ICSE", "IB", "OTHER"].map((b) => ({ value: b, label: b })) },
          ]}
        />
      </div>
      <DataTable
        loading={loading}
        rows={data.results}
        count={data.count}
        page={page}
        onPage={setPage}
        onRowClick={(s) => navigate(PATHS.internalSchool(s.id))}
        empty="No school matches."
        columns={[
          { key: "name", label: "School", render: (s) => <span><strong>{s.name}</strong><br /><small className="muted">{s.code}</small></span> },
          { key: "contact_name", label: "Login", render: (s) => <span>{s.contact_name}<br /><small className="muted">{s.login_mobile}</small></span> },
          { key: "city", label: "City" },
          { key: "board", label: "Board" },
          { key: "parent_app_fee", label: "Parent app fee", align: "right", render: (s) => (s.parent_app_fee ? `₹${s.parent_app_fee}/yr` : "Free") },
          { key: "licence_valid_till", label: "Licence till", render: (s) => (s.licence_valid_till ? formatDate(s.licence_valid_till) : "—") },
          { key: "is_active", label: "Status", render: (s) => <StatusBadge status={s.is_active} label={s.is_active ? "Active" : "Switched off"} /> },
        ]}
      />
    </>
  );
}
