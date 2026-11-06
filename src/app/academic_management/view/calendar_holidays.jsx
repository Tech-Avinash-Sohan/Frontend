import CrudScreen from "../../../components/common/crud_screen";
import StatusBadge from "../../../components/common/status_badge";
import { calendar, EVENT_TYPES } from "../../../services/academics_service";
import { useSchool } from "../../../context/school_context";
import { formatDate } from "../../../utils/format_date";

/** W29 – school calendar (/academics/calendar/): holidays are skipped by attendance; parents see visible ones. */
export default function CalendarHolidays() {
  const { classOptions } = useSchool();
  return (
    <CrudScreen code="W29" title="Calendar & holidays" service={calendar} createLabel="+ Add date" defaults={{ event_type: "HOLIDAY", is_holiday: true, visible_to_parents: true, classes: [] }}
      filters={[{ key: "event_type", label: "Type", options: EVENT_TYPES }]}
      fields={[{ name: "title", label: "Title", required: true, span: true }, { name: "event_type", label: "Type", type: "select", options: EVENT_TYPES, placeholder: null },
        { name: "start_date", label: "From", type: "date", required: true }, { name: "end_date", label: "To (empty = one day)", type: "date" },
        { name: "is_holiday", label: "School closed (no attendance)", type: "checkbox" }, { name: "visible_to_parents", label: "Show in Parent app", type: "checkbox" },
        { name: "classes", label: "Only for classes (empty = whole school)", type: "multiselect", options: classOptions }, { name: "description", label: "Details", type: "textarea" }]}
      columns={[{ key: "title", label: "Title", render: (r) => <strong>{r.title}</strong> }, { key: "event_type_display", label: "Type", render: (r) => <StatusBadge status={r.event_type.toLowerCase()} label={r.event_type_display} /> },
        { key: "dates", label: "Dates", render: (r) => (r.end_date && r.end_date !== r.start_date ? `${formatDate(r.start_date)} – ${formatDate(r.end_date)}` : formatDate(r.start_date)) },
        { key: "is_holiday", label: "Closed", render: (r) => (r.is_holiday ? "Yes" : "No") }]}
      empty="No dates yet." />
  );
}
