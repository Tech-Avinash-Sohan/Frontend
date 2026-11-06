import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { setSignedOutHandler, tokenStore } from "../lib/api_client";
import { authService } from "../services/auth_service";

export const AuthContext = createContext(null);
export const WEB_TYPES = ["SUPER_ADMIN", "SCHOOL"]; // teachers and parents use the mobile apps

/** Signed-in user (from /auth/login/ or /auth/me/) + next_step from the backend. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [nextStep, setNextStep] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSignedOutHandler(() => setUser(null));
    if (!tokenStore.get()) {
      setReady(true);
      return;
    }
    authService
      .me()
      .then((me) => {
        setUser(me);
        setNextStep(me.next_step);
      })
      .catch(() => tokenStore.clear())
      .finally(() => setReady(true));
  }, []);

  /** Returns { user, next_step }. Teachers / parents are refused here: they use the mobile apps. */
  const signIn = useCallback(async (mobile, password) => {
    const res = await authService.login(mobile, password);
    const types = res.user.user_type || [];
    if (!types.some((t) => WEB_TYPES.includes(t))) {
      await authService.logout();
      const err = new Error("Teachers and parents use the mobile app. This web panel is for schools and our team.");
      err.data = { detail: err.message };
      throw err;
    }
    setUser(res.user);
    setNextStep(res.next_step);
    return res;
  }, []);

  const changePassword = useCallback(async (oldPw, newPw) => {
    await authService.changePassword(oldPw, newPw);
    setUser(null); // the backend signs out every device: log in again with the new password
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const types = user?.user_type || [];
  const value = useMemo(
    () => ({
      user,
      ready,
      nextStep,
      isSuperAdmin: types.includes("SUPER_ADMIN"),
      isSchool: types.includes("SCHOOL"),
      isFullAccess: types.includes("SCHOOL") || types.includes("SUPER_ADMIN"),
      mustChangePassword: !!user?.must_change_password,
      homePath: types.includes("SUPER_ADMIN") ? "/internal" : "/dashboard",
      signIn,
      changePassword,
      signOut,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, ready, nextStep, signIn, changePassword, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
