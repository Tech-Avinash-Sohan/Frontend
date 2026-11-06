import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import LoadingState from "../../../components/common/loading_state";
import StatusBadge from "../../../components/common/status_badge";
import ConfirmModal from "../../../components/common/confirm_modal";
import { staffService } from "../../../services/staff_service";
import { academicsService } from "../../../services/academics_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { PATHS } from "../../../lib/route_paths";
import { formatDate } from "../../../utils/format_date";
import { typeLabel } from "./staff_directory";

/** W24 – GET /staff/{id}/ · resend login · deactivate (DELETE) / activate. */
export default function StaffProfile() {
  const { id } = useParams();
  const { notify, divisions } = useSchool();
  const [s, setS] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [modal, setModal] = useState(null); // "toggle" | "resend"
  const [login, setLogin] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => staffService.get(id).then(setS);
  useEffect(() => {
    load();
    academicsService.subjects().then((d) => setSubjects(rows(d)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const confirm = async () => {
    setBusy(true);
    try {
      if (modal === "resend") {
        setLogin(await staffService.resendLogin(id));
        notify("New password sent on WhatsApp and e-mail");
      } else if (s.is_active) {
        await staffService.deactivate(id);
        notify("Deactivated – the Teacher app stops working");
      } else {
        await staffService.activate(id);
        notify("Activated again");
      }
      setModal(null);
      load();
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  if (!s) return <LoadingState />;
  const classTeacherOf = divisions.filter((d) => d.class_teacher === s.id).map((d) => d.label);

  return (
    <>
      <PageHeader
        code="W24"
        title={s.name}
        subtitle={`${typeLabel(s.staff_type)}${s.designation ? ` · ${s.designation}` : ""}`}
        back={{ to: PATHS.staff, label: "Teachers & staff" }}
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setModal("resend")}>Resend login</button>
            <Link className="btn btn-ghost" to={PATHS.staffForm(id)}>Edit</Link>
            <button className={`btn ${s.is_active ? "btn-danger-ghost" : "btn-primary"}`} onClick={() => setModal("toggle")}>{s.is_active ? "Deactivate" : "Activate"}</button>
          </>
        }
      />
      {login && <div className="alert alert-success">New login sent – mobile <strong>{login.mobile}</strong>, password <strong>{login.password}</strong></div>}
      <div className="grid-2">
        <section className="card">
          <div className="card-head"><h3>Login</h3><StatusBadge status={s.is_active} /></div>
          <div className="details">
            <div className="details-row"><span>Mobile</span><strong>{s.mobile}</strong></div>
            <div className="details-row"><span>E-mail</span><strong>{s.email || "—"}</strong></div>
            <div className="details-row"><span>App</span><strong>Teacher app – free</strong></div>
          </div>
        </section>
        <section className="card">
          <div className="card-head"><h3>Job</h3></div>
          <div className="details">
            <div className="details-row"><span>Employee code</span><strong>{s.employee_code || "—"}</strong></div>
            <div className="details-row"><span>Employment</span><strong>{s.employment_type.replace("_", " ").toLowerCase()}</strong></div>
            <div className="details-row"><span>Qualification</span><strong>{s.qualification || "—"}</strong></div>
            <div className="details-row"><span>Experience</span><strong>{s.experience_years} years</strong></div>
            <div className="details-row"><span>Joined</span><strong>{s.joining_date ? formatDate(s.joining_date) : "—"}</strong></div>
            <div className="details-row"><span>Subjects</span><strong>{subjects.filter((x) => s.subjects.includes(x.id)).map((x) => x.name).join(", ") || "—"}</strong></div>
            <div className="details-row"><span>Class teacher of</span><strong>{classTeacherOf.join(", ") || "—"}</strong></div>
          </div>
        </section>
      </div>
      <ConfirmModal
        open={!!modal}
        title={modal === "resend" ? "Send a new password?" : s.is_active ? "Deactivate this person?" : "Activate again?"}
        message={modal === "resend" ? `A new password goes to ${s.mobile}. The old one stops working.` : s.is_active ? "They are signed out and cannot use the Teacher app. Nothing is deleted." : "They can log in again with their password."}
        confirmText={modal === "resend" ? "Send" : s.is_active ? "Deactivate" : "Activate"}
        danger={modal === "toggle" && s.is_active}
        busy={busy}
        onConfirm={confirm}
        onCancel={() => setModal(null)}
      />
    </>
  );
}
