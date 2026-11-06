import CrudScreen from "../../../components/common/crud_screen";
import { LEAVE_TYPES } from "../../../services/attendance_service";
import { leavePolicies } from "../../../services/settings_service";

/** W43 – leave policy: days per year for each staff leave type (/attendance/leave-policies/). Teachers see the balance. */
export default function DataRetention() {
  return (
    <CrudScreen code="W43" title="Leave policy" subtitle="Leave days per year for teachers & staff. Used for the leave balance in the Teacher app."
      service={leavePolicies} search={false} createLabel="+ Add leave type" defaults={{ leave_type: "CL", days_per_year: 12 }}
      fields={[{ name: "leave_type", label: "Leave type", type: "select", options: LEAVE_TYPES, placeholder: null }, { name: "days_per_year", label: "Days per year", type: "number", step: "0.5" }]}
      columns={[{ key: "leave_type_display", label: "Leave type", render: (r) => <strong>{r.leave_type_display}</strong> }, { key: "days_per_year", label: "Days / year", align: "right" }]}
      empty="No leave policy yet – add CL, SL …" />
  );
}
