const pool = require("../db/pool");

function parseAdId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function getFavorites(req, res) {
  try {
    const result = await pool.query(
      `SELECT ads.id, ads.title, ads.short_description, ads.description, ads.location,
              ads.salary_min, ads.salary_max, ads.salary_period, ads.contract_type,
              ads.working_time, ads.status, ads.created_at,
              companies.id AS company_id, companies.name AS company_name,
              companies.logo_url AS company_logo_url,
              categories.id AS category_id, categories.name AS category_name,
              favorite_ads.created_at AS favorited_at
       FROM favorite_ads
       JOIN ads ON ads.id = favorite_ads.ad_id
       JOIN companies ON companies.id = ads.company_id
       LEFT JOIN categories ON categories.id = ads.category_id
       WHERE favorite_ads.person_id = $1
       ORDER BY favorite_ads.created_at DESC, ads.id DESC`,
      [req.session.userId],
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error while fetching candidate favorites:", error);
    return res.status(500).json({ message: "Impossible de charger les favoris." });
  }
}

async function addFavorite(req, res) {
  const adId = parseAdId(req.params.adId);
  if (!adId) return res.status(400).json({ message: "L’identifiant de l’offre est invalide." });
  try {
    const ad = await pool.query("SELECT id FROM ads WHERE id = $1 AND status = 'published'", [adId]);
    if (!ad.rowCount) return res.status(404).json({ message: "Offre publiée introuvable." });
    await pool.query(
      "INSERT INTO favorite_ads (person_id, ad_id) VALUES ($1, $2) ON CONFLICT (person_id, ad_id) DO NOTHING",
      [req.session.userId, adId],
    );
    return res.status(204).end();
  } catch (error) {
    console.error("Error while saving candidate favorite:", error);
    return res.status(500).json({ message: "Impossible d’enregistrer ce favori." });
  }
}

async function removeFavorite(req, res) {
  const adId = parseAdId(req.params.adId);
  if (!adId) return res.status(400).json({ message: "L’identifiant de l’offre est invalide." });
  try {
    await pool.query("DELETE FROM favorite_ads WHERE person_id = $1 AND ad_id = $2", [req.session.userId, adId]);
    return res.status(204).end();
  } catch (error) {
    console.error("Error while removing candidate favorite:", error);
    return res.status(500).json({ message: "Impossible de retirer ce favori." });
  }
}

module.exports = { getFavorites, addFavorite, removeFavorite };
