export default function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
  label = "Pagination",
}) {
  if (totalPages < 2)
    return total === undefined ? null : (
      <p className="pagination-count" aria-live="polite">
        {total} résultat{total !== 1 ? "s" : ""}
      </p>
    );
  return (
    <nav className="pagination" aria-label={label}>
      <p aria-live="polite">
        Page <strong>{page}</strong> sur {totalPages}
        {total !== undefined && ` · ${total} résultats`}
      </p>
      <div>
        <button
          className="button button-secondary"
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Précédent
        </button>
        <button
          className="button button-secondary"
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Suivant
        </button>
      </div>
    </nav>
  );
}
