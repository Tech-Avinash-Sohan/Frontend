// Sign-in for the web panel (SUPER_ADMIN = our internal dashboard, SCHOOL = school panel).
// Backend: apps/authentication (mobile + password -> OAuth2 Bearer token, next_step tells which screen opens).
import { api, tokenStore } from "../lib/api_client";

export const authService = {
  /** POST /auth/login/ { mobile, password } -> { access, refresh, user, next_step } */
  async login(mobile, password) {
    const data = await api.post("/auth/login/", { mobile, password }, { auth: false });
    tokenStore.set({ access: data.access, refresh: data.refresh });
    return data;
  },

  /** GET /auth/me/ -> user + next_step */
  me() {
    return api.get("/auth/me/");
  },

  /** PATCH /auth/me/ { first_name, last_name, email, language } */
  updateMe(data) {
    return api.patch("/auth/me/", data);
  },

  /** POST /auth/password/change/ { old_password, new_password } – signs out every device */
  async changePassword(old_password, new_password) {
    const data = await api.post("/auth/password/change/", { old_password, new_password });
    tokenStore.clear();
    return data;
  },

  /** POST /auth/password/forgot/ { mobile } – OTP on WhatsApp / SMS */
  forgotPassword(mobile) {
    return api.post("/auth/password/forgot/", { mobile }, { auth: false });
  },

  /** POST /auth/password/reset/ { mobile, otp, new_password } */
  resetPassword(mobile, otp, new_password) {
    return api.post("/auth/password/reset/", { mobile, otp, new_password }, { auth: false });
  },

  /** POST /auth/logout/ */
  async logout() {
    try {
      await api.post("/auth/logout/", {});
    } finally {
      tokenStore.clear();
    }
  },
};
