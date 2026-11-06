// Reports + government exports. Every report can be downloaded with ?export=csv.
import { api, buildUrl, tokenStore } from "../lib/api_client";

const get = (path) => (params = {}) => api.get(path, { params });

export const REPORTS = [
  { key: "student-strength", label: "Student strength (class / section / gender / category)" },
  { key: "attendance-trend", label: "Attendance % per day", range: true },
  { key: "low-attendance", label: "Students with low attendance", range: true },
  { key: "fee-dues", label: "Fee dues" },
  { key: "fee-collection", label: "Fee collection (every receipt)", range: true },
  { key: "admissions", label: "Admissions", range: true },
  { key: "birthdays", label: "Birthdays this month", params: { month: new Date().getMonth() + 1 } },
  { key: "staff-leave", label: "Staff leave this year" },
  { key: "general-register", label: "General register (all students ever)" },
];
export const GOV_REPORTS = [
  { key: "udise/school", label: "UDISE+ school profile & enrolment" },
  { key: "udise/students", label: "UDISE+ student data (SDMS)" },
  { key: "udise/teachers", label: "UDISE+ teacher data" },
  { key: "rte", label: "RTE 25% students" },
];

export const reportsService = {
  dashboard: get("/reports/dashboard/"),
  strength: get("/reports/student-strength/"),
  feeDues: get("/reports/fee-dues/"),
  collection: get("/reports/fee-collection/"),
  examResults: (exam) => api.get("/reports/exam-results/", { params: { exam } }),
  report: (key, params = {}) => api.get(`/reports/${key}/`, { params }),
  government: (key, params = {}) => api.get(`/government/${key}/`, { params }),
  /** Downloads ?export=csv with the Bearer token (a plain link would not send it). */
  async downloadCsv(path, params = {}, filename = "report.csv") {
    const res = await fetch(buildUrl(path, { ...params, export: "csv" }), { headers: { Authorization: `Bearer ${tokenStore.get()?.access}` } });
    if (!res.ok) throw new Error(`Download failed (${res.status})`);
    const url = URL.createObjectURL(await res.blob());
    const a = Object.assign(document.createElement("a"), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
