import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import SearchBar from "../../../components/common/search_bar";
import FilterBar from "../../../components/common/filter_bar";
import StatusBadge from "../../../components/common/status_badge";
import { studentsService } from "../../../services/students_service";
import { useSchool } from "../../../context/school_context";
import { useDebounce } from "../../../hooks/use_debounce";
import { PATHS } from "../../../lib/route_paths";
import { formatDate } from "../../../utils/format_date";

export const STATUS = [
  { value: "ACTIVE", label: "Active" }, { value: "LEFT", label: "Left" }, { value: "PASSED_OUT", label: "Passed out" }, { value: "CANCELLED", label: "Cancelled" },
];
export const appBadge = (p) => (p?.app_status ? <StatusBadge status="active" label={`App till ${formatDate(p.app_valid_till)}`} /> : <StatusBadge status="pending" label="App not paid" />);

/** W03 – GET /students/ with class / section / status filters and search (name, admission no., parent mobile). */
export default function StudentDirectory() {
  const navigate = useNavigate();
  const { classOptions, sectionOptions } = useSchool();
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ school_class: "", section: "", status: "ACTIVE" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const search = useDebounce(q, 300);

  useEffect(() => {
    setLoading(true);
    studentsService.list({ search, page, ...filters }).then(setData).finally(() => setLoading(false));
  }, [search, page, filters]);

  return (
    <>
      <PageHeader code="W03" title="Students" subtitle={`${data.count} students`} actions={<Link to={PATHS.newAdmission} className="btn btn-primary">+ New admission</Link>} />
      <div className="toolbar">
        <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Name, admission no. or parent mobile" />
        <FilterBar
          values={filters}
          onChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v, ...(k === "school_class" ? { section: "" } : {}) })); setPage(1); }}
          filters={[
            { key: "school_class", label: "Class", options: classOptions },
            { key: "section", label: "Section", options: sectionOptions(filters.school_class) },
            { key: "status", label: "Status", options: STATUS },
          ]}
        />
      </div>
      <DataTable
        loading={loading}
        rows={data.results}
        count={data.count}
        page={page}
        onPage={setPage}
        onRowClick={(s) => navigate(PATHS.studentProfile(s.id))}
        empty="No students yet – start with a new admission."
        columns={[
          { key: "roll_no", label: "Roll", width: 60 },
          { key: "full_name", label: "Student", render: (s) => <span><strong>{s.full_name}</strong><br /><small className="muted">{s.admission_no}</small></span> },
          { key: "class", label: "Class", render: (s) => `${s.class_name}${s.section_name ? `-${s.section_name}` : ""}` },
          { key: "parent", label: "Parent", render: (s) => <span>{s.parent.name}<br /><small className="muted">{s.parent.mobile}</small></span> },
          { key: "app", label: "Parent app", render: (s) => appBadge(s.parent) },
          { key: "status", label: "Status", render: (s) => <StatusBadge status={s.status.toLowerCase()} /> },
        ]}
      />
    </>
  );
}
