import { useEffect, useState } from "react";
import CrudScreen from "../../../components/common/crud_screen";
import { slots, substitutions } from "../../../services/timetable_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { formatDate } from "../../../utils/format_date";

/** W52 – substitute teacher for one period on one date (/timetable/substitutions/). */
export default function Substitutions() {
  const { teacherOptions } = useSchool();
  const [slotOpts, setSlotOpts] = useState([]);
  useEffect(() => { slots.list({ page_size: 200 }).then((d) => setSlotOpts(rows(d).map((s) => ({ value: s.id, label: `${s.day_display} · ${s.period_name} · ${s.section_name} · ${s.subject_name} (${s.teacher_name || "-"})` })))); }, []);
  return (
    <CrudScreen code="W52" title="Substitutions" service={substitutions} search={false} createLabel="+ Substitute"
      filters={[{ key: "date", label: "Date", type: "date" }]}
      fields={[{ name: "date", label: "Date", type: "date", required: true }, { name: "slot", label: "Period", type: "select", options: slotOpts, required: true, span: true },
        { name: "substitute", label: "Substitute teacher", type: "select", options: teacherOptions, required: true }, { name: "reason", label: "Reason" }]}
      columns={[{ key: "date", label: "Date", render: (r) => formatDate(r.date) },
        { key: "slot", label: "Period", render: (r) => `${r.slot_detail.period_name} · ${r.slot_detail.section_name} · ${r.slot_detail.subject_name}` },
        { key: "orig", label: "Teacher", render: (r) => r.slot_detail.teacher_name }, { key: "substitute_name", label: "Substitute", render: (r) => <strong>{r.substitute_name}</strong> }, { key: "reason", label: "Reason" }]}
      empty="No substitutions." />
  );
}
