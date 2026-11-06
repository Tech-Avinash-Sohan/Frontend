import CrudScreen from "../../../components/common/crud_screen";
import { terms } from "../../../services/academics_service";
import { useSchool } from "../../../context/school_context";
import { formatDate } from "../../../utils/format_date";

/** W26b – terms / semesters inside a year (/academics/terms/). Exams can be linked to a term. */
export default function Terms() {
  const { yearOptions, currentYear } = useSchool();
  return (
    <CrudScreen code="W26b" title="Terms" service={terms} search={false} createLabel="+ Add term" defaults={{ academic_year: currentYear?.id }}
      filters={[{ key: "academic_year", label: "Year", options: yearOptions }]}
      fields={[{ name: "academic_year", label: "Year", type: "select", options: yearOptions, required: true }, { name: "name", label: "Name", required: true },
        { name: "start_date", label: "From", type: "date", required: true }, { name: "end_date", label: "To", type: "date", required: true }]}
      columns={[{ key: "name", label: "Term", render: (r) => <strong>{r.name}</strong> }, { key: "academic_year_name", label: "Year" },
        { key: "d", label: "Dates", render: (r) => `${formatDate(r.start_date)} – ${formatDate(r.end_date)}` }]} empty="No terms." />
  );
}
