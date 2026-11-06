import { useState } from "react";
import CrudScreen from "../../../components/common/crud_screen";
import ConfirmModal from "../../../components/common/confirm_modal";
import StatusBadge from "../../../components/common/status_badge";
import { STAFF_TYPES, staffService } from "../../../services/staff_service";
import { crud } from "../../../lib/crud";
import { useSchool } from "../../../context/school_context";

const staff = crud("/staff/");

/** W25 – teacher / staff logins: who can use the Teacher app, resend login, switch off / on. */
export default function RoleAssignments() {
  const { notify, reload: reloadSchool } = useSchool();
  const [login, setLogin] = useState(null);
  const toggle = (r, reload) => (r.is_active ? staffService.deactivate(r.id) : staffService.activate(r.id)).then(() => { notify(r.is_active ? "Login switched off" : "Login switched on"); reload(); reloadSchool(); });
  return (
    <>
      <CrudScreen code="W25" title="Logins & access" subtitle="Teachers & staff sign in to the Teacher app with their mobile. Switching off logs them out everywhere."
        service={staff} canCreate={false} canEdit={false} canDelete={false}
        filters={[{ key: "staff_type", label: "Type", options: STAFF_TYPES }, { key: "is_active", label: "Login", options: [{ value: "true", label: "On" }, { value: "false", label: "Off" }] }]}
        columns={[{ key: "name", label: "Name", render: (r) => <strong>{r.name}</strong> }, { key: "mobile", label: "Login mobile" }, { key: "email", label: "E-mail" },
          { key: "staff_type", label: "Type", render: (r) => STAFF_TYPES.find((t) => t.value === r.staff_type)?.label },
          { key: "is_active", label: "Login", render: (r) => <StatusBadge status={r.is_active} label={r.is_active ? "On" : "Off"} /> }]}
        rowActions={(r, reload) => (<>
          <button className="btn btn-ghost btn-sm" onClick={() => staffService.resendLogin(r.id).then(setLogin)}>Resend login</button>
          <button className={`btn btn-ghost btn-sm ${r.is_active ? "danger" : ""}`} onClick={() => toggle(r, reload)}>{r.is_active ? "Switch off" : "Switch on"}</button></>)} />
      <ConfirmModal open={!!login} title="New login sent" message={login && `Mobile ${login.mobile} · password ${login.password} (also on WhatsApp + e-mail)`} confirmText="OK" onConfirm={() => setLogin(null)} onCancel={() => setLogin(null)} />
    </>
  );
}
