import CrudScreen from "../../../components/common/crud_screen";
import { diary } from "../../../services/learning_service";
import { useSchool } from "../../../context/school_context";
import { formatDate, todayISO } from "../../../utils/format_date";

/** W46 – class diary: daily note per section shown to parents (/learning/diary/). */
export default function ClassDiary() {
  const { divisionOptions, subjectOptions } = useSchool();
  return (
    <CrudScreen code="W46" title="Class diary" service={diary} search={false} createLabel="+ Write diary" defaults={{ date: todayISO(), visible_to_parents: true }}
      filters={[{ key: "section", label: "Section", options: divisionOptions }, { key: "date", label: "Date", type: "date" }]}
      fields={[{ name: "section", label: "Section", type: "select", options: divisionOptions, required: true }, { name: "subject", label: "Subject (optional)", type: "select", options: subjectOptions },
        { name: "date", label: "Date", type: "date", required: true }, { name: "note", label: "Note", type: "textarea", required: true }, { name: "visible_to_parents", label: "Parents can see it", type: "checkbox" }]}
      columns={[{ key: "date", label: "Date", render: (r) => formatDate(r.date) }, { key: "section_name", label: "Section" }, { key: "subject_name", label: "Subject", render: (r) => r.subject_name || "—" },
        { key: "note", label: "Note", render: (r) => <span style={{ whiteSpace: "pre-wrap" }}>{r.note}</span> }, { key: "written_by_name", label: "By" }]}
      empty="No diary entries." />
  );
}
