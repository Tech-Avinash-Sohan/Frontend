import PageHeader from "../../../components/layout/page_header";

const ROWS = [
  ["Create schools, switch a school off, Parent app payments", "✓", "", "", ""],
  ["School profile, fee settings, leave policy, audit log", "", "✓", "", ""],
  ["Classes, sections, subjects, timetable, fee plans, exams setup", "", "✓", "read", ""],
  ["Teachers & staff (create, deactivate, resend login)", "", "✓", "", ""],
  ["Admission, students, parents, enquiries", "", "✓", "✓", ""],
  ["Mark attendance, homework, diary, lesson plans, marks", "", "✓", "✓", ""],
  ["Collect fees, receipts, day close, dues", "", "✓", "✓", ""],
  ["Approve discounts, receipt cancellations, staff leave, certificates, corrections", "", "✓", "", ""],
  ["Approve student leave", "", "✓", "✓", ""],
  ["Notices, chats, PTM slots, complaints, consent forms", "", "✓", "✓", "own children"],
  ["See attendance, homework, results, fees, pay online", "", "", "", "after yearly payment"],
];

/** W41 – who can do what (fixed by the backend permission classes in apps/authentication/permissions.py). */
export default function RolePermissions() {
  return (
    <>
      <PageHeader code="W41" title="Who can do what" subtitle="Set by the server for each login type. Change in apps/authentication/permissions.py." />
      <div className="table-card"><div className="table-scroll">
        <table className="data-table">
          <thead><tr><th>Work</th><th>Our team (SUPER_ADMIN)</th><th>School login</th><th>Teachers & office staff</th><th>Parents</th></tr></thead>
          <tbody>{ROWS.map(([w, ...c]) => <tr key={w}><td>{w}</td>{c.map((x, i) => <td key={i}>{x}</td>)}</tr>)}</tbody>
        </table>
      </div></div>
      <p className="muted small">Teachers and staff use the Teacher app (free). Parents use the Parent app after the yearly fee. Every API needs a login token.</p>
    </>
  );
}
