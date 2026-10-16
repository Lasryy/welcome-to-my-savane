const pool = require("../db/pool");
const { parseId } = require("./admin_validation");
const { parsePagination, paginated } = require("./pagination");
const { validateAd } = require("./admin_ads_controller");

const STATUSES = new Set(["sent", "in_progress", "technical_test", "accepted", "rejected"]);
const AD_SELECT = `SELECT ads.id, ads.title, ads.short_description, ads.description,
  ads.location, ads.company_id, companies.name AS company_name, ads.category_id,
  categories.name AS category_name, ads.salary_min, ads.salary_max, ads.salary_period,
  ads.contract_type, ads.working_time, ads.status, ads.created_at
  FROM ads JOIN companies ON companies.id = ads.company_id
  LEFT JOIN categories ON categories.id = ads.category_id`;

async function getCompanyProfile(req, res) {
  try {
    const result = await pool.query("SELECT id, name, location, logo_url FROM companies WHERE id = $1", [req.companyId]);
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error while loading company profile:", error);
    return res.status(500).json({ message: "Impossible de charger l’entreprise." });
  }
}

async function getCompanyAds(req, res) {
  const pagination = parsePagination(req.query);
  if (pagination.error) return res.status(400).json({ message: pagination.error });
  const { page, pageSize, offset } = pagination.value;
  const status = req.query.status || "all";
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!new Set(["all", "published", "closed"]).has(status) || q.length > 200 ||
      (req.query.q !== undefined && typeof req.query.q !== "string")) {
    return res.status(400).json({ message: "Les filtres d’offres sont invalides." });
  }
  const values = [req.companyId];
  const filters = ["ads.company_id = $1"];
  if (status !== "all") { values.push(status); filters.push(`ads.status = $${values.length}`); }
  if (q) { values.push(`%${q}%`); filters.push(`(ads.title ILIKE $${values.length} OR COALESCE(ads.location, '') ILIKE $${values.length})`); }
  const where = `WHERE ${filters.join(" AND ")}`;
  try {
    const count = await pool.query(`SELECT COUNT(*)::int AS total FROM ads ${where}`, values);
    const result = await pool.query(`${AD_SELECT} ${where} ORDER BY ads.created_at DESC, ads.id DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, pageSize, offset]);
    return res.status(200).json(paginated(result.rows, page, pageSize, count.rows[0].total));
  } catch (error) {
    console.error("Error while fetching company ads:", error);
    return res.status(500).json({ message: "Impossible de charger les offres." });
  }
}

async function createCompanyAd(req, res) {
  const { value, error } = validateAd({ ...req.body, company_id: req.companyId });
  if (error) return res.status(400).json({ message: error });
  const fields = ["title", "short_description", "description", "location", "company_id", "category_id", "salary_min", "salary_max", "salary_period", "contract_type", "working_time", "status"];
  const values = fields.map((field) => value[field] ?? null);
  try {
    const created = await pool.query(`INSERT INTO ads (${fields.join(", ")}) VALUES (${fields.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING id`, values);
    const result = await pool.query(`${AD_SELECT} WHERE ads.id = $1 AND ads.company_id = $2`, [created.rows[0].id, req.companyId]);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23503") return res.status(409).json({ message: "La catégorie sélectionnée n’existe plus." });
    console.error("Error while creating company ad:", error);
    return res.status(500).json({ message: "Impossible de créer l’offre." });
  }
}

async function updateCompanyAd(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ message: "L’identifiant de l’offre est invalide." });
  const { value, error } = validateAd({ ...req.body, company_id: req.companyId }, { partial: true });
  if (error) return res.status(400).json({ message: error });
  delete value.company_id;
  const fields = Object.keys(value);
  if (!fields.length) return res.status(400).json({ message: "Indiquez au moins un champ à modifier." });
  const values = fields.map((field) => value[field]);
  values.push(id, req.companyId);
  try {
    const updated = await pool.query(`UPDATE ads SET ${fields.map((field, i) => `${field} = $${i + 1}`).join(", ")} WHERE id = $${fields.length + 1} AND company_id = $${fields.length + 2} RETURNING id`, values);
    if (!updated.rowCount) return res.status(404).json({ message: "Offre introuvable." });
    const result = await pool.query(`${AD_SELECT} WHERE ads.id = $1 AND ads.company_id = $2`, [id, req.companyId]);
    return res.status(200).json(result.rows[0]);
  } catch (requestError) {
    if (requestError.code === "23503") return res.status(409).json({ message: "La catégorie sélectionnée n’existe plus." });
    console.error("Error while updating company ad:", requestError);
    return res.status(500).json({ message: "Impossible de modifier l’offre." });
  }
}

async function getCompanyApplications(req, res) {
  const pagination = parsePagination(req.query);
  if (pagination.error) return res.status(400).json({ message: pagination.error });
  const { page, pageSize, offset } = pagination.value;
  const status = req.query.status || "all";
  if (!new Set(["all", ...STATUSES]).has(status)) return res.status(400).json({ message: "Le filtre de statut est invalide." });
  const values = [req.companyId];
  const filters = ["ads.company_id = $1"];
  if (status !== "all") { values.push(status); filters.push(`applications.status = $${values.length}`); }
  const adId = req.query.ad_id ? parseId(req.query.ad_id) : null;
  if (req.query.ad_id && adId === null) return res.status(400).json({ message: "Le filtre d’offre est invalide." });
  if (adId !== null) { values.push(adId); filters.push(`applications.ad_id = $${values.length}`); }
  const where = `WHERE ${filters.join(" AND ")}`;
  try {
    const count = await pool.query(`SELECT COUNT(*)::int AS total FROM applications JOIN ads ON ads.id = applications.ad_id ${where}`, values);
    const result = await pool.query(`SELECT applications.id, applications.person_id, applications.ad_id, ads.title, people.first_name, people.last_name, applications.status, applications.created_at FROM applications JOIN ads ON ads.id = applications.ad_id JOIN people ON people.id = applications.person_id ${where} ORDER BY applications.created_at DESC, applications.id DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, pageSize, offset]);
    return res.status(200).json(paginated(result.rows, page, pageSize, count.rows[0].total));
  } catch (error) {
    console.error("Error while fetching company applications:", error);
    return res.status(500).json({ message: "Impossible de charger les candidatures." });
  }
}

async function getCompanyApplication(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ message: "L’identifiant de la candidature est invalide." });
  try {
    const result = await pool.query(`SELECT applications.id, applications.person_id, applications.ad_id, ads.title, companies.name AS company_name, ads.location, applications.message, applications.submitted_snapshot, applications.cv_document_id, cv_documents.original_name AS cv_original_name, cv_documents.created_at AS cv_created_at, applications.status, applications.created_at, people.first_name, people.last_name, people.email, people.phone FROM applications JOIN ads ON ads.id = applications.ad_id JOIN companies ON companies.id = ads.company_id JOIN people ON people.id = applications.person_id LEFT JOIN cv_documents ON cv_documents.id = applications.cv_document_id AND cv_documents.person_id = applications.person_id WHERE applications.id = $1 AND ads.company_id = $2`, [id, req.companyId]);
    if (!result.rowCount) return res.status(404).json({ message: "Candidature introuvable." });
    const row = result.rows[0];
    const snapshot = row.submitted_snapshot;
    let projects = snapshot?.projects || [];
    let experiences = snapshot?.experiences || [];
    if (!snapshot) {
      const [projectResult, experienceResult] = await Promise.all([
        pool.query(`SELECT projects.id, projects.title, projects.description, projects.project_url, projects.repository_url FROM application_projects JOIN projects ON projects.id = application_projects.project_id WHERE application_projects.application_id = $1 ORDER BY projects.id`, [id]),
        pool.query(`SELECT experiences.id, experiences.company_name, experiences.job_title, experiences.description, experiences.start_date, experiences.end_date FROM application_experiences JOIN experiences ON experiences.id = application_experiences.experience_id WHERE application_experiences.application_id = $1 ORDER BY experiences.id`, [id]),
      ]);
      projects = projectResult.rows;
      experiences = experienceResult.rows;
    }
    const cv = row.cv_document_id ? { id: row.cv_document_id, original_name: row.cv_original_name || snapshot?.cv?.original_name || "CV envoyé", created_at: row.cv_created_at || snapshot?.cv?.created_at || null, file_url: `/api/cv-documents/${row.cv_document_id}/file` } : null;
    return res.status(200).json({ id: row.id, ad_id: row.ad_id, title: row.title, company_name: row.company_name, location: row.location, status: row.status, created_at: row.created_at, snapshot_available: Boolean(snapshot), person: snapshot?.person || { first_name: row.first_name, last_name: row.last_name, email: row.email, phone: row.phone }, person_is_current: !snapshot, message: snapshot?.message ?? row.message, projects, experiences, cv });
  } catch (error) {
    console.error("Error while fetching company application dossier:", error);
    return res.status(500).json({ message: "Impossible de charger le dossier de candidature." });
  }
}

async function updateCompanyApplicationStatus(req, res) {
  if (req.isAdminCompanyView) {
    return res.status(403).json({ message: "Utilise la fiche d’administration pour confirmer cette modification." });
  }
  const id = parseId(req.params.id);
  const status = req.body?.status;
  if (id === null) return res.status(400).json({ message: "L’identifiant de la candidature est invalide." });
  if (Object.keys(req.body || {}).length !== 1 || !STATUSES.has(status)) return res.status(400).json({ message: "Le statut demandé n’est pas autorisé." });
  try {
    const result = await pool.query(`UPDATE applications SET status = $1 WHERE id = $2 AND EXISTS (SELECT 1 FROM ads WHERE ads.id = applications.ad_id AND ads.company_id = $3) RETURNING id, status`, [status, id, req.companyId]);
    if (!result.rowCount) return res.status(404).json({ message: "Candidature introuvable." });
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error while updating company application:", error);
    return res.status(500).json({ message: "Impossible de modifier le statut." });
  }
}

module.exports = { getCompanyProfile, getCompanyAds, createCompanyAd, updateCompanyAd, getCompanyApplications, getCompanyApplication, updateCompanyApplicationStatus };
