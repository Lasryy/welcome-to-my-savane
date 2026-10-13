const pool = require("../db/pool");
const { readSearch, buildFilters, SORTS } = require("./ads_search");

const PUBLIC_AD_SELECT = `
  SELECT
    ads.id, ads.title, ads.short_description, ads.description, ads.location,
    ads.salary_min, ads.salary_max, ads.salary_period, ads.contract_type,
    ads.working_time, ads.status, ads.created_at,
    companies.id AS company_id, companies.name AS company_name,
    companies.description AS company_description, companies.website AS company_website,
    companies.location AS company_location, companies.logo_url AS company_logo_url,
    categories.id AS category_id, categories.name AS category_name
  FROM ads
  JOIN companies ON companies.id = ads.company_id
  LEFT JOIN categories ON categories.id = ads.category_id
`;

function addSalaryLabel(ad) {
  const { salary_min: min, salary_max: max, salary_period: period } = ad;
  const format = (amount) => new Intl.NumberFormat("fr-FR").format(amount);
  let unit = "an";
  if (period === "month") {
    unit = "mois";
  }

  if (min == null && max == null) {
    return { ...ad, salary: "Salaire non renseigné" };
  }

  let range;
  if (min == null) {
    range = `Jusqu’à ${format(max)}`;
  } else if (max == null) {
    range = `À partir de ${format(min)}`;
  } else if (min === max) {
    range = format(min);
  } else {
    range = `${format(min)} – ${format(max)}`;
  }

  return { ...ad, salary: `${range} € / ${unit}` };
}

function sendServerError(res, error) {
  console.error("Error while querying ads:", error);
  return res.status(500).json({ message: "Une erreur interne est survenue." });
}

// Return published ads with company and category names for the public job board.
async function getAds(req, res) {
  const { value: search, error } = readSearch(req.query);
  if (error) return res.status(400).json({ message: error });

  const { where, values } = buildFilters(search);
  // Le tableau historique reste disponible ; page ou page_size active la pagination.
  const paginated = req.query.page !== undefined || req.query.page_size !== undefined;
  try {
    let total;
    let pagination = "";
    if (paginated) {
      const count = await pool.query(
        `SELECT COUNT(*)::integer AS total FROM ads JOIN companies ON companies.id = ads.company_id ${where}`,
        values,
      );
      total = count.rows[0].total;
      pagination = `LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
      values.push(search.page_size, (search.page - 1) * search.page_size);
    }
    const result = await pool.query(
      `${PUBLIC_AD_SELECT} ${where} ORDER BY ${SORTS[search.sort]} ${pagination}`,
      values,
    );
    const ads = result.rows.map(addSalaryLabel);
    if (!paginated) return res.status(200).json(ads);
    return res.status(200).json({
      ads, total, page: search.page, page_size: search.page_size,
      total_pages: Math.ceil(total / search.page_size),
    });
  } catch (error) {
    return sendServerError(res, error);
  }
}

// Return one published ad by id for its detail page.
async function getAdsById(req, res) {
  const id = Number(req.params.id);
  const isValidId = Number.isSafeInteger(id) && id > 0;
  if (!isValidId) {
    return res.status(400).json({ message: "L’identifiant de l’offre est invalide." });
  }

  try {
    const result = await pool.query(
      `${PUBLIC_AD_SELECT} WHERE ads.id = $1 AND ads.status = $2`,
      [id, "published"],
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: "Offre introuvable." });
    }
    return res.status(200).json(addSalaryLabel(result.rows[0]));
  } catch (error) {
    return sendServerError(res, error);
  }
}

module.exports = { getAds, getAdsById };
