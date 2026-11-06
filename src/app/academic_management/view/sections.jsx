import { useEffect, useState } from "react";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import ConfirmModal from "../../../components/common/confirm_modal";
import FilterBar from "../../../components/common/filter_bar";
import FormInput from "../../../components/forms/form_input";
import FormSelect from "../../../components/forms/form_select";
import { academicsService } from "../../../services/academics_service";
import { staffService } from "../../../services/staff_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { apiErrors } from "../../../utils/validation";

/** W28 – /academics/sections/ with capacity and class teacher. */
export default function Sections() {
  const { notify, reload, classOptions } = useSchool();
  const [list, setList] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filter, setFilter] = useState({ school_class: "" });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [remove, setRemove] = useState(null);
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const load = () => {
    setLoading(true);
    academicsService.sections(filter).then((d) => setList(rows(d))).finally(() => setLoading(false));
  };
  useEffect(load, [filter]);
  useEffect(() => {
    staffService.list({ staff_type: "TEACHER", is_active: true, page_size: 200 }).then((d) => setTeachers(rows(d)));
  }, []);

  const save = async () => {
    try {
      await academicsService.saveSection({ ...form, capacity: Number(form.capacity || 40), class_teacher: form.class_teacher || null });
      notify("Section saved");
      setForm(null);
      load();
      reload();
    } catch (err) {
      setErrors(apiErrors(err));
    }
  };
  const del = async () => {
    try {
      await academicsService.deleteSection(remove.id);
      notify("Section deleted");
      load();
      reload();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setRemove(null);
    }
  };

  return (
    <>
      <PageHeader code="W28" title="Sections" subtitle="A, B, C … of each class, with capacity and class teacher." actions={<button className="btn btn-primary" onClick={() => { setErrors({}); setForm({ school_class: filter.school_class, name: "", capacity: 40, class_teacher: "" }); }}>+ Add section</button>} />
      <FilterBar values={filter} onChange={(k, v) => setFilter((f) => ({ ...f, [k]: v }))} filters={[{ key: "school_class", label: "Class", options: classOptions }]} />
      <DataTable
        loading={loading}
        rows={list}
        empty="No sections yet."
        columns={[
          { key: "class_name", label: "Class" },
          { key: "name", label: "Section", render: (s) => <strong>{s.class_name}-{s.name}</strong> },
          { key: "class_teacher_name", label: "Class teacher", render: (s) => s.class_teacher_name || <span className="muted">not set</span> },
          { key: "student_count", label: "Students", align: "right", render: (s) => `${s.student_count} / ${s.capacity}` },
          { key: "actions", label: "", align: "right", render: (s) => (
            <span className="row-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => { setErrors({}); setForm({ id: s.id, school_class: s.school_class, name: s.name, capacity: s.capacity, class_teacher: s.class_teacher || "" }); }}>Edit</button>
              <button className="btn btn-danger-ghost btn-sm" onClick={() => setRemove(s)}>Delete</button>
            </span>
          ) },
        ]}
      />
      <ConfirmModal open={!!form} title={form?.id ? "Edit section" : "Add section"} confirmText="Save" onConfirm={save} onCancel={() => setForm(null)}>
        {form && (
          <div className="form-grid">
            {errors._ && <div className="alert alert-error span-2">{errors._}</div>}
            <FormSelect label="Class" name="school_class" value={form.school_class} onChange={set} options={classOptions} error={errors.school_class} required />
            <FormInput label="Section" name="name" value={form.name} onChange={set} error={errors.name} placeholder="A" required />
            <FormInput label="Capacity" name="capacity" type="number" value={form.capacity} onChange={set} error={errors.capacity} />
            <FormSelect label="Class teacher" name="class_teacher" value={form.class_teacher} onChange={set} options={teachers.map((t) => ({ value: t.id, label: t.name }))} placeholder="Not set" />
          </div>
        )}
      </ConfirmModal>
      <ConfirmModal open={!!remove} title="Delete this section?" message="Students in it lose their section." confirmText="Delete" danger onConfirm={del} onCancel={() => setRemove(null)} />
    </>
  );
}
