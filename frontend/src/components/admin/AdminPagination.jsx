export default function AdminPagination({ page, totalPages, total, onPageChange }) {
  if (!totalPages || totalPages < 2) return <p className="mt-6 text-sm" aria-live="polite">{total} résultat{total !== 1 ? "s" : ""}</p>;
  return (
    <nav className="mt-6 flex flex-wrap items-center justify-between gap-3" aria-label="Pagination">
      <p aria-live="polite">Page {page} sur {totalPages} · {total} résultat{total !== 1 ? "s" : ""}</p>
      <div className="admin-actions flex gap-2">
        <button className="admin-button secondary px-4 py-2 [border:1px_solid_var(--admin-ink)]" type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>Précédent</button>
        <button className="admin-button secondary px-4 py-2 [border:1px_solid_var(--admin-ink)]" type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>Suivant</button>
      </div>
    </nav>
  );
}
