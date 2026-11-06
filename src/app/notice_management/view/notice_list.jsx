import { useNavigate } from "react-router-dom";
import CrudScreen from "../../../components/common/crud_screen";
import StatusBadge from "../../../components/common/status_badge";
import { CATEGORIES, notices } from "../../../services/notices_service";
import { PATHS } from "../../../lib/route_paths";
import { formatDateTime } from "../../../utils/format_date";

/** W31 – notices / circulars: GET /communication/notices/ */
export default function NoticeList() {
  const navigate = useNavigate();
  return (
    <CrudScreen code="W31" title="Notices" subtitle="Draft → Publish. Published notices show in the Parent / Teacher app (WhatsApp if chosen)."
      service={notices} canEdit={false} canCreate={false} canDelete={false}
      headerActions={<button className="btn btn-primary" onClick={() => navigate(PATHS.noticeForm())}>+ New notice</button>}
      filters={[{ key: "status", label: "Status", options: [{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }, { value: "ARCHIVED", label: "Archived" }] },
        { key: "category", label: "Category", options: CATEGORIES }]}
      onRowClick={(n) => navigate(PATHS.noticeDetail(n.id))}
      columns={[
        { key: "title", label: "Title", render: (n) => <span><strong>{n.title}</strong>{n.is_pinned ? " 📌" : ""}</span> },
        { key: "category", label: "Category" },
        { key: "audience", label: "Audience" },
        { key: "status", label: "Status", render: (n) => <StatusBadge status={n.status.toLowerCase()} /> },
        { key: "read_count", label: "Read", align: "right" },
        { key: "published_at", label: "Published", render: (n) => (n.published_at ? formatDateTime(n.published_at) : "—") },
      ]} empty="No notices yet." />
  );
}
