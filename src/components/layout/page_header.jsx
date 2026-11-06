import { Link } from "react-router-dom";

/** <PageHeader title subtitle code="W03" back={{ to, label }} actions={<button/>} /> */
export default function PageHeader({ title, subtitle, code, back, actions }) {
  return (
    <header className="page-header">
      <div>
        {back && (
          <Link to={back.to} className="back-link">
            ← {back.label || "Back"}
          </Link>
        )}
        <h1>
          {title}
          {code && <span className="screen-code">{code}</span>}
        </h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}
