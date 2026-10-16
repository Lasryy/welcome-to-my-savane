import { useEffect, useId, useRef } from "react";
import UiIcon from "./UiIcon";

/** Native dialogs manage keyboard focus, Escape, and the overlay layer. */
export default function Modal({
  title,
  description,
  onClose,
  children,
  className = "",
}) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={`ui-dialog ${className}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-surface">
        <header className="dialog-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p id={descriptionId}>{description}</p>}
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Fermer la fenêtre"
            onClick={onClose}
          >
            <UiIcon name="close" />
          </button>
        </header>
        <div className="dialog-content">{children}</div>
      </div>
    </dialog>
  );
}
