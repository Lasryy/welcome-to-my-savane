const pool = require("../db/pool");
const { isRecord, parseId, stringField, webUrl } = require("./admin_validation");

const COMPANY_FIELDS = {
  name: { required: true, maxLength: 150, nullable: false },
  description: { maxLength: 100000 },
  website: { maxLength: 255 },
  location: { maxLength: 255 },
  logo_url: { maxLength: 500 },
};
const COMPANY_COLUMNS = "id, name, description, website, location, logo_url, created_at";

function validateCompany(body) {
  if (!isRecord(body)) {
    return { error: "Le corps de la requête doit être un objet JSON." };
  }

  const company = {};
  for (const [field, options] of Object.entries(COMPANY_FIELDS)) {
    const result = stringField(body[field], `Le champ ${field}`, options);
    if (result.error) {
      return result;
    }

    company[field] = result.value;
  }

  const urlFields = ["website", "logo_url"];
  for (const field of urlFields) {
    const urlError = webUrl(company[field], `Le champ ${field}`);
    if (urlError) {
      return { error: urlError };
    }
  }

  return { value: company };
}

function sendDatabaseError(res, error, context) {
  if (error.code === "23503") {
    // The schema restricts deleting a company that still owns job ads.
    return res.status(409).json({ message: "Cette entreprise est liée à une ou plusieurs offres et ne peut pas être supprimée." });
  }

  if (error.code === "23505") {
    return res.status(409).json({ message: "Une entreprise avec ces informations existe déjà." });
  }

  console.error(`${context}:`, error);
  return res.status(500).json({ message: "Une erreur interne est survenue." });
}

async function getCompanies(req, res) {
  try {
    const result = await pool.query(`SELECT ${COMPANY_COLUMNS} FROM companies ORDER BY name ASC, id ASC`);
    return res.status(200).json(result.rows);
  } catch (error) {
    return sendDatabaseError(res, error, "Error while fetching companies");
  }
}

async function getCompanyById(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "L’identifiant de l’entreprise est invalide." });
  }

  try {
    const result = await pool.query(`SELECT ${COMPANY_COLUMNS} FROM companies WHERE id = $1`, [id]);
    if (!result.rowCount) {
      return res.status(404).json({ message: "Entreprise introuvable." });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return sendDatabaseError(res, error, "Error while fetching company");
  }
}

async function createCompany(req, res) {
  const { value, error: validationError } = validateCompany(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const { name, description = null, website = null, location = null, logo_url: logoUrl = null } = value;
    const result = await pool.query(
      `INSERT INTO companies (name, description, website, location, logo_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING ${COMPANY_COLUMNS}`,
      [name, description, website, location, logoUrl],
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return sendDatabaseError(res, error, "Error while creating company");
  }
}

async function updateCompany(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "L’identifiant de l’entreprise est invalide." });
  }

  const { value, error: validationError } = validateCompany(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const result = await pool.query(
      `UPDATE companies
       SET name = $1, description = $2, website = $3, location = $4, logo_url = $5
       WHERE id = $6 RETURNING ${COMPANY_COLUMNS}`,
      [value.name, value.description ?? null, value.website ?? null, value.location ?? null, value.logo_url ?? null, id],
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: "Entreprise introuvable." });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return sendDatabaseError(res, error, "Error while updating company");
  }
}

async function deleteCompany(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "L’identifiant de l’entreprise est invalide." });
  }

  try {
    const result = await pool.query("DELETE FROM companies WHERE id = $1 RETURNING id", [id]);
    if (!result.rowCount) {
      return res.status(404).json({ message: "Entreprise introuvable." });
    }

    return res.status(204).end();
  } catch (error) {
    return sendDatabaseError(res, error, "Error while deleting company");
  }
}

module.exports = { getCompanies, getCompanyById, createCompany, updateCompany, deleteCompany };
