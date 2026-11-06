import { useState } from "react";
import CrudScreen from "../../../components/common/crud_screen";
import ConfirmModal from "../../../components/common/confirm_modal";
import DataTable from "../../../components/common/data_table";
import { consentForms } from "../../../services/notices_service";
import { useSchool } from "../../../context/school_context";
import { formatDate } from "../../../utils/format_date";

/** W33e – permission slips for trips / events; parents answer YES / NO in the Parent app. */
export default function ConsentForms() {
  const { divisionOptions } = useSchool();
  const [resp, setResp] = useState(null);
  return (
    <>
      <CrudScreen code="W33e" title="Consent forms" service={consentForms} search={false} createLabel="+ New form"
        fields={[{ name: "title", label: "Title", required: true, span: true }, { name: "description", label: "Details", type: "textarea", required: true },
          { name: "sections", label: "Sections", type: "multiselect", options: divisionOptions, required: true },
          { name: "event_date", label: "Event date", type: "date" }, { name: "respond_by", label: "Answer by", type: "date" }, { name: "amount", label: "Cost per student ₹", type: "number" }]}
        columns={[{ key: "title", label: "Title", render: (r) => <strong>{r.title}</strong> }, { key: "event_date", label: "Event", render: (r) => formatDate(r.event_date) },
          { key: "respond_by", label: "Answer by", render: (r) => formatDate(r.respond_by) }, { key: "responses_yes", label: "Yes", align: "right" }, { key: "responses_no", label: "No", align: "right" }]}
        rowActions={(r) => <button className="btn btn-ghost btn-sm" onClick={() => consentForms.view(r.id, "responses").then(setResp)}>Answers</button>}
        empty="No consent forms." />
      <ConfirmModal open={!!resp} wide title={resp ? `${resp.form}: ${resp.yes} yes · ${resp.no} no · ${resp.pending} pending` : ""} confirmText="Close" onConfirm={() => setResp(null)} onCancel={() => setResp(null)}>
        {resp && <DataTable rows={resp.students} rowKey="student" columns={[{ key: "name", label: "Student" }, { key: "section", label: "Section" }, { key: "answer", label: "Answer", render: (r) => r.answer || "—" }, { key: "note", label: "Note" }]} />}
      </ConfirmModal>
    </>
  );
}
