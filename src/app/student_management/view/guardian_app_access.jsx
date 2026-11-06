import { useEffect, useState } from "react";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import SearchBar from "../../../components/common/search_bar";
import FilterBar from "../../../components/common/filter_bar";
import StatusBadge from "../../../components/common/status_badge";
import ConfirmModal from "../../../components/common/confirm_modal";
import { studentsService } from "../../../services/students_service";
import { paymentsService } from "../../../services/payments_service";
import { useSchool } from "../../../context/school_context";
import { useDebounce } from "../../../hooks/use_debounce";
import { formatDate } from "../../../utils/format_date";

const STEP = { instructions: ["pending", "Not read instructions"], payment: ["warning", "Waiting for payment"], parent_home: ["active", "Using the app"] };

/** W06 – GET /students/parents/: every parent, their children and Parent app status.
 *  Resend login · parent paid cash -> POST /payments/parent-payments/activate_manually/ */
export default function GuardianAppAccess() {
  const { notify } = useSchool();
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ app_status: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { kind, parent }
  const [busy, setBusy] = useState(false);
  const [login, setLogin] = useState(null);
  const search = useDebounce(q, 300);

  const load = () => {
    setLoading(true);
    studentsService.parents({ search, page, ...filters }).then(setData).finally(() => setLoading(false));
  };
  useEffect(load, [search, page, filters]);

  const confirm = async () => {
    setBusy(true);
    try {
      if (modal.kind === "resend") {
        setLogin(await studentsService.resendParentLogin(modal.parent.id));
        notify("New password sent on WhatsApp and e-mail");
      } else {
        await paymentsService.activateManually(modal.parent.id, "Cash at school office");
        notify("Parent app activated for one year");
        load();
      }
      setModal(null);
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader code="W06" title="Parents & Parent app" subtitle={`${data.count} parent logins · each pays the yearly fee in the app`} />
      {login && <div className="alert alert-success">New login sent – mobile <strong>{login.mobile}</strong>, password <strong>{login.password}</strong></div>}
      <div className="toolbar">
        <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Parent name or mobile" />
        <FilterBar values={filters} onChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }} filters={[{ key: "app_status", label: "Parent app", options: [{ value: "true", label: "Paid" }, { value: "false", label: "Not paid" }] }]} />
      </div>
      <DataTable
        loading={loading}
        rows={data.results}
        count={data.count}
        page={page}
        onPage={setPage}
        empty="No parents yet – they are created with each admission."
        columns={[
          { key: "name", label: "Parent", render: (p) => <span><strong>{p.name}</strong><br /><small className="muted">{p.mobile}{p.email ? ` · ${p.email}` : ""}</small></span> },
          { key: "children", label: "Children", render: (p) => p.children.map((c) => `${c.name} (${c.class}${c.section ? `-${c.section}` : ""})`).join(", ") },
          { key: "step", label: "In the app", render: (p) => <StatusBadge status={STEP[p.next_step]?.[0]} label={STEP[p.next_step]?.[1]} /> },
          { key: "app", label: "Active till", render: (p) => (p.is_app_active ? formatDate(p.app_valid_till) : "—") },
          { key: "actions", label: "", align: "right", render: (p) => (
            <span className="row-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setModal({ kind: "resend", parent: p })}>Resend login</button>
              {!p.is_app_active && <button className="btn btn-primary btn-sm" onClick={() => setModal({ kind: "cash", parent: p })}>Paid cash</button>}
            </span>
          ) },
        ]}
      />
      <ConfirmModal
        open={!!modal}
        title={modal?.kind === "resend" ? "Send a new password?" : "Activate the Parent app?"}
        message={modal?.kind === "resend" ? `A new password goes to ${modal?.parent.mobile} on WhatsApp and e-mail.` : `Records a cash payment and activates ${modal?.parent.name}'s Parent app for one year.`}
        confirmText={modal?.kind === "resend" ? "Send" : "Activate"}
        busy={busy}
        onConfirm={confirm}
        onCancel={() => setModal(null)}
      />
    </>
  );
}
