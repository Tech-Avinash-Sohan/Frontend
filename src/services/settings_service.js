// School profile, dashboard counts, fee settings (receipt numbering), leave policy, audit log.
import { api } from "../lib/api_client";
import { crud } from "../lib/crud";

export const leavePolicies = crud("/attendance/leave-policies/");

export const settingsService = {
  /** GET /school/profile/ */
  school: () => api.get("/school/profile/"),
  /** PATCH /school/profile/ */
  saveSchool: (data) => api.patch("/school/profile/", data),
  /** GET /school/dashboard/ */
  dashboard: () => api.get("/school/dashboard/"),
  /** GET / PATCH /fees/settings/ – receipt prefix, next number, part payment, online payment */
  feeSettings: () => api.get("/fees/settings/"),
  saveFeeSettings: (data) => api.patch("/fees/settings/", data),
  leavePolicies,
  /** GET /reports/audit-log/?action=&model=&search=&page= */
  auditLog: (params = {}) => api.get("/reports/audit-log/", { params }),
};
