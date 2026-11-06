import CrudScreen from "../../../components/common/crud_screen";
import { useStudentOptions } from "../../attendance/view/student_leaves";
import { NOTE_CATEGORIES, notes } from "../../../services/discipline_service";
import { formatDate } from "../../../utils/format_date";

/** W67 – teacher notes on students (/discipline/notes/). "Visible to parent" shows it in the Parent app. */
export default function StudentNotes() {
  const students = useStudentOptions();
  return (
    <CrudScreen code="W67" title="Student notes" service={notes} search={false} createLabel="+ Add note" defaults={{ category: "GENERAL" }}
      filters={[{ key: "category", label: "Category", options: NOTE_CATEGORIES }, { key: "student", label: "Student", options: students }]}
      fields={[{ name: "student", label: "Student", type: "select", options: students, required: true, span: true }, { name: "category", label: "Category", type: "select", options: NOTE_CATEGORIES, placeholder: null },
        { name: "visible_to_parent", label: "Show to the parent", type: "checkbox" }, { name: "note", label: "Note", type: "textarea", required: true }]}
      columns={[{ key: "student_name", label: "Student", render: (r) => <strong>{r.student_name}</strong> }, { key: "category", label: "Category" }, { key: "note", label: "Note" },
        { key: "visible_to_parent", label: "Parent sees", render: (r) => (r.visible_to_parent ? "Yes" : "No") }, { key: "written_by_name", label: "By" },
        { key: "created_at", label: "Date", render: (r) => formatDate(r.created_at) }]} empty="No notes." />
  );
}
