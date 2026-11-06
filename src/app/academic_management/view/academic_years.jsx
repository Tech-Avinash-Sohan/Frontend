import { useEffect, useState } from "react";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import ConfirmModal from "../../../components/common/confirm_modal";
import StatusBadge from "../../../components/common/status_badge";
import FormInput from "../../../components/forms/form_input";
import { academicsService } from "../../../services/academics_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";
import { formatDate } from "../../../utils/format_date";
import { apiErrors } from "../../../utils/validation";

/** W26 – /academics/years/ (one year is current; admissions are made into it). */
export default function AcademicYears() {
  const { notify, reload } = useSchool();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [remove, setRemove] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const load = () => {
    setLoading(true);
    academicsService.years().then((d) => setList(rows(d))).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async () => {
    setBusy(true);
    try {
      await academicsService.saveYear(form);
      notify("Academic year saved");
      setForm(null);
      load();
      reload();
    } catch (err) {
      setErrors(apiErrors(err));
    } finally {
      setBusy(false);
    }
  };
  const del = async () => {
    try {
      await academicsService.deleteYear(remove.id);
      notify("Academic year deleted");
      setRemove(null);
      load();
      reload();
    } catch (err) {
      notify(err.message, "error");
      setRemove(null);
    }
  };

  return (
    <>
      <PageHeader code="W26" title="Academic years" subtitle="Set the current year before admissions." actions={<button className="btn btn-primary" onClick={() => { setErrors({}); setForm({ name: "", start_date: "", end_date: "", is_current: list.length === 0 }); }}>+ Add year</button>} />
      <DataTable
        loading={loading}
        rows={list}
        empty="No academic year yet. Add 2026-27 to start."
        columns={[
          { key: "name", label: "Year", render: (y) => <strong>{y.name}</strong> },
          { key: "start_date", label: "Starts", render: (y) => formatDate(y.start_date) },
          { key: "end_date", label: "Ends", render: (y) => formatDate(y.end_date) },
          { key: "is_current", label: "", render: (y) => (y.is_current ? <StatusBadge status="current" label="Current" /> : null) },
          { key: "actions", label: "", align: "right", render: (y) => (
            <span className="row-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => { setErrors({}); setForm({ ...y }); }}>Edit</button>
              <button className="btn btn-danger-ghost btn-sm" onClick={() => setRemove(y)}>Delete</button>
            </span>
          ) },
        ]}
      />
      <ConfirmModal open={!!form} title={form?.id ? "Edit academic year" : "Add academic year"} confirmText="Save" busy={busy} onConfirm={save} onCancel={() => setForm(null)}>
        {form && (
          <div className="form-grid">
            {errors._ && <div className="alert alert-error span-2">{errors._}</div>}
            <FormInput label="Name" name="name" value={form.name} onChange={set} error={errors.name} placeholder="2026-27" required />
            <FormInput label="Current year" name="is_current" type="checkbox" value={form.is_current} onChange={set} />
            <FormInput label="Start date" name="start_date" type="date" value={form.start_date} onChange={set} error={errors.start_date} required />
            <FormInput label="End date" name="end_date" type="date" value={form.end_date} onChange={set} error={errors.end_date} required />
          </div>
        )}
      </ConfirmModal>
      <ConfirmModal open={!!remove} title="Delete this year?" message={`${remove?.name} will be removed. A year with students cannot be deleted.`} confirmText="Delete" danger onConfirm={del} onCancel={() => setRemove(null)} />
    </>
  );
}
