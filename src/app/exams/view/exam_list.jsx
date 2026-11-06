import { useNavigate } from "react-router-dom";
import CrudScreen from "../../../components/common/crud_screen";
import StatusBadge from "../../../components/common/status_badge";
import { EXAM_TYPES, exams } from "../../../services/exams_service";
import { useSchool } from "../../../context/school_context";
import { PATHS } from "../../../lib/route_paths";
import { formatDate } from "../../../utils/format_date";

/** W53 – exams (/exams/exams/). Open one to add papers and move it DRAFT → SCHEDULED → MARKS_ENTRY → PUBLISHED. */
export default function ExamList() {
  const { yearOptions, currentYear, classOptions } = useSchool();
  const navigate = useNavigate();
  return (
    <CrudScreen code="W53" title="Exams" service={exams} createLabel="+ New exam" defaults={{ academic_year: currentYear?.id, exam_type: "UNIT_TEST", classes: [], weightage: 100 }}
      filters={[{ key: "academic_year", label: "Year", options: yearOptions }, { key: "exam_type", label: "Type", options: EXAM_TYPES }]}
      onRowClick={(e) => navigate(PATHS.examDetail(e.id))}
      fields={[{ name: "name", label: "Name", required: true }, { name: "exam_type", label: "Type", type: "select", options: EXAM_TYPES, placeholder: null },
        { name: "academic_year", label: "Year", type: "select", options: yearOptions, required: true }, { name: "start_date", label: "From", type: "date" },
        { name: "end_date", label: "To", type: "date" }, { name: "weightage", label: "Weightage %", type: "number" },
        { name: "classes", label: "Classes", type: "multiselect", options: classOptions, required: true }]}
      columns={[{ key: "name", label: "Exam", render: (e) => <strong>{e.name}</strong> }, { key: "exam_type", label: "Type" }, { key: "class_names", label: "Classes", render: (e) => e.class_names.join(", ") },
        { key: "d", label: "Dates", render: (e) => (e.start_date ? `${formatDate(e.start_date)} – ${formatDate(e.end_date)}` : "—") },
        { key: "status", label: "Status", render: (e) => <StatusBadge status={e.status === "PUBLISHED" ? "approved" : e.status === "DRAFT" ? "draft" : "scheduled"} label={e.status_display} /> }]}
      empty="No exams yet." />
  );
}
