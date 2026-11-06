import { useState } from "react";
import CrudScreen from "../../../components/common/crud_screen";
import ConfirmModal from "../../../components/common/confirm_modal";
import StatusBadge from "../../../components/common/status_badge";
import { FieldGrid } from "../../../components/common/crud_screen";
import { meetings } from "../../../services/notices_service";
import { useSchool } from "../../../context/school_context";
import { formatDate } from "../../../utils/format_date";
import { apiErrors } from "../../../utils/validation";

/** W33c – PTM slots: teachers open slots, parents book in the Parent app. POST bulk/ makes many slots. */
export default function MeetingSlots() {
  const { teacherOptions, notify } = useSchool();
  const [bulk, setBulk] = useState(null);
  const [errors, setErrors] = useState({});
  const [k, setK] = useState(0);
  const makeBulk = async () => {
    try {
      const r = await meetings.action(null, "bulk", bulk);
      notify(`${r.created} slots created`);
      setBulk(null);
      setK((x) => x + 1);
    } catch (e) {
      setErrors(apiErrors(e));
    }
  };
  return (
    <>
      <CrudScreen code="W33c" title="PTM slots" service={meetings} reloadKey={k} search={false} createLabel="+ One slot"
        headerActions={<button className="btn btn-ghost" onClick={() => { setErrors({}); setBulk({ minutes: 15 }); }}>+ Many slots</button>}
        filters={[{ key: "teacher", label: "Teacher", options: teacherOptions }, { key: "status", label: "Status", options: [{ value: "OPEN", label: "Open" }, { value: "BOOKED", label: "Booked" }, { value: "DONE", label: "Done" }, { value: "CANCELLED", label: "Cancelled" }] }]}
        fields={[{ name: "teacher", label: "Teacher", type: "select", options: teacherOptions, required: true }, { name: "date", label: "Date", type: "date", required: true },
          { name: "start_time", label: "From", type: "time", required: true }, { name: "end_time", label: "To", type: "time", required: true },
          { name: "meeting_link", label: "Online link (optional)", span: true }, { name: "notes", label: "Notes after the meeting", type: "textarea" }]}
        toForm={(r) => ({ ...r, start_time: r.start_time?.slice(0, 5), end_time: r.end_time?.slice(0, 5) })}
        columns={[{ key: "teacher_name", label: "Teacher" }, { key: "date", label: "Date", render: (r) => formatDate(r.date) },
          { key: "time", label: "Time", render: (r) => `${r.start_time.slice(0, 5)}–${r.end_time.slice(0, 5)}` },
          { key: "parent_name", label: "Booked by", render: (r) => (r.parent_name ? `${r.parent_name} (${r.student_name})` : "—") },
          { key: "agenda", label: "Agenda" }, { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status === "OPEN" ? "pending" : r.status.toLowerCase()} label={r.status} /> }]}
        rowActions={(r, reload) => r.status === "BOOKED" && <button className="btn btn-ghost btn-sm" onClick={() => meetings.action(r.id, "done", {}).then(reload)}>Done</button>}
        empty="No slots yet." />
      <ConfirmModal open={!!bulk} title="Create many slots" confirmText="Create" onConfirm={makeBulk} onCancel={() => setBulk(null)}>
        {errors._ && <div className="alert alert-error">{errors._}</div>}
        {bulk && <FieldGrid values={bulk} errors={errors} set={(a, b) => setBulk((x) => ({ ...x, [a]: b }))} fields={[
          { name: "teacher", label: "Teacher", type: "select", options: teacherOptions, required: true }, { name: "date", label: "Date", type: "date", required: true },
          { name: "start_time", label: "From", type: "time", required: true }, { name: "end_time", label: "To", type: "time", required: true },
          { name: "minutes", label: "Minutes each", type: "number" }]} />}
      </ConfirmModal>
    </>
  );
}
