import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/use_auth";
import { useSchool } from "../../context/school_context";
import { PATHS } from "../../lib/route_paths";

const TYPE_LABEL = { SUPER_ADMIN: "Our team", SCHOOL: "School login", TEACHER: "Teacher", STAFF: "Staff", PARENT: "Parent" };

export default function Topbar({ onMenu }) {
  const { user, signOut, isSuperAdmin } = useAuth();
  const { currentYear } = useSchool();
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();
  const initials = (user?.name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("");

  const logout = async () => {
    await signOut();
    navigate(PATHS.login, { replace: true });
  };

  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Open menu">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path fill="currentColor" d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
        </svg>
      </button>
      <div className="topbar-year">
        {isSuperAdmin ? (
          <>Internal dashboard</>
        ) : (
          <>
            <span className="dot" /> Academic year <strong>{currentYear?.name || "not set"}</strong>
          </>
        )}
      </div>
      <div className="topbar-right">
        {isSuperAdmin ? (
          <button className="btn btn-primary btn-sm hide-sm" onClick={() => navigate(PATHS.internalSchoolForm())}>
            + Create school
          </button>
        ) : (
          <>
            <button className="btn btn-primary btn-sm hide-sm" onClick={() => navigate(PATHS.newAdmission)}>
              + Admission
            </button>
            <button className="btn btn-ghost btn-sm hide-sm" onClick={() => navigate(PATHS.staffForm())}>
              + Teacher / staff
            </button>
          </>
        )}
        <div className="user-menu">
          <button className="user-chip" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
            <span className="avatar">{initials}</span>
            <span className="user-text">
              <strong>{user?.name}</strong>
              <small>{(user?.user_type || []).map((t) => TYPE_LABEL[t] || t).join(", ")}</small>
            </span>
          </button>
          {menu && (
            <div className="dropdown" onMouseLeave={() => setMenu(false)}>
              <div className="dropdown-head">
                {user?.mobile && <small>Mobile {user.mobile}</small>}
              </div>
              {!isSuperAdmin && <button onClick={() => navigate(PATHS.schoolProfile)}>School profile</button>}
              <button onClick={() => navigate(PATHS.activate)}>Change password</button>
              <button onClick={logout} className="danger-text">
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
