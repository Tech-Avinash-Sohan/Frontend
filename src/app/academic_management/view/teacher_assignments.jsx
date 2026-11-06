import { useEffect, useState } from "react";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import ConfirmModal from "../../../components/common/confirm_modal";
import FormInput from "../../../components/forms/form_input";
import FormSelect from "../../../components/forms/form_select";
import { SUBJECT_TYPES, academicsService } from "../../../services/academics_service";
import { staffService } from "../../../services/staff_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { apiErrors } from "../../../utils/validation";

/** W30 – /academics/subjects/ (which classes study it) + the teachers who teach it (staff.subjects). */
export default function TeacherAssignments() {
  const { notify, classes } = useSchool();
  const [list, setList] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [remove, setRemove] = useState(null);
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const load = () => {
    setLoading(true);
    Promise.all([academicsService.subjects(), staffService.list({ staff_type: "TEACHER", page_size: 200 })])
      .then(([s, t]) => {
        setList(rows(s));
        setTeachers(rows(t));
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleClass = (id) => setForm((f) => ({ ...f, classes: f.classes.includes(id) ? f.classes.filter((x) => x !== id) : [...f.classes, id] }));
  const save = async () => {
    try {
      await academicsService.saveSubject(form);
      notify("Subject saved");
      setForm(null);
      load();
    } catch (err) {
      setErrors(apiErrors(err));
    }
  };
  const del = async () => {
    try {
      await academicsService.deleteSubject(remove.id);
      notify("Subject deleted");
      load();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setRemove(null);
    }
  };
  const className = (id) => classes.find((c) => c.id === id)?.name || id;

  return (
    <>
      <PageHeader code="W30" title="Subjects & teachers" subtitle="Give a teacher their subjects in Teachers & staff → Edit." actions={<button className="btn btn-primary" onClick={() => { setErrors({}); setForm({ name: "", code: "", subject_type: "CORE", classes: [] }); }}>+ Add subject</button>} />
      <DataTable
        loading={loading}
        rows={list}
        empty="No subjects yet."
        columns={[
          { key: "name", label: "Subject", render: (s) => <span><strong>{s.name}</strong>{s.code && <small className="muted"> · {s.code}</small>}</span> },
          { key: "subject_type", label: "Type" },
          { key: "classes", label: "Classes", render: (s) => (s.classes.length ? s.classes.map(className).join(", ") : <span className="muted">none</span>) },
          { key: "teachers", label: "Teachers", render: (s) => teachers.filter((t) => t.subjects.includes(s.id)).map((t) => t.name).join(", ") || <span className="muted">none</span> },
          { key: "actions", label: "", align: "right", render: (s) => (
            <span className="row-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => { setErrors({}); setForm({ ...s }); }}>Edit</button>
              <button className="btn btn-danger-ghost btn-sm" onClick={() => setRemove(s)}>Delete</button>
            </span>
          ) },
        ]}
      />
      <ConfirmModal open={!!form} title={form?.id ? "Edit subject" : "Add subject"} confirmText="Save" onConfirm={save} onCancel={() => setForm(null)} wide>
        {form && (
          <div className="form-grid">
            {errors._ && <div className="alert alert-error span-2">{errors._}</div>}
            <FormInput label="Name" name="name" value={form.name} onChange={set} error={errors.name} placeholder="Mathematics" required />
            <FormInput label="Code" name="code" value={form.code || ""} onChange={set} placeholder="MATH" />
            <FormSelect label="Type" name="subject_type" value={form.subject_type} onChange={set} options={SUBJECT_TYPES} placeholder={null} />
            <div className="field span-2">
              <label>Taught in classes</label>
              <div className="chip-row">
                {classes.map((c) => (
                  <button type="button" key={c.id} className={`chip chip-toggle ${form.classes.includes(c.id) ? "on" : ""}`} aria-pressed={form.classes.includes(c.id)} onClick={() => toggleClass(c.id)}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </ConfirmModal>
      <ConfirmModal open={!!remove} title="Delete this subject?" message={remove?.name} confirmText="Delete" danger onConfirm={del} onCancel={() => setRemove(null)} />
    </>
  );
}
