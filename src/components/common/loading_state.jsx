export default function LoadingState({ text = "Loading…", compact = false, error, onRetry }) {
  if (error) {
    return (
      <div className={`state ${compact ? "state-compact" : ""}`}>
        <p className="state-error">{error}</p>
        {onRetry && (
          <button className="btn btn-ghost btn-sm" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    );
  }
  return (
    <div className={`state ${compact ? "state-compact" : ""}`} aria-busy="true">
      <span className="spinner" />
      <span>{text}</span>
    </div>
  );
}
