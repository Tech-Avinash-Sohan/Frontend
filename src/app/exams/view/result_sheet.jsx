import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import LoadingState from "../../../components/common/loading_state";
import ConfirmModal from "../../../components/common/confirm_modal";
import DataTable from "../../../components/common/data_table";
import StatusBadge from "../../../components/common/status_badge";
import { examsService } from "../../../services/exams_service";
import { useSchool } from "../../../context/school_context";
import { rows } from "../../../lib/api_client";

/** W56 – result sheet with ranks (GET /exams/exams/{id}/result_sheet/?section=) and each report card. */
export default function ResultSheet() {
  const { divisionOptions } = useSchool();
  const [sp, setSp] = useSearchParams();
  const exam = sp.get("exam") || "";
  const section = sp.get("section") || "";
  const [examList, setExamList] = useState([]);
  const [sheet, setSheet] = useState(null);
  const [card, setCard] = useState(null);
  useEffect(() => { examsService.exams.list({ page_size: 100 }).then((d) => setExamList(rows(d))); }, []);
  useEffect(() => { setSheet(null); if (exam && section) examsService.resultSheet(exam, section).then(setSheet); }, [exam, section]);
  const subjects = sheet?.rows[0] ? Object.keys(sheet.rows[0].subjects) : [];
  return (
    <>
      <PageHeader code="W56" title="Results" subtitle={sheet ? `${sheet.students} students · ${sheet.passed} passed · ${sheet.pass_percentage ?? "—"}%` : ""} />
      <div className="card toolbar-card">
        <div className="field"><label htmlFor="e">Exam</label><select id="e" value={exam} onChange={(e) => setSp({ exam: e.target.value, section })}><option value="">Choose…</option>{examList.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
        <div className="field"><label htmlFor="s">Section</label><select id="s" value={section} onChange={(e) => setSp({ exam, section: e.target.value })}><option value="">Choose…</option>{divisionOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
      </div>
      {exam && section && !sheet && <LoadingState />}
      {sheet && <DataTable rows={sheet.rows.map((r) => ({ ...r, id: r.student.id }))} onRowClick={(r) => examsService.reportCard(exam, r.id).then(setCard)} empty="No students."
        columns={[{ key: "rank", label: "Rank", render: (r) => r.rank ?? "—" }, { key: "name", label: "Student", render: (r) => <strong>{r.student.name}</strong> },
          ...subjects.map((s) => ({ key: s, label: s, align: "right", render: (r) => r.subjects[s] ?? "—" })),
          { key: "total", label: "Total", align: "right", render: (r) => `${r.total}/${r.max_total}` }, { key: "percentage", label: "%", align: "right", render: (r) => r.percentage ?? "—" },
          { key: "grade", label: "Grade", render: (r) => r.grade || "—" }, { key: "result", label: "Result", render: (r) => r.result && <StatusBadge status={r.result === "PASS" ? "approved" : "rejected"} label={r.result} /> }]} />}
      <ConfirmModal open={!!card} wide title={card ? `${card.student.name} – ${card.exam}` : ""} confirmText="Print" onConfirm={() => window.print()} onCancel={() => setCard(null)}>
        {card && (<>
          <table className="data-table"><thead><tr><th>Subject</th><th>Marks</th><th>Max</th><th>Grade</th><th /></tr></thead>
            <tbody>{card.subjects.map((s) => <tr key={s.subject}><td>{s.subject}</td><td>{s.is_absent ? "AB" : s.marks ?? "—"}</td><td>{s.max_marks}</td><td>{s.grade || "—"}</td><td>{s.passed ? "" : <span className="danger-text">Fail</span>}</td></tr>)}</tbody>
            <tfoot><tr><th>Total</th><th>{card.total}</th><th>{card.max_total}</th><th>{card.grade}</th><th>{card.percentage}% · {card.result}</th></tr></tfoot></table>
          {card.remark && <p><b>Remark:</b> {card.remark}</p>}</>)}
      </ConfirmModal>
    </>
  );
}
