import { useCallback, useEffect, useState } from "react";
import PageHeader from "../layout/page_header";
import DataTable from "./data_table";
import FilterBar from "./filter_bar";
import SearchBar from "./search_bar";
import ConfirmModal from "./confirm_modal";
import FormInput from "../forms/form_input";
import FormSelect from "../forms/form_select";
import { useDebounce } from "../../hooks/use_debounce";
import { useSchool } from "../../context/school_context";
import { apiErrors } from "../../utils/validation";

/** One form field. type: text | number | date | time | email | textarea | checkbox | select | multiselect */
export function Field({ f, values, set, errors }) {
  const v = values[f.name];
  if (f.type === "select") {
    return <FormSelect label={f.label} name={f.name} value={v} onChange={set} options={f.options || []} required={f.required}
      error={errors[f.name]} hint={f.hint} className={f.span ? "span-2" : ""} placeholder={f.placeholder ?? "Choose…"} />;
  }
  if (f.type === "multiselect") {
    const list = (v || []).map(String);
    const toggle = (id) => set(f.name, list.includes(String(id)) ? (v || []).filter((x) => String(x) !== String(id)) : [...(v || []), id]);
    return (
      <div className={`field span-2 ${errors[f.name] ? "has-error" : ""}`}>
        <label>{f.label}{f.required && <span className="req">*</span>}</label>
        <div className="chip-row">
          {(f.options || []).map((o) => (
            <button type="button" key={o.value} className={`chip chip-toggle ${list.includes(String(o.value)) ? "on" : ""}`}
              aria-pressed={list.includes(String(o.value))} onClick={() => toggle(o.value)}>{o.label}</button>
          ))}
          {!f.options?.length && <span className="muted small">Nothing to choose yet.</span>}
        </div>
        {errors[f.name] ? <small className="field-error">{errors[f.name]}</small> : f.hint ? <small className="field-hint">{f.hint}</small> : null}
      </div>
    );
  }
  return <FormInput label={f.label} name={f.name} type={f.type || "text"} value={v} onChange={set} required={f.required}
    error={errors[f.name]} hint={f.hint} className={f.span || f.type === "textarea" ? "span-2" : ""} rows={f.rows} step={f.step} placeholder={f.placeholder} />;
}

/** Form fields in a grid; fields can hide themselves with hidden(values). */
export function FieldGrid({ fields, values, set, errors }) {
  return (
    <div className="form-grid">
      {fields.filter((f) => !f.hidden?.(values)).map((f) => <Field key={f.name} f={f} values={values} set={set} errors={errors} />)}
    </div>
  );
}

const clean = (values, fields) => {
  const out = { ...values };
  fields.forEach((f) => {
    if (f.hidden?.(values)) delete out[f.name];
    else if (out[f.name] === "" && f.type !== "text" && f.type !== "textarea") out[f.name] = null;
    if (f.type === "number" && out[f.name] !== null && out[f.name] !== undefined && out[f.name] !== "") out[f.name] = Number(out[f.name]);
  });
  return out;
};

/**
 * List + search + filters + create / edit modal + delete for one API resource.
 * <CrudScreen code title service={crud("/x/")} columns fields filters defaults rowActions canCreate canEdit canDelete />
 */
export default function CrudScreen({
  code, title, subtitle, service, columns, fields = [], filters = [], defaults = {}, params = {},
  search = true, canCreate = true, canEdit = true, canDelete = true, createLabel = "+ Add", rowActions, headerActions,
  toForm = (r) => r, fromForm = (v) => v, onRowClick, empty, reloadKey, modalWide = false, onSaved,
}) {
  const { notify } = useSchool();
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [fv, setFv] = useState({});
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(null);
  const query = useDebounce(q, 300);
  const paramsKey = JSON.stringify(params);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    service.list({ ...params, ...fv, search: query || undefined, page })
      .then((d) => setData(Array.isArray(d) ? { results: d, count: d.length } : d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, paramsKey, JSON.stringify(fv), query, page]);
  useEffect(load, [load, reloadKey]);

  const set = (k, v) => setEdit((e) => ({ ...e, [k]: v }));
  const save = async () => {
    setBusy(true);
    setErrors({});
    try {
      const saved = await service.save(fromForm(clean(edit, fields)));
      notify(edit.id ? "Saved" : "Created");
      setEdit(null);
      onSaved?.(saved);
      load();
    } catch (err) {
      setErrors(apiErrors(err));
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    try {
      await service.remove(del.id);
      notify("Deleted");
      setDel(null);
      load();
    } catch (err) {
      notify(apiErrors(err)._ || "Could not delete", "error");
      setDel(null);
    }
  };

  const cols = [...columns];
  if (canEdit || canDelete || rowActions) {
    cols.push({
      key: "_act", label: "", align: "right",
      render: (r) => (
        <span className="row-actions" onClick={(e) => e.stopPropagation()}>
          {rowActions?.(r, load)}
          {canEdit && <button className="btn btn-ghost btn-sm" onClick={() => { setErrors({}); setEdit(toForm(r)); }}>Edit</button>}
          {canDelete && <button className="btn btn-ghost btn-sm danger" onClick={() => setDel(r)}>Delete</button>}
        </span>
      ),
    });
  }
  return (
    <>
      <PageHeader code={code} title={title} subtitle={subtitle}
        actions={<>{headerActions}{canCreate && <button className="btn btn-primary" onClick={() => { setErrors({}); setEdit({ ...defaults }); }}>{createLabel}</button>}</>} />
      {(search || filters.length > 0) && (
        <div className="toolbar">
          {search && <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} />}
          {filters.length > 0 && <FilterBar filters={filters} values={fv} onChange={(k, v) => { setFv((x) => ({ ...x, [k]: v || undefined })); setPage(1); }} />}
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}
      <DataTable columns={cols} rows={data.results} loading={loading} page={page} count={data.count} onPage={setPage} empty={empty} onRowClick={onRowClick} />
      <ConfirmModal open={!!edit} title={edit?.id ? `Edit ${title.toLowerCase()}` : `${createLabel.replace("+ ", "")}`} confirmText={busy ? "Saving…" : "Save"}
        busy={busy} onConfirm={save} onCancel={() => setEdit(null)} wide={modalWide || fields.length > 6}>
        {errors._ && <div className="alert alert-error">{errors._}</div>}
        {edit && <FieldGrid fields={fields} values={edit} set={set} errors={errors} />}
      </ConfirmModal>
      <ConfirmModal open={!!del} danger title="Delete?" message="This cannot be undone." confirmText="Delete" onConfirm={remove} onCancel={() => setDel(null)} />
    </>
  );
}
