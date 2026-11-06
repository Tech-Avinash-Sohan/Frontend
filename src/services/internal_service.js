// Our internal dashboard (user_type SUPER_ADMIN). Backend: apps/schools (urls_internal.py) + payments + notifications.
import { api } from "../lib/api_client";

export const internalService = {
  /** GET /internal/dashboard/ – totals */
  dashboard() {
    return api.get("/internal/dashboard/");
  },
  /** GET /internal/schools/?search=&is_active=&board=&city=&page= */
  schools(params = {}) {
    return api.get("/internal/schools/", { params });
  },
  /** GET /internal/schools/{id}/ */
  school(id) {
    return api.get(`/internal/schools/${id}/`);
  },
  /** POST /internal/schools/ – creates the SCHOOL login + school, sends WhatsApp + e-mail. Answer has `login`. */
  createSchool(data) {
    return api.post("/internal/schools/", data);
  },
  /** PATCH /internal/schools/{id}/ – details, parent_app_fee, licence_valid_till */
  updateSchool(id, data) {
    return api.patch(`/internal/schools/${id}/`, data);
  },
  /** POST /internal/schools/{id}/activate/  ·  /deactivate/ */
  setActive(id, active) {
    return api.post(`/internal/schools/${id}/${active ? "activate" : "deactivate"}/`, {});
  },
  /** POST /internal/schools/{id}/resend_login/ -> { mobile, password } */
  resendLogin(id) {
    return api.post(`/internal/schools/${id}/resend_login/`, {});
  },
  /** GET /internal/schools/{id}/stats/ */
  stats(id) {
    return api.get(`/internal/schools/${id}/stats/`);
  },
};
