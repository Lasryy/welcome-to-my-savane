const pool = require("../db/pool");
const { isRecord, parseId, stringField } = require("./admin_validation");

function validateCategory(body) {
  if (!isRecord(body)) {
    return { error: "Le corps de la requête doit être un objet JSON." };
  }

  const result = stringField(body.name, "Le nom de la catégorie", {
    required: true,
    maxLength: 100,
    nullable: false,
  });
  if (result.error) {
    return result;
  }

  return { value: { name: result.value } };
}

function sendDatabaseError(res, error, context) {
  if (error.code === "23505") {
    // Category names are unique in the database.
    return res.status(409).json({ message: "Une catégorie porte déjà ce nom." });
  }

  if (error.code === "23503") {
    return res.status(409).json({ message: "Cette catégorie est encore liée à une ou plusieurs offres." });
  }

  console.error(`${context}:`, error);
  return res.status(500).json({ message: "Une erreur interne est survenue." });
}

async function getCategories(req, res) {
  try {
    const result = await pool.query("SELECT id, name FROM categories ORDER BY name ASC, id ASC");
    return res.status(200).json(result.rows);
  } catch (error) {
    return sendDatabaseError(res, error, "Error while fetching categories");
  }
}

async function createCategory(req, res) {
  const { value, error: validationError } = validateCategory(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const result = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING id, name",
      [value.name],
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return sendDatabaseError(res, error, "Error while creating category");
  }
}

async function updateCategory(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "L’identifiant de la catégorie est invalide." });
  }

  const { value, error: validationError } = validateCategory(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const result = await pool.query(
      "UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name",
      [value.name, id],
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: "Catégorie introuvable." });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return sendDatabaseError(res, error, "Error while updating category");
  }
}

async function deleteCategory(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "L’identifiant de la catégorie est invalide." });
  }

  try {
    const result = await pool.query("DELETE FROM categories WHERE id = $1 RETURNING id", [id]);
    if (!result.rowCount) {
      return res.status(404).json({ message: "Catégorie introuvable." });
    }

    return res.status(204).end();
  } catch (error) {
    return sendDatabaseError(res, error, "Error while deleting category");
  }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
