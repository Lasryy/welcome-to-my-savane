import { useEffect, useRef } from "react";
import Icon from "../../design-lab/Icon";

export function AdminField({ label, name, help, children }) {
  return (
    <div className="admin-field grid min-w-0 gap-2">
      <label htmlFor={name}>{label}</label>
      {children}
      {help && <p id={`${name}-help`} className="admin-help text-[12px] leading-[1.5]">{help}</p>}
    </div>
  );
}

export function AdminFeedback({ feedback }) {
  if (!feedback) {
    return null;
  }
  return (
    <p className={`admin-notice ${feedback.type === "error" ? "is-error" : "is-success"} mb-5 flex items-start gap-3 p-4 `}
      role={feedback.type === "error" ? "alert" : "status"}>
      <Icon name={feedback.type === "error" ? "close" : "check"} />
      {feedback.message}
    </p>
  );
}

export function AdminListState({ loading, error, empty, onRetry, children }) {
  if (loading) {
    return <p className="admin-state p-5 [border:1px_solid_var(--admin-rule)]" role="status">Chargement de la liste…</p>;
  }
  if (error) {
    return (
      <div className="admin-state p-5 [border:1px_solid_var(--admin-rule)]" role="alert">
        <p>{error}</p>
        <button type="button" className="admin-button secondary mt-4 inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" onClick={() => onRetry()}>Réessayer</button>
      </div>
    );
  }
  if (empty) {
    return <p className="admin-state p-5 [border:1px_solid_var(--admin-rule)]">Aucun résultat pour le moment.</p>;
  }
  return children;
}

export function AdminDeleteConfirmation({ name, pending, onConfirm, onCancel }) {
  return (
    <div className="admin-delete p-[14px] [border:1px_solid_var(--admin-ink)]" role="group" aria-label={`Confirmer la suppression de ${name}`}>
      <p>Supprimer « {name} » ? Cette action est définitive.</p>
      <div className="admin-actions mt-3 flex flex-wrap items-center gap-3">
        <button type="button" className="admin-button primary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" disabled={pending} onClick={onConfirm}>
          {pending ? "Suppression…" : "Confirmer la suppression"}
        </button>
        <button type="button" className="admin-button secondary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline" disabled={pending} onClick={onCancel}>Annuler</button>
      </div>
    </div>
  );
}

export function AdminModal({ title, description, onClose, children }) {
  const modalRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const modal = modalRef.current;
    const firstControl = modal?.querySelector("button:not(:disabled), a[href]");
    firstControl?.focus();

    function keepFocusInside(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      }
      if (event.key !== "Tab" || !modal) {
        return;
      }
      const controls = [...modal.querySelectorAll("button:not(:disabled), a[href]")];
      if (!controls.length) {
        return;
      }
      if (event.shiftKey && document.activeElement === controls[0]) {
        event.preventDefault();
        controls.at(-1).focus();
      } else if (!event.shiftKey && document.activeElement === controls.at(-1)) {
        event.preventDefault();
        controls[0].focus();
      }
    }

    document.addEventListener("keydown", keepFocusInside);
    return () => {
      document.removeEventListener("keydown", keepFocusInside);
      previousFocus?.focus?.();
    };
  }, []);

  return (
    <div
      className="admin-modal-backdrop fixed [inset:0] z-[50] grid [place-items:center] p-[20px] [background:rgb(37_42_70_/_58%)]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section ref={modalRef} className="admin-modal w-[min(100%,_540px)] max-h-[min(90svh,_760px)] overflow-auto p-[28px] [border:1px_solid_var(--admin-ink)] rounded-[0_18px_0_0] [background:var(--admin-paper)] text-[var(--admin-ink)]" role="alertdialog" aria-modal="true" aria-labelledby="admin-modal-title" aria-describedby="admin-modal-description" tabIndex={-1}>
        <p className="admin-eyebrow text-[12px] font-bold tracking-[.08em] pb-[12px]">WELCOME TO MY SAVANE · ADMIN</p>
        <h2 id="admin-modal-title">{title}</h2>
        <p id="admin-modal-description" className="admin-modal-description mt-[12px]! max-w-[55ch]">{description}</p>
        {children}
      </section>
    </div>
  );
}
