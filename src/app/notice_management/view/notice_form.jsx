import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import LoadingState from "../../../components/common/loading_state";
import { FieldGrid } from "../../../components/common/crud_screen";
import { AUDIENCES, CATEGORIES, noticesService } from "../../../services/notices_service";
import { useSchool } from "../../../context/school_context";
import { PATHS } from "../../../lib/route_paths";
import { apiErrors } from "../../../utils/validation";

/** W32 – write a notice (POST / PATCH /communication/notices/), then publish. */
export default function NoticeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { classOptions, divisionOptions, notify } = useSchool();
  const [v, setV] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (id === "new") setV({ title: "", body: "", category: "GENERAL", audience: "EVERYONE", classes: [], sections: [], send_whatsapp: false });
    else noticesService.get(id).then(setV);
  }, [id]);
  if (!v) return <LoadingState />;
  const save = async (publish) => {
    setBusy(true);
    setErrors({});
    try {
      const n = await noticesService.save({ ...v, expires_on: v.expires_on || null });
      if (publish) {
        const r = await noticesService.publish(n.id);
        notify(`Published${r.whatsapp_sent ? ` · WhatsApp to ${r.whatsapp_sent}` : ""}`);
      } else notify("Draft saved");
      navigate(PATHS.noticeDetail(n.id));
    } catch (e) {
      setErrors(apiErrors(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeader code="W32" title={id === "new" ? "New notice" : "Edit notice"} back={{ to: PATHS.notices, label: "Notices" }} />
      <section className="card form-card">
        {errors._ && <div className="alert alert-error">{errors._}</div>}
        <FieldGrid values={v} errors={errors} set={(k, x) => setV((o) => ({ ...o, [k]: x }))} fields={[
          { name: "title", label: "Title", required: true, span: true },
          { name: "body", label: "Message", type: "textarea", rows: 6, required: true },
          { name: "category", label: "Category", type: "select", options: CATEGORIES, placeholder: null },
          { name: "audience", label: "Who sees it", type: "select", options: AUDIENCES, placeholder: null },
          { name: "classes", label: "Classes", type: "multiselect", options: classOptions, hidden: (x) => x.audience !== "CLASSES" },
          { name: "sections", label: "Sections", type: "multiselect", options: divisionOptions, hidden: (x) => x.audience !== "SECTIONS" },
          { name: "attachment_url", label: "Attachment URL (PDF / image)", span: true },
          { name: "expires_on", label: "Hide after", type: "date" },
          { name: "is_pinned", label: "Pin on top", type: "checkbox" },
          { name: "send_whatsapp", label: "Also send on WhatsApp", type: "checkbox" }]} />
        <div className="form-actions">
          <button className="btn btn-ghost" disabled={busy} onClick={() => save(false)}>Save draft</button>
          {v.status !== "PUBLISHED" && <button className="btn btn-primary" disabled={busy} onClick={() => save(true)}>Publish now</button>}
        </div>
      </section>
    </>
  );
}
