// Fees. Backend: apps/fees.
import { api } from "../lib/api_client";
import { crud, opts } from "../lib/crud";

export const MODES = opts([["CASH", "Cash"], ["UPI", "UPI"], ["CARD", "Card"], ["CHEQUE", "Cheque"], ["BANK", "Bank transfer"]]);
export const FEE_STATUS = opts([["UNPAID", "Unpaid"], ["PARTIAL", "Part paid"], ["PAID", "Paid"], ["WAIVED", "Waived"]]);

export const heads = crud("/fees/heads/");
export const plans = crud("/fees/plans/");
export const studentFees = crud("/fees/student-fees/");
export const discounts = crud("/fees/discounts/");
const payments = crud("/fees/payments/");
export const cancellations = crud("/fees/cancellations/");
const dayClose = crud("/fees/day-close/");

export const feesService = {
  heads, plans, studentFees, discounts, cancellations,
  /** GET /fees/plans/{id}/preview/  · POST {id}/assign/ {students?} · POST {id}/copy/ {academic_year} */
  preview: (planId) => api.get(`/fees/plans/${planId}/preview/`),
  assign: (planId, students) => api.post(`/fees/plans/${planId}/assign/`, students ? { students } : {}),
  copyPlan: (planId, academic_year) => api.post(`/fees/plans/${planId}/copy/`, { academic_year }),
  summary: (student) => api.get("/fees/student-fees/summary/", { params: { student } }),
  ledger: (student) => api.get("/fees/student-fees/ledger/", { params: { student } }),
  /** GET /fees/student-fees/dues/?school_class=&section=&as_of=&all=1 */
  dues: (params = {}) => api.get("/fees/student-fees/dues/", { params }),
  waive: (id, note) => api.post(`/fees/student-fees/${id}/waive/`, { note }),
  reminders: (body = {}) => api.post("/fees/student-fees/reminders/", body),
  payments: payments.list,
  receipt: payments.get,
  /** POST /fees/payments/collect/ {student, amount, mode, reference?, paid_on?, student_fee_ids?, late_fee?} */
  collect: (body) => api.post("/fees/payments/collect/", body),
  cancelReceipt: (id, body) => api.post(`/fees/payments/${id}/cancel/`, body),
  collectionReport: (params) => api.get("/fees/payments/collection_report/", { params }),
  dayTotals: (date) => api.get("/fees/day-close/today/", { params: { date } }),
  closeDay: (body) => api.post("/fees/day-close/close/", body),
  dayCloses: dayClose.list,
};
