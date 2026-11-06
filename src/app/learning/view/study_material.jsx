import CrudScreen from "../../../components/common/crud_screen";
import { MATERIAL_TYPES, materials } from "../../../services/learning_service";
import { useSchool } from "../../../context/school_context";
import { formatDate } from "../../../utils/format_date";

/** W48 – study material per class (/learning/materials/). Parents see it in the Parent app. */
export default function StudyMaterial() {
  const { classOptions, subjectOptions } = useSchool();
  return (
    <CrudScreen code="W48" title="Study material" service={materials} createLabel="+ Add material" defaults={{ material_type: "PDF" }}
      filters={[{ key: "school_class", label: "Class", options: classOptions }, { key: "subject", label: "Subject", options: subjectOptions }, { key: "material_type", label: "Type", options: MATERIAL_TYPES }]}
      fields={[{ name: "title", label: "Title", required: true, span: true }, { name: "school_class", label: "Class", type: "select", options: classOptions, required: true },
        { name: "subject", label: "Subject", type: "select", options: subjectOptions }, { name: "material_type", label: "Type", type: "select", options: MATERIAL_TYPES, placeholder: null },
        { name: "url", label: "Link (Drive / YouTube / file URL)", required: true, span: true }, { name: "description", label: "Description", type: "textarea" }]}
      columns={[{ key: "title", label: "Title", render: (r) => <a href={r.url} target="_blank" rel="noreferrer"><strong>{r.title}</strong></a> }, { key: "class_name", label: "Class" },
        { key: "subject_name", label: "Subject", render: (r) => r.subject_name || "—" }, { key: "material_type", label: "Type" }, { key: "created_at", label: "Added", render: (r) => formatDate(r.created_at) }]}
      empty="No material yet." />
  );
}
