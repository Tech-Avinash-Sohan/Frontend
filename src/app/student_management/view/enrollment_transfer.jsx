import { useEffect, useState } from "react";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import FormSelect from "../../../components/forms/form_select";
import { studentsService } from "../../../services/students_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";

/** W07 – move selected students to another class / section (PATCH /students/{id}/ for each). */
export default function EnrollmentTransfer() {
  const { classOptions, sectionOptions, notify, reload } = useSchool();
  const [from, setFrom] = useState({ school_class: "", section: "" });
  const [to, setTo] = useState({ school_class: "", section: "" });
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = () => {
    if (!from.school_class) return setList([]);
    setLoading(true);
    studentsService.list({ ...from, status: "ACTIVE", page_size: 200 }).then((d) => { setList(rows(d)); setSelected([]); }).finally(() => setLoading(false));
  };
  useEffect(load, [from]);

  const move = async () => {
    setBusy(true);
    try {
      for (const id of selected) await studentsService.update(id, { school_class: to.school_class, section: to.section || null });
      notify(`${selected.length} students moved`);
      load();
      reload();
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader code="W07" title="Enrollment & transfer" subtitle="Move students to another class or section – e.g. promote at the year end." />
      <section className="card form-card">
        <div className="form-grid">
          <FormSelect label="From class" name="school_class" value={from.school_class} onChange={(k, v) => setFrom({ school_class: v, section: "" })} options={classOptions} />
          <FormSelect label="From section" name="section" value={from.section} onChange={(k, v) => setFrom((f) => ({ ...f, section: v }))} options={sectionOptions(from.school_class)} placeholder="All sections" />
          <FormSelect label="To class" name="to_class" value={to.school_class} onChange={(k, v) => setTo({ school_class: v, section: "" })} options={classOptions} />
          <FormSelect label="To section" name="to_section" value={to.section} onChange={(k, v) => setTo((t) => ({ ...t, section: v }))} options={sectionOptions(to.school_class)} placeholder="No section" />
        </div>
      </section>
      <DataTable
        loading={loading}
        rows={list}
        selectable
        selected={selected}
        onSelect={setSelected}
        empty={from.school_class ? "No active students here." : "Choose the class to move from."}
        columns={[
          { key: "roll_no", label: "Roll", width: 60 },
          { key: "full_name", label: "Student", render: (s) => <strong>{s.full_name}</strong> },
          { key: "admission_no", label: "Admission no." },
          { key: "class", label: "Now in", render: (s) => `${s.class_name}${s.section_name ? `-${s.section_name}` : ""}` },
        ]}
      />
      <div className="form-actions sticky-actions">
        <span className="muted">{selected.length} selected</span>
        <button className="btn btn-primary" disabled={!selected.length || !to.school_class || busy} onClick={move}>{busy ? "Moving…" : `Move ${selected.length} students`}</button>
      </div>
    </>
  );
}
