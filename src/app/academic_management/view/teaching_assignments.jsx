import CrudScreen from "../../../components/common/crud_screen";
import { assignments } from "../../../services/academics_service";
import { useSchool } from "../../../context/school_context";

/** W30b – who teaches which subject in which section (/academics/teaching-assignments/). Used by timetable, chat, teacher app. */
export default function TeachingAssignments() {
  const { divisionOptions, subjectOptions, teacherOptions } = useSchool();
  return (
    <CrudScreen code="W30b" title="Who teaches what" subtitle="One teacher per subject per section." service={assignments} search={false} createLabel="+ Assign"
      filters={[{ key: "section", label: "Section", options: divisionOptions }, { key: "teacher", label: "Teacher", options: teacherOptions }]}
      fields={[{ name: "section", label: "Section", type: "select", options: divisionOptions, required: true }, { name: "subject", label: "Subject", type: "select", options: subjectOptions, required: true },
        { name: "teacher", label: "Teacher", type: "select", options: teacherOptions, required: true }, { name: "periods_per_week", label: "Periods / week", type: "number" }]}
      columns={[{ key: "section_name", label: "Section", render: (r) => <strong>{r.section_name}</strong> }, { key: "subject_name", label: "Subject" }, { key: "teacher_name", label: "Teacher" },
        { key: "periods_per_week", label: "Periods / week", align: "right" }]}
      empty="Nothing assigned yet." />
  );
}
