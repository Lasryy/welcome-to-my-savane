// Only these known values can be used in an SQL ORDER BY clause.
const ANNUAL_SALARY = "COALESCE(ads.salary_min, ads.salary_max)::bigint * CASE WHEN ads.salary_period = 'month' THEN 12 ELSE 1 END";
const SORTS = {
  recent: "ads.created_at DESC, ads.id DESC",
  salary_desc: `${ANNUAL_SALARY} DESC NULLS LAST, ads.created_at DESC, ads.id DESC`,
  salary_asc: `${ANNUAL_SALARY} ASC NULLS LAST, ads.created_at DESC, ads.id DESC`,
};
const CONTRACTS = ["internship", "apprenticeship", "permanent", "fixed_term", "other"];

function readSearch(query) {
  const allowed = ["q", "location", "company_id", "category_id", "contract_type", "sort", "page", "page_size"];
  for (const [key, value] of Object.entries(query)) {
    if (!allowed.includes(key) || typeof value !== "string" || !value.trim()) {
      return { error: `Le paramètre ${key} est invalide.` };
    }
  }

  const search = { ...query, sort: query.sort ?? "recent", page: 1, page_size: 12 };
  for (const key of ["q", "location"]) {
    if (query[key] !== undefined) {
      search[key] = query[key].trim();
      if (search[key].length > 255) {
        return { error: `Le paramètre ${key} ne doit pas dépasser 255 caractères.` };
      }
    }
  }
  for (const key of ["company_id", "category_id", "page", "page_size"]) {
    if (query[key] !== undefined) {
      const number = Number(query[key]);
      const maximum = key === "page_size" ? 100 : 2147483647;
      if (!/^\d+$/.test(query[key]) || !Number.isInteger(number) || number < 1 || number > maximum) {
        return { error: `Le paramètre ${key} doit être un entier entre 1 et ${maximum}.` };
      }
      search[key] = number;
    }
  }
  if (!Object.hasOwn(SORTS, search.sort)) {
    return { error: "Le tri doit être recent, salary_asc ou salary_desc." };
  }
  if (search.contract_type && !CONTRACTS.includes(search.contract_type)) {
    return { error: "Le type de contrat est invalide." };
  }
  return { value: search };
}

function buildFilters(search) {
  const conditions = ["ads.status = 'published'"];
  const values = [];
  function add(condition, value) {
    values.push(value);
    conditions.push(condition.replace("?", `$${values.length}`));
  }
  // Search LIKE special characters as regular text.
  const pattern = (text) => `%${text.replace(/[\\%_]/g, "\\$&")}%`;
  if (search.q) {
    add("CONCAT_WS(' ', ads.title, ads.short_description, ads.description, companies.name, ads.location) ILIKE ?", pattern(search.q));
  }
  if (search.location) add("ads.location ILIKE ?", pattern(search.location));
  if (search.company_id) add("ads.company_id = ?", search.company_id);
  if (search.category_id) add("ads.category_id = ?", search.category_id);
  if (search.contract_type) add("ads.contract_type = ?", search.contract_type);
  return { where: `WHERE ${conditions.join(" AND ")}`, values };
}

module.exports = { readSearch, buildFilters, SORTS };
