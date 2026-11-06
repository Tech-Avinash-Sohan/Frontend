import CrudScreen from "../../../components/common/crud_screen";
import { periods } from "../../../services/timetable_service";

/** W51 – bell schedule (/timetable/periods/). */
export default function Periods() {
  return (
    <CrudScreen code="W51" title="Bell periods" service={periods} search={false} createLabel="+ Add period"
      fields={[{ name: "name", label: "Name", required: true, hint: "Period 1, Lunch …" }, { name: "order", label: "Order", type: "number", required: true },
        { name: "start_time", label: "Start", type: "time", required: true }, { name: "end_time", label: "End", type: "time", required: true }, { name: "is_break", label: "Break (no subject)", type: "checkbox" }]}
      toForm={(r) => ({ ...r, start_time: r.start_time.slice(0, 5), end_time: r.end_time.slice(0, 5) })}
      columns={[{ key: "order", label: "#" }, { key: "name", label: "Period", render: (r) => <strong>{r.name}</strong> },
        { key: "t", label: "Time", render: (r) => `${r.start_time.slice(0, 5)} – ${r.end_time.slice(0, 5)}` }, { key: "is_break", label: "Break", render: (r) => (r.is_break ? "Yes" : "") }]}
      empty="No periods yet." />
  );
}
