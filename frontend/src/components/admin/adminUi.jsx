import Modal from "../ui/Modal";
import Icon from "../../design-lab/Icon";

export function AdminField({ label, name, help, children }) {
  return (
    <div className="admin-field grid min-w-0 gap-2">
      <label htmlFor={name}>{label}</label>
      {children}
      {help && (
        <p id={`${name}-help`} className="admin-help text-[12px] leading-[1.5]">
          {help}
        </p>
      )}
    </div>
  );
}

export function AdminFeedback({ feedback }) {
  if (!feedback) {
    return null;
  }
  return (
    <p
      className={`admin-notice ${feedback.type === "error" ? "is-error" : "is-success"} mb-5 flex items-start gap-3 p-4 `}
      role={feedback.type === "error" ? "alert" : "status"}
    >
      <Icon name={feedback.type === "error" ? "close" : "check"} />
      {feedback.message}
    </p>
  );
}

export function AdminListState({ loading, error, empty, onRetry, children }) {
  if (loading) {
    return (
      <p
        className="admin-state p-5 [border:1px_solid_var(--admin-rule)]"
        role="status"
      >
        Chargement de la liste…
      </p>
    );
  }
  if (error) {
    return (
      <div
        className="admin-state p-5 [border:1px_solid_var(--admin-rule)]"
        role="alert"
      >
        <p>{error}</p>
        <button
          type="button"
          className="admin-button secondary mt-4 inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline"
          onClick={() => onRetry()}
        >
          Réessayer
        </button>
      </div>
    );
  }
  if (empty) {
    return (
      <p className="admin-state p-5 [border:1px_solid_var(--admin-rule)]">
        Aucun résultat pour le moment.
      </p>
    );
  }
  return children;
}

export function AdminDeleteConfirmation({
  name,
  pending,
  onConfirm,
  onCancel,
}) {
  return (
    <div
      className="admin-delete p-[14px] [border:1px_solid_var(--admin-ink)]"
      role="group"
      aria-label={`Confirmer la suppression de ${name}`}
    >
      <p>Supprimer « {name} » ? Cette action est définitive.</p>
      <div className="admin-actions mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="admin-button primary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline"
          disabled={pending}
          onClick={onConfirm}
        >
          {pending ? "Suppression…" : "Confirmer la suppression"}
        </button>
        <button
          type="button"
          className="admin-button secondary inline-flex min-h-10 items-center justify-center gap-2 px-5 py-3 text-[13px] font-bold [border:1px_solid_var(--admin-ink)] rounded-none no-underline"
          disabled={pending}
          onClick={onCancel}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

export function AdminModal({ title, description, onClose, children }) {
  return (
    <Modal title={title} description={description} onClose={onClose}>
      {children}
    </Modal>
  );
}
