import { useEffect, useState } from "react";
import PageHeader from "../../../components/layout/page_header";
import DataTable from "../../../components/common/data_table";
import { chats } from "../../../services/notices_service";
import { api, rows } from "../../../lib/api_client";
import { formatDateTime } from "../../../utils/format_date";

/** W33b – parent ↔ teacher chats (school login sees all, read-only reply as school). GET /communication/chats/ */
export default function ParentChats() {
  const [threads, setThreads] = useState([]);
  const [open, setOpen] = useState(null);
  const [msgs, setMsgs] = useState([]);
  useEffect(() => { chats.list().then((d) => setThreads(rows(d))); }, []);
  useEffect(() => { if (open) api.get(`/communication/chats/${open.id}/messages/`).then(setMsgs); }, [open]);
  return (
    <>
      <PageHeader code="W33b" title="Parent chats" subtitle="Parents talk to teachers in the apps. Teachers reply from the Teacher app; you can read every chat here." />
      <div className="grid-2">
        <DataTable rows={threads} empty="No chats yet." onRowClick={setOpen} columns={[
          { key: "student_name", label: "Student", render: (t) => <span><strong>{t.student_name}</strong><br /><small className="muted">{t.parent_name} ↔ {t.teacher_name}</small></span> },
          { key: "last_message", label: "Last message", render: (t) => <span className="muted">{t.last_message}</span> },
          { key: "last_message_at", label: "When", render: (t) => formatDateTime(t.last_message_at) }]} />
        <section className="card">
          {!open ? <p className="muted">Open a chat.</p> : (<>
            <div className="card-head"><h3>{open.parent_name} ↔ {open.teacher_name}</h3></div>
            <div className="chat-box">
              {msgs.map((m) => <div key={m.id} className={`chat-msg ${m.sender_name === open.teacher_name ? "mine" : ""}`}><small className="muted">{m.sender_name} · {formatDateTime(m.created_at)}</small><div>{m.text}</div></div>)}
            </div></>)}
        </section>
      </div>
    </>
  );
}
