// WhatsApp / e-mail / SMS log. Backend: apps/notifications.
import { api } from "../lib/api_client";

export const notificationsService = {
  /** GET /notifications/logs/?event=&channel=&status=&search=&page= */
  logs(params = {}) {
    return api.get("/notifications/logs/", { params });
  },
};
