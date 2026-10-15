const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function parsePagination(query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const pageSize = query.page_size === undefined ? DEFAULT_PAGE_SIZE : Number(query.page_size);
  if (!Number.isSafeInteger(page) || page < 1) return { error: "Le numéro de page est invalide." };
  if (!Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    return { error: `La taille de page doit être comprise entre 1 et ${MAX_PAGE_SIZE}.` };
  }
  return { value: { page, pageSize, offset: (page - 1) * pageSize } };
}

function paginated(items, page, pageSize, total) {
  return {
    items,
    page,
    page_size: pageSize,
    total,
    total_pages: Math.ceil(total / pageSize),
  };
}

module.exports = { parsePagination, paginated };
