// One approvals queue. Backend: apps/approvals.
import { api } from "../lib/api_client";

export const APPROVAL_TYPES = [
  { value: "student_leave", label: "Student leave" },
  { value: "staff_leave", label: "Staff leave" },
  { value: "attendance_correction", label: "Attendance correction" },
  { value: "discount", label: "Fee discount" },
  { value: "receipt_cancellation", label: "Receipt cancel / refund" },
  { value: "certificate", label: "Certificate request" },
  { value: "student_change", label: "Student detail correction" },
];

export const approvalsService = {
  /** GET /approvals/?status=PENDING|APPROVED|REJECTED|ALL&type= */
  queue: (params = {}) => api.get("/approvals/", { params }),
  get: (type, id) => api.get(`/approvals/${type}/${id}/`),
  /** POST /approvals/{type}/{id}/approve|reject/ {note} */
  decide: (type, id, approve, note = "") => api.post(`/approvals/${type}/${id}/${approve ? "approve" : "reject"}/`, { note }),
};
