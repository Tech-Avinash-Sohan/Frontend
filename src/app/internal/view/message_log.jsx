import { useEffect, useState } from "react";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import SearchBar from "../../../components/common/search_bar";
import FilterBar from "../../../components/common/filter_bar";
import StatusBadge from "../../../components/common/status_badge";
import ConfirmModal from "../../../components/common/confirm_modal";
import { notificationsService } from "../../../services/notifications_service";
import { useDebounce } from "../../../hooks/use_debounce";
import { formatDateTime } from "../../../utils/format_date";

export const EVENTS = [
  { value: "SCHOOL_CREATED", label: "School login created" },
  { value: "STAFF_CREATED", label: "Teacher / staff login" },
  { value: "ADMISSION_DONE", label: "Admission done" },
  { value: "PAYMENT_SUCCESS", label: "Parent app payment" },
  { value: "PASSWORD_RESET", label: "Password reset OTP" },
  { value: "CREDENTIALS_RESENT", label: "Login sent again" },
];
const eventLabel = (v) => EVENTS.find((e) => e.value === v)?.label || v;

/** GET /notifications/logs/ – every WhatsApp / e-mail / SMS with its result. Our team: all · school: its own. */
export default function MessageLog() {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ event: "", channel: "", status: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const search = useDebounce(q, 300);

  useEffect(() => {
    setLoading(true);
    notificationsService.logs({ search, page, ...filters }).then(setData).finally(() => setLoading(false));
  }, [search, page, filters]);

  return (
    <>
      <PageHeader title="WhatsApp & e-mail log" subtitle="Every login, admission and payment message we sent" />
      <div className="toolbar">
        <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Mobile, e-mail or subject" />
        <FilterBar
          values={filters}
          onChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }}
          filters={[
            { key: "event", label: "Event", options: EVENTS },
            { key: "channel", label: "Channel", options: [{ value: "WHATSAPP", label: "WhatsApp" }, { value: "EMAIL", label: "E-mail" }, { value: "SMS", label: "SMS" }] },
            { key: "status", label: "Result", options: [{ value: "SENT", label: "Sent" }, { value: "FAILED", label: "Failed" }, { value: "SKIPPED", label: "Skipped" }] },
          ]}
        />
      </div>
      <DataTable
        loading={loading}
        rows={data.results}
        count={data.count}
        page={page}
        onPage={setPage}
        onRowClick={setOpen}
        empty="No messages yet."
        columns={[
          { key: "created_at", label: "When", render: (l) => formatDateTime(l.created_at) },
          { key: "event", label: "Event", render: (l) => eventLabel(l.event) },
          { key: "channel", label: "Channel" },
          { key: "to", label: "To" },
          { key: "status", label: "Result", render: (l) => <StatusBadge status={l.status === "SENT" ? "sent" : l.status === "FAILED" ? "error" : "pending"} label={l.status} /> },
        ]}
      />
      <ConfirmModal open={!!open} title={open ? `${open.channel} to ${open.to}` : ""} confirmText="Close" cancelText="Close" onConfirm={() => setOpen(null)} onCancel={() => setOpen(null)} wide>
        {open && (
          <>
            {open.subject && <p><strong>{open.subject}</strong></p>}
            <pre className="code-block" style={{ whiteSpace: "pre-wrap" }}>{open.body}</pre>
            {open.error && <div className="alert alert-error">{open.error}</div>}
          </>
        )}
      </ConfirmModal>
    </>
  );
}
