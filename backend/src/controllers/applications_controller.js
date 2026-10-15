const pool = require("../db/pool");
const { isRecord, parseId } = require("./admin_validation");
const { parsePagination, paginated } = require("./pagination");

const APPLICATION_STATUSES = new Set([
  "sent",
  "in_progress",
  "technical_test",
  "accepted",
  "rejected",
]);

const APPLICATION_FILTER_STATUSES = new Set(["all", ...APPLICATION_STATUSES]);

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

    // Lock the offer so it cannot close while the application is being saved.
    const adResult = await client.query(
      "SELECT id, status FROM ads WHERE id = $1 FOR UPDATE",
      [adId],
    );
    if (!adResult.rowCount) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(404).json({ error: "Cette offre est introuvable." });
    }
    if (adResult.rows[0].status !== "published") {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(409).json({ error: "Cette offre est fermée. Tu ne peux plus y postuler." });
    }

    const personResult = await client.query(
      `SELECT first_name, last_name, email, phone
       FROM people
       WHERE id = $1
       FOR SHARE`,
      [personId],
    );
    if (!personResult.rowCount) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(401).json({ error: "Ton compte n’est plus disponible." });
    }

    // Save the selected profile information while it is locked against edits.
    const projectResult = await client.query(
      `SELECT id, title, description, project_url, repository_url
       FROM projects
       WHERE person_id = $1 AND id = ANY($2::int[])
       FOR SHARE`,
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
      `SELECT id, company_name, job_title, description, start_date, end_date
       FROM experiences
       WHERE person_id = $1 AND id = ANY($2::int[])
       FOR SHARE`,
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
    let cv = null;
    if (cvDocumentId !== null) {
      const cvResult = await client.query(
        `SELECT id, original_name, created_at
         FROM cv_documents
         WHERE id = $1 AND person_id = $2
         FOR SHARE`,
        [cvDocumentId, personId],
      );
      if (!cvResult.rowCount) {
        await client.query("ROLLBACK");
        transactionStarted = false;
        return res.status(400).json({ error: "Le CV choisi n’appartient pas à ton profil." });
      }
      cv = cvResult.rows[0];
    }

    const submittedSnapshot = {
      person: personResult.rows[0],
      message,
      projects: projectResult.rows,
      experiences: experienceResult.rows,
      cv,
    };

    const result = await client.query(
      `INSERT INTO applications
         (person_id, ad_id, message, cv_document_id, submitted_snapshot)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING id, ad_id, message, cv_document_id, status, created_at`,
      [personId, adId, message, cvDocumentId, JSON.stringify(submittedSnapshot)],
    );

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

// Returns the submitted dossier only to the candidate who owns it.
async function getMyApplicationById(req, res) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Connecte-toi pour voir cette candidature." });
  }

  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "L’identifiant de la candidature est invalide." });
  }

  try {
    const result = await pool.query(
      `SELECT applications.id, applications.ad_id, ads.title,
              companies.name AS company_name, ads.location,
              applications.message, applications.submitted_snapshot,
              applications.cv_document_id,
              cv_documents.original_name AS cv_original_name,
              cv_documents.created_at AS cv_created_at,
              applications.status, applications.created_at
       FROM applications
       JOIN ads ON ads.id = applications.ad_id
       JOIN companies ON companies.id = ads.company_id
       LEFT JOIN cv_documents
         ON cv_documents.id = applications.cv_document_id
        AND cv_documents.person_id = applications.person_id
       WHERE applications.id = $1 AND applications.person_id = $2`,
      [id, req.session.userId],
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: "Candidature introuvable." });
    }

    const application = result.rows[0];
    const snapshot = application.submitted_snapshot;
    let legacyItems = null;

    if (!snapshot) {
      const [projects, experiences] = await Promise.all([
        pool.query(
          `SELECT projects.id, projects.title, projects.description,
                  projects.project_url, projects.repository_url
           FROM application_projects
           JOIN projects ON projects.id = application_projects.project_id
           WHERE application_projects.application_id = $1
             AND application_projects.person_id = $2
           ORDER BY projects.id`,
          [id, req.session.userId],
        ),
        pool.query(
          `SELECT experiences.id, experiences.company_name, experiences.job_title,
                  experiences.description, experiences.start_date, experiences.end_date
           FROM application_experiences
           JOIN experiences ON experiences.id = application_experiences.experience_id
           WHERE application_experiences.application_id = $1
             AND application_experiences.person_id = $2
           ORDER BY experiences.id`,
          [id, req.session.userId],
        ),
      ]);
      legacyItems = { projects: projects.rows, experiences: experiences.rows };
    }

    const cv = application.cv_document_id
      ? {
          id: application.cv_document_id,
          original_name: application.cv_original_name || snapshot?.cv?.original_name || "CV envoyé",
          created_at: application.cv_created_at || snapshot?.cv?.created_at || null,
          file_url: `/api/cv-documents/${application.cv_document_id}/file`,
        }
      : null;

    return res.status(200).json({
      id: application.id,
      ad_id: application.ad_id,
      title: application.title,
      company_name: application.company_name,
      location: application.location,
      status: application.status,
      created_at: application.created_at,
      snapshot_available: Boolean(snapshot),
      submitted_snapshot: snapshot,
      legacy_message: snapshot ? null : application.message,
      legacy_items: legacyItems,
      cv,
    });
  } catch (error) {
    console.error("Error while fetching application details:", error);
    return res.status(500).json({ error: "Impossible de charger le détail de cette candidature." });
  }
}

// Lists applications for the admin page, including the candidate's name.
async function getAdminApplications(req, res) {
  const pagination = parsePagination(req.query);
  if (pagination.error) return res.status(400).json({ message: pagination.error });
  const { page, pageSize, offset } = pagination.value;
  const { company_id: companyIdQuery, ad_id: adIdQuery, status = "all" } = req.query;
  const companyId = parseOptionalFilterId(companyIdQuery, "company_id");
  const adId = parseOptionalFilterId(adIdQuery, "ad_id");
  if (companyId.error || adId.error) {
    return res.status(400).json({ message: companyId.error || adId.error });
  }
  if (typeof status !== "string" || !APPLICATION_FILTER_STATUSES.has(status)) {
    return res.status(400).json({ message: "Le filtre status est invalide." });
  }

  const conditions = [];
  const values = [];
  function addFilter(column, value) {
    values.push(value);
    conditions.push(`${column} = $${values.length}`);
  }

  if (companyId.value !== null) addFilter("ads.company_id", companyId.value);
  if (adId.value !== null) addFilter("applications.ad_id", adId.value);
  if (status !== "all") addFilter("applications.status", status);

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  try {
    const count = await pool.query(
      `SELECT COUNT(*)::int AS total FROM applications JOIN ads ON ads.id = applications.ad_id ${whereClause}`,
      values,
    );
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
       ${whereClause}
       ORDER BY applications.created_at DESC, applications.id DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, pageSize, offset],
    );

    const applications = result.rows.map((application) => ({
      ...application,
      cv_file_url: application.cv_document_id
        ? `/api/cv-documents/${application.cv_document_id}/file`
        : null,
    }));
    const hasPagination = req.query.page !== undefined || req.query.page_size !== undefined;
    return res.status(200).json(hasPagination
      ? paginated(applications, page, pageSize, count.rows[0].total)
      : applications);
  } catch (error) {
    console.error("Error while fetching admin applications:", error);
    return res.status(500).json({ message: "Impossible de charger les candidatures." });
  }
}

function parseOptionalFilterId(value, field) {
  if (value === undefined || value === "") return { value: null };
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return { error: `Le filtre ${field} est invalide.` };
  }
  const id = parseId(value);
  return id === null ? { error: `Le filtre ${field} est invalide.` } : { value: id };
}

// Returns the full submitted dossier to an administrator.
async function getAdminApplicationById(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "L’identifiant de la candidature est invalide." });
  }

  try {
    const result = await pool.query(
      `SELECT applications.id, applications.person_id, applications.ad_id, ads.title,
              companies.name AS company_name, ads.location,
              applications.message, applications.submitted_snapshot,
              applications.cv_document_id,
              cv_documents.original_name AS cv_original_name,
              cv_documents.created_at AS cv_created_at,
              applications.status, applications.created_at,
              people.first_name, people.last_name, people.email, people.phone
       FROM applications
       JOIN people ON people.id = applications.person_id
       JOIN ads ON ads.id = applications.ad_id
       JOIN companies ON companies.id = ads.company_id
       LEFT JOIN cv_documents
         ON cv_documents.id = applications.cv_document_id
        AND cv_documents.person_id = applications.person_id
       WHERE applications.id = $1`,
      [id],
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Candidature introuvable." });
    }

    const application = result.rows[0];
    const snapshot = application.submitted_snapshot;
    let legacyItems = { projects: [], experiences: [] };

    if (!snapshot) {
      const [projects, experiences] = await Promise.all([
        pool.query(
          `SELECT projects.id, projects.title, projects.description,
                  projects.project_url, projects.repository_url
           FROM application_projects
           JOIN projects ON projects.id = application_projects.project_id
           WHERE application_projects.application_id = $1
             AND application_projects.person_id = $2
           ORDER BY projects.id`,
          [id, application.person_id],
        ),
        pool.query(
          `SELECT experiences.id, experiences.company_name, experiences.job_title,
                  experiences.description, experiences.start_date, experiences.end_date
           FROM application_experiences
           JOIN experiences ON experiences.id = application_experiences.experience_id
           WHERE application_experiences.application_id = $1
             AND application_experiences.person_id = $2
           ORDER BY experiences.id`,
          [id, application.person_id],
        ),
      ]);
      legacyItems = { projects: projects.rows, experiences: experiences.rows };
    }

    const savedCv = snapshot?.cv || null;
    const cv = application.cv_document_id
      ? {
          id: application.cv_document_id,
          original_name: application.cv_original_name || savedCv?.original_name || "CV envoyé",
          created_at: application.cv_created_at || savedCv?.created_at || null,
          file_url: `/api/cv-documents/${application.cv_document_id}/file`,
        }
      : null;

    return res.status(200).json({
      id: application.id,
      ad_id: application.ad_id,
      title: application.title,
      company_name: application.company_name,
      location: application.location,
      status: application.status,
      created_at: application.created_at,
      snapshot_available: Boolean(snapshot),
      person: snapshot?.person || {
        first_name: application.first_name,
        last_name: application.last_name,
        email: application.email,
        phone: application.phone,
      },
      person_is_current: !snapshot,
      message: snapshot?.message ?? application.message,
      projects: snapshot?.projects || legacyItems.projects,
      experiences: snapshot?.experiences || legacyItems.experiences,
      cv,
    });
  } catch (error) {
    console.error("Error while fetching admin application details:", error);
    return res.status(500).json({ message: "Impossible de charger le dossier de candidature." });
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
  getMyApplicationById,
  getAdminApplications,
  getAdminApplicationById,
  updateApplicationStatus,
};
