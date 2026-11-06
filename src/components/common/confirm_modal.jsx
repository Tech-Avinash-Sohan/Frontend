import { useEffect } from "react";

/**
 * <ConfirmModal open title message confirmText danger busy onConfirm onCancel>
 *   optional extra fields (e.g. a reason box)
 * </ConfirmModal>
 */
export default function ConfirmModal({ open, title, message, confirmText = "Confirm", cancelText = "Cancel", danger = false, busy = false, confirmDisabled = false, onConfirm, onCancel, children, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onCancel?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <div className={`modal ${wide ? "modal-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        {message && <p className="modal-message">{message}</p>}
        {children && <div className="modal-body">{children}</div>}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={busy}>
            {cancelText}
          </button>
          {onConfirm && (
            <button className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm} disabled={busy || confirmDisabled}>
              {busy ? "Please wait…" : confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
