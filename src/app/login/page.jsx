import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/use_auth";
import { PATHS } from "../../lib/route_paths";

/** Sign-in pages: brand panel on the left, form on the right. */
export default function LoginPage() {
  const { user, ready, homePath } = useAuth();
  const location = useLocation();
  // signed in: only the set-password screen stays open (first login / change password)
  if (ready && user && location.pathname !== PATHS.activate) return <Navigate to={homePath} replace />;
  return (
    <div className="auth-shell">
      <section className="auth-brand">
        <img src="/logo.svg" alt="" width="56" height="56" />
        <h1>School ERP</h1>
        <p>One web panel for the school office and for our team. Teachers and parents use the mobile apps.</p>
        <ul>
          <li>Log in with the mobile number and password sent to you on WhatsApp</li>
          <li>Set your own password on the first login</li>
          <li>Forgot it? Get an OTP on WhatsApp and set a new one</li>
        </ul>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <Outlet />
        </div>
      </section>
    </div>
  );
}
