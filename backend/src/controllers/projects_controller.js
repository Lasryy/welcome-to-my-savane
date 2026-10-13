const pool = require("../db/pool");
const { isRecord, parseId, stringField, webUrl } = require("./admin_validation");

const PROJECT_FIELDS = new Set([
  "title",
  "description",
  "project_url",
  "repository_url",
]);

function validateProject(body, isCreate = false) {
  if (!isRecord(body)) {
    return { error: "Le projet doit être envoyé sous forme d’objet JSON." };
  }
  const fields = Object.keys(body);
  if (!fields.length || fields.some((field) => !PROJECT_FIELDS.has(field))) {
    return { error: "Indique au moins un champ de projet autorisé." };
  }

  const values = {};
  for (const field of fields) {
    const required = isCreate && field === "title";
    const maxLength = {
      title: 200,
      description: 5000,
      project_url: 500,
      repository_url: 500,
    }[field];
    const result = stringField(body[field], field, { required, maxLength });
    if (result.error) {
      return result;
    }
    if ((field === "project_url" || field === "repository_url") && result.value) {
      const urlError = webUrl(result.value, field);
      if (urlError) {
        return { error: urlError };
      }
    }
    values[field] = result.value;
  }

  if (isCreate && !Object.hasOwn(values, "title")) {
    return { error: "Le titre du projet est obligatoire." };
  }
  return { value: values };
}

function sendDatabaseError(res, action, error) {
  console.error(`Error while ${action} candidate projects:`, error);
  return res.status(500).json({ message: "Impossible de traiter les projets." });
}

// Lists only projects owned by the account in the current session.
async function getMyProjects(req, res) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Connexion requise." });
  }

  try {
    const result = await pool.query(
      `SELECT id, title, description, project_url, repository_url, created_at
       FROM projects WHERE person_id = $1 ORDER BY created_at DESC, id DESC`,
      [req.session.userId],
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    return sendDatabaseError(res, "listing", error);
  }
}

// Creates a project for the account in the current session.
async function createProject(req, res) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Connexion requise." });
  }
  const { value, error } = validateProject(req.body, true);
  if (error) {
    return res.status(400).json({ message: error });
  }

  try {
    const result = await pool.query(
      `INSERT INTO projects (person_id, title, description, project_url, repository_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, description, project_url, repository_url, created_at`,
      [
        req.session.userId,
        value.title,
        value.description ?? null,
        value.project_url ?? null,
        value.repository_url ?? null,
      ],
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return sendDatabaseError(res, "creating", error);
  }
}

// Updates a project only when its owner matches the current account.
async function updateProject(req, res) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Connexion requise." });
  }
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "L’identifiant du projet est invalide." });
  }
  const { value, error } = validateProject(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const fields = Object.keys(value);
  const parameters = fields.map((field) => value[field]);
  parameters.push(id, req.session.userId);
  const assignments = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  try {
    const result = await pool.query(
      `UPDATE projects SET ${assignments}
       WHERE id = $${parameters.length - 1} AND person_id = $${parameters.length}
       RETURNING id, title, description, project_url, repository_url, created_at`,
      parameters,
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: "Projet introuvable." });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return sendDatabaseError(res, "updating", error);
  }
}

// Refuses to delete a project that is already part of an application.
async function deleteProject(req, res) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Connexion requise." });
  }
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "L’identifiant du projet est invalide." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const project = await client.query(
      "SELECT id FROM projects WHERE id = $1 AND person_id = $2 FOR UPDATE",
      [id, req.session.userId],
    );
    if (!project.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Projet introuvable." });
    }

    const applicationLink = await client.query(
      "SELECT 1 FROM application_projects WHERE project_id = $1 LIMIT 1",
      [id],
    );
    if (applicationLink.rowCount) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "Ce projet est lié à une candidature et ne peut pas être supprimé.",
      });
    }

    await client.query("DELETE FROM projects WHERE id = $1 AND person_id = $2", [
      id,
      req.session.userId,
    ]);
    await client.query("COMMIT");
    return res.status(204).end();
  } catch (error) {
    await client.query("ROLLBACK");
    return sendDatabaseError(res, "deleting", error);
  } finally {
    client.release();
  }
}

module.exports = { getMyProjects, createProject, updateProject, deleteProject };
