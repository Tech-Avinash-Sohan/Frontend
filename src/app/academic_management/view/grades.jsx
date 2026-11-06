import { useEffect, useState } from "react";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import ConfirmModal from "../../../components/common/confirm_modal";
import FormInput from "../../../components/forms/form_input";
import { academicsService } from "../../../services/academics_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { apiErrors } from "../../../utils/validation";

/** W27 – /academics/classes/ (Nursery … 10th) with their sections. */
export default function Grades() {
  const { notify, reload } = useSchool();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [remove, setRemove] = useState(null);
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const load = () => {
    setLoading(true);
    academicsService.classes().then((d) => setList(rows(d))).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async () => {
    try {
      await academicsService.saveClass({ ...form, order: Number(form.order || 0) });
      notify("Class saved");
      setForm(null);
      load();
      reload();
    } catch (err) {
      setErrors(apiErrors(err));
    }
  };
  const del = async () => {
    try {
      await academicsService.deleteClass(remove.id);
      notify("Class deleted");
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
      <PageHeader code="W27" title="Classes" subtitle="Order decides how classes are sorted everywhere." actions={<button className="btn btn-primary" onClick={() => { setErrors({}); setForm({ name: "", order: list.length + 1 }); }}>+ Add class</button>} />
      <DataTable
        loading={loading}
        rows={list}
        empty="No classes yet."
        columns={[
          { key: "order", label: "Order", width: 70 },
          { key: "name", label: "Class", render: (c) => <strong>{c.name}</strong> },
          { key: "sections", label: "Sections", render: (c) => (c.sections.length ? c.sections.map((s) => s.name).join(", ") : <span className="muted">none</span>) },
          { key: "students", label: "Students", align: "right", render: (c) => c.sections.reduce((n, s) => n + s.student_count, 0) },
          { key: "actions", label: "", align: "right", render: (c) => (
            <span className="row-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => { setErrors({}); setForm({ id: c.id, name: c.name, order: c.order }); }}>Edit</button>
              <button className="btn btn-danger-ghost btn-sm" onClick={() => setRemove(c)}>Delete</button>
            </span>
          ) },
        ]}
      />
      <ConfirmModal open={!!form} title={form?.id ? "Edit class" : "Add class"} confirmText="Save" onConfirm={save} onCancel={() => setForm(null)}>
        {form && (
          <div className="form-grid">
            {errors._ && <div className="alert alert-error span-2">{errors._}</div>}
            <FormInput label="Name" name="name" value={form.name} onChange={set} error={errors.name} placeholder="5th" required />
            <FormInput label="Order" name="order" type="number" value={form.order} onChange={set} error={errors.order} />
          </div>
        )}
      </ConfirmModal>
      <ConfirmModal open={!!remove} title="Delete this class?" message={`${remove?.name} and its sections will be removed. A class with students cannot be deleted.`} confirmText="Delete" danger onConfirm={del} onCancel={() => setRemove(null)} />
    </>
  );
}
