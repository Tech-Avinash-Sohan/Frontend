import { useState } from "react";
import CrudScreen from "../../../components/common/crud_screen";
import { examsService, gradeBands } from "../../../services/exams_service";
import { useSchool } from "../../../context/school_context";

/** W57 – grading scale (/exams/grade-bands/). "Load CBSE scale" fills A1…E. */
export default function GradeBands() {
  const { notify } = useSchool();
  const [k, setK] = useState(0);
  const loadDefault = () => examsService.loadDefaultGrades().then(() => { notify("CBSE scale loaded"); setK((x) => x + 1); }).catch((e) => notify(e.message, "error"));
  return (
    <CrudScreen code="W57" title="Grades" service={gradeBands} reloadKey={k} search={false} createLabel="+ Add grade"
      headerActions={<button className="btn btn-ghost" onClick={loadDefault}>Load CBSE scale</button>}
      fields={[{ name: "name", label: "Grade", required: true }, { name: "min_percent", label: "From %", type: "number", required: true }, { name: "max_percent", label: "To %", type: "number", required: true },
        { name: "grade_point", label: "Grade point", type: "number" }, { name: "remark", label: "Remark" }]}
      columns={[{ key: "name", label: "Grade", render: (r) => <strong>{r.name}</strong> }, { key: "r", label: "Range", render: (r) => `${Number(r.min_percent)} – ${Number(r.max_percent)}%` },
        { key: "grade_point", label: "Point", align: "right" }, { key: "remark", label: "Remark" }]} empty="No grades yet." />
  );
}
