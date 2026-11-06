import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import { PATHS } from "../../../lib/route_paths";

export const COLUMNS = ["first_name", "middle_name", "last_name", "gender", "date_of_birth", "class", "section", "father_name", "mother_name",
  "parent_first_name", "parent_last_name", "parent_mobile", "parent_email", "parent_relation", "address", "admission_date", "previous_school"];

/** Small CSV parser (quotes, commas inside quotes, CRLF). */
export function parseCsv(text) {
  const out = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((x) => x.trim())) out.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim())) out.push(row);
  const [head, ...body] = out;
  const keys = (head || []).map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return body.map((r, i) => ({ _row: i + 2, ...Object.fromEntries(keys.map((k, j) => [k, (r[j] || "").trim()])) }));
}

const SAMPLE = `${COLUMNS.join(",")}\nAarav,,Patil,MALE,2019-06-10,1st,A,Sunil Patil,Rekha Patil,Sunil,Patil,9822222222,sunil@example.com,FATHER,"Kothrud, Pune",,`;

/** W08 – upload a CSV of students. Each row is admitted with POST /students/admission/ on the next screen. */
export default function ImportUpload() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const onFile = async (file) => {
    setError("");
    if (!file) return;
    const rows = parseCsv(await file.text());
    if (!rows.length) return setError("The file has no rows.");
    const missing = ["first_name", "last_name", "gender", "date_of_birth", "class", "parent_first_name", "parent_mobile"].filter((k) => !(k in rows[0]));
    if (missing.length) return setError(`Missing columns: ${missing.join(", ")}`);
    navigate(PATHS.importReview, { state: { file: file.name, rows } });
  };
  const template = () => {
    const url = URL.createObjectURL(new Blob([SAMPLE], { type: "text/csv" }));
    Object.assign(document.createElement("a"), { href: url, download: "students_template.csv" }).click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      <PageHeader code="W08" title="Import students" subtitle="Admit many students from a CSV. Every parent gets the Parent app login on WhatsApp + e-mail." actions={<button className="btn btn-ghost" onClick={template}>Download template</button>} />
      <section className="card form-card">
        {error && <div className="alert alert-error">{error}</div>}
        <div className="field"><label htmlFor="csv">CSV file</label><input id="csv" type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files[0])} /></div>
        <p className="muted small">Columns: {COLUMNS.join(", ")}. gender = MALE / FEMALE / OTHER · dates = YYYY-MM-DD · class and section = names as in Academics (e.g. 1st, A).</p>
      </section>
    </>
  );
}
