import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CrudScreen from "../../../components/common/crud_screen";
import StatusBadge from "../../../components/common/status_badge";
import { admissionsService, enquiries, ENQUIRY_STATUS, SOURCES } from "../../../services/admissions_service";
import { useSchool } from "../../../context/school_context";
import { PATHS } from "../../../lib/route_paths";
import { formatDate } from "../../../utils/format_date";
import { GENDERS } from "../../student_management/view/new_admission";

/** W62 – admission enquiries (/admissions/enquiries/) with the funnel. Open one to follow up / admit. */
export default function EnquiryList() {
  const { classOptions, staffOptions, currentYear } = useSchool();
  const navigate = useNavigate();
  const [pipe, setPipe] = useState(null);
  const [k, setK] = useState(0);
  useEffect(() => { admissionsService.pipeline().then(setPipe); }, [k]);
  return (
    <>
      {pipe && <div className="pipeline">{ENQUIRY_STATUS.map((s) => <div key={s.value} className="stat-card"><span className="stat-label">{s.label}</span><strong className="stat-value">{pipe.by_status[s.value]}</strong></div>)}
        <div className="stat-card"><span className="stat-label">Conversion</span><strong className="stat-value">{pipe.conversion_percent}%</strong></div></div>}
      <CrudScreen code="W62" title="Admission enquiries" service={enquiries} createLabel="+ New enquiry" reloadKey={k} onSaved={() => setK((x) => x + 1)}
        defaults={{ source: "WALK_IN", academic_year: currentYear?.id }} onRowClick={(e) => navigate(PATHS.enquiryDetail(e.id))} canDelete={false}
        filters={[{ key: "status", label: "Status", options: ENQUIRY_STATUS }, { key: "class_sought", label: "Class", options: classOptions }, { key: "source", label: "Source", options: SOURCES }]}
        fields={[{ name: "student_first_name", label: "Child first name", required: true }, { name: "student_last_name", label: "Child last name" },
          { name: "class_sought", label: "Class wanted", type: "select", options: classOptions, required: true }, { name: "gender", label: "Gender", type: "select", options: GENDERS },
          { name: "date_of_birth", label: "Date of birth", type: "date" }, { name: "previous_school", label: "Previous school" },
          { name: "parent_name", label: "Parent name", required: true }, { name: "mobile", label: "Mobile", required: true }, { name: "email", label: "E-mail", type: "email" },
          { name: "source", label: "Source", type: "select", options: SOURCES, placeholder: null }, { name: "assigned_to", label: "Follow-up by", type: "select", options: staffOptions },
          { name: "next_follow_up", label: "Next follow-up", type: "date" }, { name: "notes", label: "Notes", type: "textarea" }]}
        columns={[{ key: "n", label: "Child", render: (e) => <span><strong>{e.student_first_name} {e.student_last_name}</strong><br /><small className="muted">{e.class_name}</small></span> },
          { key: "parent_name", label: "Parent", render: (e) => `${e.parent_name} · ${e.mobile}` }, { key: "source", label: "Source" },
          { key: "next_follow_up", label: "Follow-up", render: (e) => formatDate(e.next_follow_up) },
          { key: "status", label: "Status", render: (e) => <StatusBadge status={e.status === "CONVERTED" ? "approved" : e.status === "LOST" ? "rejected" : "pending"} label={e.status_display} /> }]}
        empty="No enquiries yet." />
    </>
  );
}
