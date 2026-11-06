// Parent app yearly fee. Backend: apps/payments.
import { api } from "../lib/api_client";

export const paymentsService = {
  /** GET /payments/parent-payments/?status=&school=&search=&page=  (our team: all schools · school: its own) */
  list(params = {}) {
    return api.get("/payments/parent-payments/", { params });
  },
  /** POST /payments/parent-payments/activate_manually/ { parent, note } – school took cash */
  activateManually(parent, note = "") {
    return api.post("/payments/parent-payments/activate_manually/", { parent, note });
  },
};
