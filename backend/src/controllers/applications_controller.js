const pool = require("../db/pool");
const { isRecord, parseId } = require("./admin_validation");

const APPLICATION_STATUSES = new Set([
  "sent",
  "in_progress",
  "technical_test",
  "accepted",
  "rejected",
]);

function readSelectedIds(value, fieldName) {
  if (value === undefined) {
    return { value: [] };
  }

  if (!Array.isArray(value)) {
    return { error: `${fieldName} doit être une liste d’identifiants.` };
  }

  const ids = value.map(Number);
  if (
    ids.some((id) => !Number.isSafeInteger(id) || id <= 0) ||
    new Set(ids).size !== ids.length
  ) {
    return { error: `${fieldName} contient un identifiant invalide ou en double.` };
  }

  return { value: ids };
}

// Counts the current account's applications using the Paris calendar day.
async function getTodayApplicationCount(req, res) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Connecte-toi pour voir tes candidatures." });
  }

  try {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM applications
       WHERE person_id = $1
         AND (created_at AT TIME ZONE 'Europe/Paris')::date =
             (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Paris')::date`,
      [req.session.userId],
    );
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error while counting today's applications:", error);
    return res.status(500).json({ error: "Impossible de compter tes candidatures." });
  }
}

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
  const rawCvDocumentId = req.body?.cv_document_id;
  const cvDocumentId = rawCvDocumentId === undefined || rawCvDocumentId === null || rawCvDocumentId === ""
    ? null
    : Number(rawCvDocumentId);
  const message =
    typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const selectedProjects = readSelectedIds(req.body?.project_ids, "project_ids");
  const selectedExperiences = readSelectedIds(
    req.body?.experience_ids,
    "experience_ids",
  );

  if (!Number.isSafeInteger(adId) || adId <= 0) {
    return res.status(400).json({ error: "L’offre sélectionnée est invalide." });
  }

  if (cvDocumentId !== null && (!Number.isSafeInteger(cvDocumentId) || cvDocumentId <= 0)) {
    return res.status(400).json({ error: "Le CV choisi est invalide." });
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

  if (selectedProjects.error || selectedExperiences.error) {
    return res.status(400).json({
      error: selectedProjects.error || selectedExperiences.error,
    });
  }

  const client = await pool.connect();
  let transactionStarted = false;
  try {
    await client.query("BEGIN");
    transactionStarted = true;

    // Only profile items owned by the logged-in person can be attached.
    const projectResult = await client.query(
      "SELECT id FROM projects WHERE person_id = $1 AND id = ANY($2::int[])",
      [personId, selectedProjects.value],
    );
    if (projectResult.rowCount !== selectedProjects.value.length) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(400).json({
        error: "Un des projets sélectionnés n’appartient pas à ton profil.",
      });
    }

    const experienceResult = await client.query(
      "SELECT id FROM experiences WHERE person_id = $1 AND id = ANY($2::int[])",
      [personId, selectedExperiences.value],
    );
    if (experienceResult.rowCount !== selectedExperiences.value.length) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(400).json({
        error: "Une des expériences sélectionnées n’appartient pas à ton profil.",
      });
    }

    // A candidate can attach only one of their own saved CVs; a CV is optional.
    if (cvDocumentId !== null) {
      const cvResult = await client.query(
        "SELECT id FROM cv_documents WHERE id = $1 AND person_id = $2",
        [cvDocumentId, personId],
      );
      if (!cvResult.rowCount) {
        await client.query("ROLLBACK");
        transactionStarted = false;
        return res.status(400).json({ error: "Le CV choisi n’appartient pas à ton profil." });
      }
    }

    // The application is inserted only if the offer is still published.
    const result = await client.query(
      `INSERT INTO applications (person_id, ad_id, message, cv_document_id)
       SELECT $1, ads.id, $3, $4
       FROM ads
       WHERE ads.id = $2 AND ads.status = 'published'
       RETURNING id, ad_id, message, cv_document_id, status, created_at`,
      [personId, adId, message, cvDocumentId],
    );

    if (result.rows.length === 0) {
      const adResult = await client.query(
        "SELECT status FROM ads WHERE id = $1",
        [adId],
      );

      await client.query("ROLLBACK");
      transactionStarted = false;

      if (adResult.rows.length === 0) {
        return res.status(404).json({ error: "Cette offre est introuvable." });
      }

      return res.status(409).json({
        error: "Cette offre est fermée. Tu ne peux plus y postuler.",
      });
    }

    const application = result.rows[0];

    for (const projectId of selectedProjects.value) {
      await client.query(
        `INSERT INTO application_projects (application_id, project_id, person_id)
         VALUES ($1, $2, $3)`,
        [application.id, projectId, personId],
      );
    }

    for (const experienceId of selectedExperiences.value) {
      await client.query(
        `INSERT INTO application_experiences (application_id, experience_id, person_id)
         VALUES ($1, $2, $3)`,
        [application.id, experienceId, personId],
      );
    }

    await client.query("COMMIT");
    transactionStarted = false;
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }

    // The database UNIQUE constraint prevents a second application to the same offer.
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Tu as déjà envoyé une candidature pour cette offre.",
      });
    }

    console.error("Error while creating application:", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  } finally {
    client.release();
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
              applications.cv_document_id,
              cv_documents.original_name AS cv_original_name,
              applications.status, applications.created_at
       FROM applications
       JOIN ads ON ads.id = applications.ad_id
       JOIN companies ON companies.id = ads.company_id
       LEFT JOIN cv_documents
         ON cv_documents.id = applications.cv_document_id
        AND cv_documents.person_id = applications.person_id
       WHERE applications.person_id = $1
       ORDER BY applications.created_at DESC, applications.id DESC`,
      [req.session.userId],
    );

    const applications = result.rows.map((application) => ({
      ...application,
      cv_file_url: application.cv_document_id
        ? `/api/cv-documents/${application.cv_document_id}/file`
        : null,
    }));
    return res.status(200).json(applications);
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
              applications.cv_document_id,
              cv_documents.original_name AS cv_original_name,
              applications.status, applications.created_at
       FROM applications
       JOIN people ON people.id = applications.person_id
       JOIN ads ON ads.id = applications.ad_id
       JOIN companies ON companies.id = ads.company_id
       LEFT JOIN cv_documents
         ON cv_documents.id = applications.cv_document_id
        AND cv_documents.person_id = applications.person_id
       ORDER BY applications.created_at DESC, applications.id DESC`,
    );

    const applications = result.rows.map((application) => ({
      ...application,
      cv_file_url: application.cv_document_id
        ? `/api/cv-documents/${application.cv_document_id}/file`
        : null,
    }));
    return res.status(200).json(applications);
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
  getTodayApplicationCount,
  getMyApplications,
  getAdminApplications,
  updateApplicationStatus,
};
