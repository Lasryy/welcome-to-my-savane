const pool = require("../db/pool");
const { isRecord, parseId, stringField } = require("./admin_validation");

const EXPERIENCE_FIELDS = new Set([
  "company_name",
  "job_title",
  "description",
  "start_date",
  "end_date",
]);

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateExperience(body, current = null) {
  if (!isRecord(body)) {
    return { error: "L’expérience doit être envoyée sous forme d’objet JSON." };
  }
  const fields = Object.keys(body);
  if (!fields.length || fields.some((field) => !EXPERIENCE_FIELDS.has(field))) {
    return { error: "Indique au moins un champ d’expérience autorisé." };
  }

  const values = {};
  for (const field of fields) {
    if (field === "start_date" || field === "end_date") {
      const value = body[field];
      if (value === null || value === "") {
        values[field] = null;
      } else if (!validDate(value)) {
        return { error: `Le champ ${field} doit être une date valide au format AAAA-MM-JJ.` };
      } else {
        values[field] = value;
      }
      continue;
    }

    const required = field === "company_name" || field === "job_title";
    const maxLength = field === "description" ? 5000 : 200;
    const result = stringField(body[field], field, { required, maxLength });
    if (result.error) {
      return result;
    }
    values[field] = result.value;
  }

  if (!current && (!values.company_name || !values.job_title)) {
    return { error: "L’entreprise et le poste sont obligatoires." };
  }
  const startDate = Object.hasOwn(values, "start_date")
    ? values.start_date
    : current?.start_date ?? null;
  const endDate = Object.hasOwn(values, "end_date")
    ? values.end_date
    : current?.end_date ?? null;
  if (endDate && (!startDate || endDate < startDate)) {
    return { error: "La date de fin doit être postérieure ou égale à la date de début." };
  }

  return { value: values };
}

function sendDatabaseError(res, action, error) {
  console.error(`Error while ${action} candidate experiences:`, error);
  return res.status(500).json({ message: "Impossible de traiter les expériences." });
}

// Lists only experiences owned by the account in the current session.
async function getMyExperiences(req, res) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Connexion requise." });
  }

  try {
    const result = await pool.query(
      `SELECT id, company_name, job_title, description, start_date, end_date, created_at
       FROM experiences WHERE person_id = $1 ORDER BY start_date DESC NULLS LAST, id DESC`,
      [req.session.userId],
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    return sendDatabaseError(res, "listing", error);
  }
}

// Creates an experience for the account in the current session.
async function createExperience(req, res) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Connexion requise." });
  }
  const { value, error } = validateExperience(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  try {
    const result = await pool.query(
      `INSERT INTO experiences
         (person_id, company_name, job_title, description, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, company_name, job_title, description, start_date, end_date, created_at`,
      [
        req.session.userId,
        value.company_name,
        value.job_title,
        value.description ?? null,
        value.start_date ?? null,
        value.end_date ?? null,
      ],
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return sendDatabaseError(res, "creating", error);
  }
}

// Updates an experience only when its owner matches the current account.
async function updateExperience(req, res) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Connexion requise." });
  }
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "L’identifiant de l’expérience est invalide." });
  }

  try {
    const currentResult = await pool.query(
      `SELECT company_name, job_title, description, start_date, end_date
       FROM experiences WHERE id = $1 AND person_id = $2`,
      [id, req.session.userId],
    );
    if (!currentResult.rowCount) {
      return res.status(404).json({ message: "Expérience introuvable." });
    }

    const { value, error } = validateExperience(req.body, currentResult.rows[0]);
    if (error) {
      return res.status(400).json({ message: error });
    }
    const fields = Object.keys(value);
    const parameters = fields.map((field) => value[field]);
    parameters.push(id, req.session.userId);
    const assignments = fields
      .map((field, index) => `${field} = $${index + 1}`)
      .join(", ");
    const result = await pool.query(
      `UPDATE experiences SET ${assignments}
       WHERE id = $${parameters.length - 1} AND person_id = $${parameters.length}
       RETURNING id, company_name, job_title, description, start_date, end_date, created_at`,
      parameters,
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: "Expérience introuvable." });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return sendDatabaseError(res, "updating", error);
  }
}

// Refuses to delete an experience that is already part of an application.
async function deleteExperience(req, res) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Connexion requise." });
  }
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "L’identifiant de l’expérience est invalide." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const experience = await client.query(
      "SELECT id FROM experiences WHERE id = $1 AND person_id = $2 FOR UPDATE",
      [id, req.session.userId],
    );
    if (!experience.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Expérience introuvable." });
    }

    const applicationLink = await client.query(
      "SELECT 1 FROM application_experiences WHERE experience_id = $1 LIMIT 1",
      [id],
    );
    if (applicationLink.rowCount) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "Cette expérience est liée à une candidature et ne peut pas être supprimée.",
      });
    }

    await client.query("DELETE FROM experiences WHERE id = $1 AND person_id = $2", [
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

module.exports = {
  getMyExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
};
