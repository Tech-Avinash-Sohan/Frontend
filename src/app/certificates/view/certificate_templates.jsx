import { useState } from "react";
import CrudScreen from "../../../components/common/crud_screen";
import { CERT_TYPES, certificatesService, templates } from "../../../services/certificates_service";
import { useSchool } from "../../../context/school_context";

/** W66 – certificate texts with {placeholders} and serial numbering (/certificates/templates/). */
export default function CertificateTemplates() {
  const { notify } = useSchool();
  const [k, setK] = useState(0);
  return (
    <CrudScreen code="W66" title="Certificate templates" service={templates} reloadKey={k} search={false} createLabel="+ Add template" modalWide
      subtitle="Placeholders: {student_name} {father_name} {mother_name} {class} {section} {admission_no} {gr_no} {date_of_birth} {date_of_birth_words} {admission_date} {academic_year} {school_name} {purpose} {conduct} {leaving_date} {leaving_reason} {serial_no} {issue_date}"
      headerActions={<button className="btn btn-ghost" onClick={() => certificatesService.loadDefaults().then(() => { notify("Default templates ready"); setK((x) => x + 1); })}>Load defaults</button>}
      fields={[{ name: "certificate_type", label: "Type", type: "select", options: CERT_TYPES, required: true }, { name: "title", label: "Title", required: true },
        { name: "serial_prefix", label: "Serial prefix" }, { name: "next_serial", label: "Next serial", type: "number" }, { name: "body", label: "Text", type: "textarea", rows: 10, required: true }]}
      columns={[{ key: "title", label: "Title", render: (r) => <strong>{r.title}</strong> }, { key: "certificate_type", label: "Type" },
        { key: "serial", label: "Next serial", render: (r) => `${r.serial_prefix}${String(r.next_serial).padStart(5, "0")}` }]}
      empty="Click 'Load defaults' to start." />
  );
}
