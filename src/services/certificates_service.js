// Certificates. Backend: apps/certificates.
import { api, buildUrl, tokenStore } from "../lib/api_client";
import { crud, opts } from "../lib/crud";

export const CERT_TYPES = opts([["BONAFIDE", "Bonafide certificate"], ["LEAVING", "School leaving certificate (LC / TC)"], ["CHARACTER", "Character certificate"], ["STUDY", "Study certificate"], ["FEE", "Fee paid certificate"], ["BIRTH_EXTRACT", "Birth date extract (GR)"], ["OTHER", "Other"]]);
export const templates = crud("/certificates/templates/");
export const requests = crud("/certificates/requests/");
export const issued = crud("/certificates/issued/");

export const certificatesService = {
  templates, requests, issued,
  loadDefaults: () => api.post("/certificates/templates/load_defaults/", {}),
  issue: (body) => api.post("/certificates/issued/issue/", body),
  duplicate: (id) => api.post(`/certificates/issued/${id}/duplicate/`, {}),
  cancel: (id) => api.post(`/certificates/issued/${id}/cancel/`, {}),
  verify: (token) => api.get("/certificates/issued/verify/", { params: { token } }),
  /** Opens the printable HTML in a new tab (fetched with the token). */
  async print(id) {
    const w = window.open("", "_blank");
    const res = await fetch(buildUrl(`/certificates/issued/${id}/print/`), { headers: { Authorization: `Bearer ${tokenStore.get()?.access}` } });
    const html = await res.text();
    if (w) { w.document.open(); w.document.write(html); w.document.close(); }
  },
};
