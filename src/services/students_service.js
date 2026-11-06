// Students, admission, parents, documents, correction requests. Backend: apps/students.
import { api } from "../lib/api_client";
import { crud } from "../lib/crud";

export const documents = crud("/students/documents/");
export const changeRequests = crud("/students/change-requests/");

export const studentsService = {
  /** GET /students/?school_class=&section=&status=&gender=&is_rte=&search=&page= */
  list: (params = {}) => api.get("/students/", { params }),
  get: (id) => api.get(`/students/${id}/`),
  /** PATCH /students/{id}/ */
  update: (id, data) => api.patch(`/students/${id}/`, data),
  /** POST /students/admission/ – creates the parent login and sends it. Answer has parent_login. */
  admit: (data) => api.post("/students/admission/", data),
  /** POST /students/{id}/mark_left/ {status, left_on} */
  markLeft: (id, status, left_on) => api.post(`/students/${id}/mark_left/`, { status, left_on }),
  parents: (params = {}) => api.get("/students/parents/", { params }),
  parent: (id) => api.get(`/students/parents/${id}/`),
  resendParentLogin: (id) => api.post(`/students/parents/${id}/resend_login/`, {}),
  documents,
  changeRequests,
};
