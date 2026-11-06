// Teachers and staff. Backend: apps/staff.
import { api } from "../lib/api_client";

export const STAFF_TYPES = [
  { value: "TEACHER", label: "Teacher" },
  { value: "ADMIN_STAFF", label: "Office / Admin staff" },
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "LIBRARIAN", label: "Librarian" },
  { value: "DRIVER", label: "Driver" },
  { value: "SUPPORT", label: "Support staff" },
];
export const EMPLOYMENT_TYPES = [
  { value: "FULL_TIME", label: "Full time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "CONTRACT", label: "Contract" },
];

export const staffService = {
  /** GET /staff/?staff_type=&employment_type=&is_active=&subjects=&search=&page= */
  list(params = {}) {
    return api.get("/staff/", { params });
  },
  /** GET /staff/{id}/ */
  get(id) {
    return api.get(`/staff/${id}/`);
  },
  /** POST /staff/ – creates the TEACHER / STAFF login and sends it. Answer has `login`. */
  create(data) {
    return api.post("/staff/", data);
  },
  /** PATCH /staff/{id}/ – job details (name / mobile are the login, set at creation) */
  update(id, data) {
    return api.patch(`/staff/${id}/`, data);
  },
  /** DELETE /staff/{id}/ – deactivates (Teacher app stops working) */
  deactivate(id) {
    return api.delete(`/staff/${id}/`);
  },
  /** POST /staff/{id}/activate/ */
  activate(id) {
    return api.post(`/staff/${id}/activate/`, {});
  },
  /** POST /staff/{id}/resend_login/ -> { mobile, password } */
  resendLogin(id) {
    return api.post(`/staff/${id}/resend_login/`, {});
  },

};
