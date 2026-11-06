// Admission enquiries. Backend: apps/admissions.
import { api } from "../lib/api_client";
import { crud, opts } from "../lib/crud";

export const ENQUIRY_STATUS = opts([["NEW", "New"], ["CONTACTED", "Contacted"], ["VISIT_SCHEDULED", "Visit scheduled"], ["VISITED", "Visited"], ["TEST_SCHEDULED", "Test / interaction scheduled"], ["APPROVED", "Approved"], ["CONVERTED", "Admitted"], ["LOST", "Lost"]]);
export const SOURCES = opts([["WALK_IN", "Walk-in"], ["PHONE", "Phone call"], ["WEBSITE", "Website"], ["REFERRAL", "Referral"], ["SOCIAL", "Social media"], ["NEWSPAPER", "Newspaper / hoarding"], ["OTHER", "Other"]]);
export const enquiries = crud("/admissions/enquiries/");

export const admissionsService = {
  enquiries,
  followUp: (id, body) => api.post(`/admissions/enquiries/${id}/follow_up/`, body),
  convert: (id, body) => api.post(`/admissions/enquiries/${id}/convert/`, body),
  pipeline: () => api.get("/admissions/enquiries/pipeline/"),
  dueToday: () => api.get("/admissions/enquiries/due_today/"),
};
