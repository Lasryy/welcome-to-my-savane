const pool = require("../db/pool");

const PUBLIC_AD_SELECT = `
  SELECT
    ads.id, ads.title, ads.short_description, ads.description, ads.location,
    ads.salary_min, ads.salary_max, ads.salary_period, ads.contract_type,
    ads.working_time, ads.status, ads.created_at,
    companies.id AS company_id, companies.name AS company_name,
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
  try {
    const result = await pool.query(
      `${PUBLIC_AD_SELECT} WHERE ads.status = $1 ORDER BY ads.created_at DESC`,
      ["published"],
    );
    return res.status(200).json(result.rows.map(addSalaryLabel));
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
