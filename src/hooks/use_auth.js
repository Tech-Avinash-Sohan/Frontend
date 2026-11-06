import { useContext } from "react";
import { AuthContext } from "../context/auth_context";

/** const { user, signIn, signOut, isSchool, isSuperAdmin, homePath } = useAuth(); */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
