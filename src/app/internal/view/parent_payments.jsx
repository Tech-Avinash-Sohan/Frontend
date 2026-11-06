import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import SearchBar from "../../../components/common/search_bar";
import FilterBar from "../../../components/common/filter_bar";
import StatusBadge from "../../../components/common/status_badge";
import { paymentsService } from "../../../services/payments_service";
import { useDebounce } from "../../../hooks/use_debounce";
import { formatCurrency } from "../../../utils/format_currency";
import { formatDate, formatDateTime } from "../../../utils/format_date";

/** GET /payments/parent-payments/ – our team sees every school, a school sees its own. */
export default function ParentPayments({ title = "Parent app payments" }) {
  const [params] = useSearchParams();
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ status: "", method: "", school: params.get("school") || "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const search = useDebounce(q, 300);

  useEffect(() => {
    setLoading(true);
    paymentsService.list({ search, page, ...filters }).then(setData).finally(() => setLoading(false));
  }, [search, page, filters]);

  return (
    <>
      <PageHeader title={title} subtitle={`${data.count} payments`} />
      <div className="toolbar">
        <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Parent mobile, name or order id" />
        <FilterBar
          values={filters}
          onChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); }}
          filters={[
            { key: "status", label: "Status", options: [{ value: "SUCCESS", label: "Paid" }, { value: "CREATED", label: "Waiting" }, { value: "FAILED", label: "Failed" }] },
            { key: "method", label: "Method", options: [{ value: "RAZORPAY", label: "Razorpay" }, { value: "MANUAL", label: "Cash / school" }, { value: "DEV", label: "Test" }] },
          ]}
        />
      </div>
      <DataTable
        loading={loading}
        rows={data.results}
        count={data.count}
        page={page}
        onPage={setPage}
        empty="No payments yet."
        columns={[
          { key: "parent_name", label: "Parent", render: (p) => <span><strong>{p.parent_name}</strong><br /><small className="muted">{p.parent_mobile}</small></span> },
          { key: "school_name", label: "School" },
          { key: "amount", label: "Amount", align: "right", render: (p) => formatCurrency(p.amount) },
          { key: "method", label: "Method" },
          { key: "order_id", label: "Order / payment id", render: (p) => <small>{p.order_id}<br />{p.razorpay_payment_id || ""}</small> },
          { key: "valid_till", label: "Active", render: (p) => (p.valid_from ? `${formatDate(p.valid_from)} – ${formatDate(p.valid_till)}` : "—") },
          { key: "paid_at", label: "Paid at", render: (p) => (p.paid_at ? formatDateTime(p.paid_at) : "—") },
          { key: "status", label: "Status", render: (p) => <StatusBadge status={p.status === "SUCCESS" ? "paid" : p.status === "FAILED" ? "error" : "pending"} label={p.status === "SUCCESS" ? "Paid" : p.status === "FAILED" ? "Failed" : "Waiting"} /> },
        ]}
      />
    </>
  );
}
