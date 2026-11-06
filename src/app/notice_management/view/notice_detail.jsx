import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../components/layout/page_header";
import LoadingState from "../../../components/common/loading_state";
import StatusBadge from "../../../components/common/status_badge";
import DataTable from "../../../components/common/data_table";
import { noticesService } from "../../../services/notices_service";
import { useSchool } from "../../../context/school_context";
import { PATHS } from "../../../lib/route_paths";
import { formatDateTime } from "../../../utils/format_date";

/** W33 – notice + read receipts (GET {id}/reads/), publish / archive. */
export default function NoticeDetail() {
  const { id } = useParams();
  const { notify } = useSchool();
  const [n, setN] = useState(null);
  const [reads, setReads] = useState(null);
  const load = () => { noticesService.get(id).then(setN); noticesService.reads(id).then(setReads); };
  useEffect(load, [id]);
  if (!n) return <LoadingState />;
  const act = (fn, msg) => fn(id).then(() => { notify(msg); load(); });
  return (
    <>
      <PageHeader code="W33" title={n.title} back={{ to: PATHS.notices, label: "Notices" }}
        actions={<>{n.status === "DRAFT" && <><Link className="btn btn-ghost" to={PATHS.noticeForm(n.id)}>Edit</Link>
          <button className="btn btn-primary" onClick={() => act(noticesService.publish, "Published")}>Publish</button></>}
          {n.status === "PUBLISHED" && <button className="btn btn-ghost" onClick={() => act(noticesService.archive, "Archived")}>Archive</button>}</>} />
      <div className="grid-2-wide">
        <section className="card">
          <div className="card-head"><StatusBadge status={n.status.toLowerCase()} /><span className="muted">{n.category} · {n.audience}</span></div>
          <p style={{ whiteSpace: "pre-wrap" }}>{n.body}</p>
          {n.attachment_url && <p><a href={n.attachment_url} target="_blank" rel="noreferrer">Attachment</a></p>}
          <p className="muted small">{n.published_at ? `Published ${formatDateTime(n.published_at)}` : "Not published"} · by {n.created_by_name}</p>
        </section>
        <section className="card">
          <div className="card-head"><h3>Read by {reads?.read ?? 0} of {reads?.audience ?? 0}</h3></div>
          <DataTable rows={(reads?.readers || []).map((r, i) => ({ ...r, id: i }))} empty="Nobody has opened it yet."
            columns={[{ key: "name", label: "Name" }, { key: "mobile", label: "Mobile" }, { key: "read_at", label: "Read", render: (r) => formatDateTime(r.read_at) }]} />
        </section>
      </div>
    </>
  );
}
