import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import StatusBadge from "../../../components/common/status_badge";
import { studentsService } from "../../../services/students_service";
import { useSchool } from "../../../context/school_context";
import { PATHS } from "../../../lib/route_paths";
import { apiErrors, isEmail, isPhone } from "../../../utils/validation";

/** W09 – check every row, then admit them one by one (POST /students/admission/ per row). */
export default function ImportReview() {
  const { state } = useLocation();
  const { classes, sections, reload } = useSchool();
  const [result, setResult] = useState({});
  const [busy, setBusy] = useState(false);
  const checked = useMemo(() => (state?.rows || []).map((r) => {
    const errs = [];
    const klass = classes.find((c) => c.name.toLowerCase() === (r.class || "").toLowerCase());
    const sec = klass && r.section ? sections.find((s) => s.school_class === klass.id && s.name.toLowerCase() === r.section.toLowerCase()) : null;
    if (!r.first_name || !r.last_name) errs.push("name missing");
    if (!["MALE", "FEMALE", "OTHER"].includes((r.gender || "").toUpperCase())) errs.push("gender");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date_of_birth || "")) errs.push("date_of_birth");
    if (!klass) errs.push(`class "${r.class}" not found`);
    if (r.section && !sec) errs.push(`section "${r.section}" not found`);
    if (!r.parent_first_name) errs.push("parent_first_name");
    if (!isPhone(r.parent_mobile)) errs.push("parent_mobile");
    if (!isEmail(r.parent_email)) errs.push("parent_email");
    const body = { first_name: r.first_name, middle_name: r.middle_name || "", last_name: r.last_name, gender: (r.gender || "").toUpperCase(), date_of_birth: r.date_of_birth,
      school_class: klass?.id, section: sec?.id || null, father_name: r.father_name || "", mother_name: r.mother_name || "", parent_first_name: r.parent_first_name,
      parent_last_name: r.parent_last_name || "", parent_mobile: r.parent_mobile, parent_email: r.parent_email || "", parent_relation: (r.parent_relation || "FATHER").toUpperCase(),
      address: r.address || "", previous_school: r.previous_school || "", ...(r.admission_date ? { admission_date: r.admission_date } : {}) };
    return { ...r, id: r._row, errs, body };
  }), [state, classes, sections]);
  if (!state) return <div className="card"><p>No file. <Link to={PATHS.importUpload}>Upload a CSV</Link></p></div>;
  const ok = checked.filter((r) => !r.errs.length && !result[r.id]?.done);
  const run = async () => {
    setBusy(true);
    for (const r of ok) {
      try {
        const s = await studentsService.admit(r.body);
        setResult((x) => ({ ...x, [r.id]: { done: true, text: s.admission_no } }));
      } catch (e) {
        const er = apiErrors(e);
        setResult((x) => ({ ...x, [r.id]: { error: Object.entries(er).map(([k, v]) => (k === "_" ? v : `${k}: ${v}`)).join("; ") } }));
      }
    }
    setBusy(false);
    reload();
  };
  const done = Object.values(result).filter((x) => x.done).length;
  return (
    <>
      <PageHeader code="W09" title={`Review ${state.file}`} subtitle={`${checked.length} rows · ${checked.filter((r) => !r.errs.length).length} ready · ${done} admitted`} back={{ to: PATHS.importUpload, label: "Upload" }}
        actions={<button className="btn btn-primary" disabled={busy || !ok.length} onClick={run}>{busy ? "Admitting…" : `Admit ${ok.length} students`}</button>} />
      <DataTable rows={checked} columns={[
        { key: "_row", label: "Row" }, { key: "name", label: "Student", render: (r) => `${r.first_name} ${r.last_name}` },
        { key: "cls", label: "Class", render: (r) => `${r.class}${r.section ? `-${r.section}` : ""}` }, { key: "parent_mobile", label: "Parent mobile" },
        { key: "st", label: "Result", render: (r) => result[r.id]?.done ? <StatusBadge status="approved" label={`Admitted ${result[r.id].text}`} />
          : result[r.id]?.error ? <span className="danger-text small">{result[r.id].error}</span>
          : r.errs.length ? <span className="danger-text small">{r.errs.join(", ")}</span> : <StatusBadge status="pending" label="Ready" /> }]} />
    </>
  );
}
