const pool = require("../db/pool");
const { isRecord, parseId } = require("./admin_validation");

const APPLICATION_STATUSES = new Set([
  "sent",
  "in_progress",
  "technical_test",
  "accepted",
  "rejected",
]);

// Saves an application for the logged-in person.
async function createApplication(req, res) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      error: "Connecte-toi pour postuler à une offre.",
    });
  }

  // Get the applicant's identity from the session, never from the submitted form.
  const personId = req.session.userId;
  const adId = Number(req.body?.ad_id);
  const message =
    typeof req.body?.message === "string" ? req.body.message.trim() : "";

  if (!Number.isSafeInteger(adId) || adId <= 0) {
    return res.status(400).json({ error: "L’offre sélectionnée est invalide." });
  }

  if (!message) {
    return res.status(400).json({
      error: "Écris un message de motivation avant d’envoyer ta candidature.",
    });
  }

  if (message.length > 5000) {
    return res.status(400).json({
      error: "Le message ne peut pas dépasser 5 000 caractères.",
    });
  }

  try {
    // The application is inserted only if the offer is still published.
    const result = await pool.query(
      `INSERT INTO applications (person_id, ad_id, message)
       SELECT $1, ads.id, $3
       FROM ads
       WHERE ads.id = $2 AND ads.status = 'published'
       RETURNING id, ad_id, message, status, created_at`,
      [personId, adId, message],
    );

    if (result.rows.length === 0) {
      const adResult = await pool.query(
        "SELECT status FROM ads WHERE id = $1",
        [adId],
      );

      if (adResult.rows.length === 0) {
        return res.status(404).json({ error: "Cette offre est introuvable." });
      }

      return res.status(409).json({
        error: "Cette offre est fermée. Tu ne peux plus y postuler.",
      });
    }

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    // The database UNIQUE constraint prevents a second application to the same offer.
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Tu as déjà envoyé une candidature pour cette offre.",
      });
    }

    console.error("Error while creating application:", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
}

// Returns only the applications owned by the account in the current session.
async function getMyApplications(req, res) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Connecte-toi pour voir tes candidatures." });
  }

  try {
    const result = await pool.query(
      `SELECT applications.id, applications.ad_id, ads.title,
              companies.name AS company_name, ads.location,
              applications.status, applications.created_at
       FROM applications
       JOIN ads ON ads.id = applications.ad_id
       JOIN companies ON companies.id = ads.company_id
       WHERE applications.person_id = $1
       ORDER BY applications.created_at DESC, applications.id DESC`,
      [req.session.userId],
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error while fetching personal applications:", error);
    return res.status(500).json({ error: "Impossible de charger tes candidatures." });
  }
}

// Lists applications for the admin page, including the candidate's name.
async function getAdminApplications(req, res) {
  try {
    const result = await pool.query(
      `SELECT applications.id, applications.ad_id, ads.title,
              companies.name AS company_name,
              people.first_name, people.last_name, people.email,
              applications.status, applications.created_at
       FROM applications
       JOIN people ON people.id = applications.person_id
       JOIN ads ON ads.id = applications.ad_id
       JOIN companies ON companies.id = ads.company_id
       ORDER BY applications.created_at DESC, applications.id DESC`,
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error while fetching admin applications:", error);
    return res.status(500).json({ message: "Impossible de charger les candidatures." });
  }
}

// Changes an application status after checking its ID and allowed values.
async function updateApplicationStatus(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "L’identifiant de la candidature est invalide." });
  }

  if (!isRecord(req.body) || Object.keys(req.body).length !== 1) {
    return res.status(400).json({ message: "Indique uniquement le nouveau statut." });
  }

  const { status } = req.body;
  if (!APPLICATION_STATUSES.has(status)) {
    return res.status(400).json({ message: "Le statut demandé n’est pas autorisé." });
  }

  try {
    const result = await pool.query(
      `UPDATE applications
       SET status = $1
       WHERE id = $2
       RETURNING id, status`,
      [status, id],
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: "Candidature introuvable." });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error while updating application status:", error);
    return res.status(500).json({ message: "Impossible de modifier le statut." });
  }
}

module.exports = {
  createApplication,
  getMyApplications,
  getAdminApplications,
  updateApplicationStatus,
};
