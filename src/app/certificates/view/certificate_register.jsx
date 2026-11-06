import { useState } from "react";
import CrudScreen from "../../../components/common/crud_screen";
import ConfirmModal from "../../../components/common/confirm_modal";
import { FieldGrid } from "../../../components/common/crud_screen";
import { useStudentOptions } from "../../attendance/view/student_leaves";
import { CERT_TYPES, certificatesService, issued } from "../../../services/certificates_service";
import { useSchool } from "../../../context/school_context";
import { formatDate } from "../../../utils/format_date";
import { apiErrors } from "../../../utils/validation";

/** W64 – certificate register (/certificates/issued/): issue now, print, duplicate, cancel. LC marks the student LEFT. */
export default function CertificateRegister() {
  const { notify } = useSchool();
  const students = useStudentOptions();
  const [form, setForm] = useState(null);
  const [view, setView] = useState(null);
  const [errors, setErrors] = useState({});
  const [k, setK] = useState(0);
  const issue = async () => {
    try {
      const { leaving_date, leaving_reason, conduct, ...rest } = form;
      const c = await certificatesService.issue({ ...rest, student: Number(rest.student), extra: { leaving_date, leaving_reason, conduct } });
      notify(`Issued ${c.serial_no}`);
      setForm(null);
      setView(c);
      setK((x) => x + 1);
    } catch (e) {
      setErrors(apiErrors(e));
    }
  };
  return (
    <>
      <CrudScreen code="W64" title="Certificates" service={issued} reloadKey={k} canCreate={false} canEdit={false} canDelete={false}
        headerActions={<button className="btn btn-primary" onClick={() => { setErrors({}); setForm({ certificate_type: "BONAFIDE", conduct: "Good" }); }}>+ Issue certificate</button>}
        filters={[{ key: "certificate_type", label: "Type", options: CERT_TYPES }]} onRowClick={setView}
        columns={[{ key: "serial_no", label: "Serial", render: (c) => <strong>{c.serial_no}</strong> }, { key: "type_display", label: "Type" },
          { key: "student_name", label: "Student", render: (c) => `${c.student_name} (${c.admission_no})` }, { key: "issue_date", label: "Issued", render: (c) => formatDate(c.issue_date) },
          { key: "st", label: "", render: (c) => (c.is_cancelled ? <span className="danger-text">Cancelled</span> : c.is_duplicate ? "Duplicate" : "") }]}
        rowActions={(c, reload) => (<>
          <button className="btn btn-ghost btn-sm" onClick={() => certificatesService.print(c.id)}>Print</button>
          {!c.is_cancelled && <button className="btn btn-ghost btn-sm" onClick={() => certificatesService.duplicate(c.id).then(() => { notify("Duplicate issued"); reload(); })}>Duplicate</button>}
          {!c.is_cancelled && <button className="btn btn-ghost btn-sm danger" onClick={() => certificatesService.cancel(c.id).then(() => { notify("Cancelled"); reload(); })}>Cancel</button>}</>)}
        empty="No certificates issued." />
      <ConfirmModal open={!!form} title="Issue a certificate" confirmText="Issue" onConfirm={issue} onCancel={() => setForm(null)}>
        {errors._ && <div className="alert alert-error">{errors._}</div>}
        {form && <FieldGrid values={form} errors={errors} set={(a, b) => setForm((x) => ({ ...x, [a]: b }))} fields={[
          { name: "student", label: "Student", type: "select", options: students, required: true, span: true },
          { name: "certificate_type", label: "Type", type: "select", options: CERT_TYPES, placeholder: null }, { name: "purpose", label: "Purpose (passport, bank …)" },
          { name: "leaving_date", label: "Leaving date", type: "date", hidden: (v) => v.certificate_type !== "LEAVING" },
          { name: "leaving_reason", label: "Reason for leaving", hidden: (v) => v.certificate_type !== "LEAVING" },
          { name: "conduct", label: "Conduct", hidden: (v) => !["LEAVING", "CHARACTER"].includes(v.certificate_type) }]} />}
      </ConfirmModal>
      <ConfirmModal open={!!view} wide title={view ? `${view.title} · ${view.serial_no}` : ""} confirmText="Print" onConfirm={() => certificatesService.print(view.id)} onCancel={() => setView(null)}>
        {view && <><div className="cert-content">{view.content}</div><p className="muted small">Verify code: {view.verify_token}</p></>}
      </ConfirmModal>
    </>
  );
}
