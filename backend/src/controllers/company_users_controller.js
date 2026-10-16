const bcrypt = require("bcrypt");
const pool = require("../db/pool");
const { parseId } = require("./admin_validation");
const { parsePagination, paginated } = require("./pagination");

const USER_SELECT = `people.id, people.first_name, people.last_name, people.email,
  people.phone, people.role, people.company_id, companies.name AS company_name,
  people.created_at`;
const EDITABLE_FIELDS = new Set(["first_name", "last_name", "email", "phone"]);

function validateEmployee(body, { partial = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Le corps de la requête doit être un objet JSON." };
  }
  const fields = Object.keys(body);
  if (!fields.length || fields.some((field) => !EDITABLE_FIELDS.has(field))) {
    return { error: "Indique des coordonnées autorisées à modifier." };
  }
  const value = {};
  for (const field of fields) {
    const raw = body[field];
    if (field === "phone" && (raw === null || raw === "")) {
      value.phone = null;
      continue;
    }
    if (typeof raw !== "string") return { error: `Le champ ${field} doit être du texte.` };
    const trimmed = raw.trim();
    if (!trimmed && field !== "phone") return { error: `Le champ ${field} ne peut pas être vide.` };
    if (trimmed.length > ({ first_name: 100, last_name: 100, email: 255, phone: 30 }[field])) {
      return { error: `Le champ ${field} est trop long.` };
    }
    if (field === "email") {
      value.email = trimmed.toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) return { error: "Adresse e-mail invalide." };
    } else {
      value[field] = trimmed || null;
    }
  }
  if (!partial && ["first_name", "last_name", "email"].some((field) => !Object.hasOwn(value, field))) {
    return { error: "Prénom, nom et e-mail sont obligatoires." };
  }
  return { value };
}

async function getCompanyUsers(req, res) {
  const pagination = parsePagination(req.query);
  if (pagination.error) return res.status(400).json({ message: pagination.error });
  const { page, pageSize, offset } = pagination.value;
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (req.query.q !== undefined && (typeof req.query.q !== "string" || query.length > 200)) {
    return res.status(400).json({ message: "La recherche est invalide." });
  }
  const values = [req.companyId];
  let where = "people.company_id = $1 AND people.role = 'COMPANY'";
  if (query) {
    values.push(`%${query}%`);
    where += ` AND (people.first_name ILIKE $${values.length} OR people.last_name ILIKE $${values.length} OR people.email ILIKE $${values.length})`;
  }
  try {
    const count = await pool.query(`SELECT COUNT(*)::int AS total FROM people WHERE ${where}`, values);
    const result = await pool.query(
      `SELECT ${USER_SELECT} FROM people JOIN companies ON companies.id = people.company_id
       WHERE ${where} ORDER BY people.last_name, people.first_name, people.id
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, pageSize, offset],
    );
    return res.status(200).json(paginated(result.rows, page, pageSize, count.rows[0].total));
  } catch (error) {
    console.error("Error while listing company users:", error);
    return res.status(500).json({ message: "Impossible de charger les comptes de l’entreprise." });
  }
}

async function createCompanyUser(req, res) {
  const { password, ...fields } = req.body || {};
  const { value, error } = validateEmployee(fields);
  if (error) return res.status(400).json({ message: error });
  if (typeof password !== "string" || password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).json({ message: "Le mot de passe initial doit contenir entre 8 et 72 octets." });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const created = await pool.query(
      `INSERT INTO people (first_name, last_name, email, phone, password_hash, role, company_id)
       VALUES ($1, $2, $3, $4, $5, 'COMPANY', $6) RETURNING id`,
      [value.first_name, value.last_name, value.email, value.phone ?? null, passwordHash, req.companyId],
    );
    const result = await pool.query(
      `SELECT ${USER_SELECT} FROM people JOIN companies ON companies.id = people.company_id
       WHERE people.id = $1 AND people.company_id = $2`,
      [created.rows[0].id, req.companyId],
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ message: "Cette adresse e-mail est déjà utilisée." });
    console.error("Error while creating company user:", error);
    return res.status(500).json({ message: "Impossible de créer le compte employé." });
  }
}

async function updateCompanyUser(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ message: "L’identifiant du compte est invalide." });
  const { value, error } = validateEmployee(req.body, { partial: true });
  if (error) return res.status(400).json({ message: error });
  const fields = Object.keys(value);
  try {
    const result = await pool.query(
      `UPDATE people SET ${fields.map((field, index) => `${field} = $${index + 1}`).join(", ")}
       WHERE id = $${fields.length + 1} AND company_id = $${fields.length + 2} AND role = 'COMPANY'
       RETURNING id`,
      [...fields.map((field) => value[field]), id, req.companyId],
    );
    if (!result.rowCount) return res.status(404).json({ message: "Compte employé introuvable." });
    const updated = await pool.query(
      `SELECT ${USER_SELECT} FROM people JOIN companies ON companies.id = people.company_id WHERE people.id = $1`,
      [id],
    );
    return res.status(200).json(updated.rows[0]);
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ message: "Cette adresse e-mail est déjà utilisée." });
    console.error("Error while updating company user:", error);
    return res.status(500).json({ message: "Impossible de modifier le compte employé." });
  }
}

async function deleteCompanyUser(req, res) {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ message: "L’identifiant du compte est invalide." });
  if (id === req.session.userId) return res.status(409).json({ message: "Tu ne peux pas supprimer ton propre compte depuis cet espace." });
  try {
    const result = await pool.query(
      "DELETE FROM people WHERE id = $1 AND company_id = $2 AND role = 'COMPANY' RETURNING id",
      [id, req.companyId],
    );
    if (!result.rowCount) return res.status(404).json({ message: "Compte employé introuvable." });
    return res.status(204).end();
  } catch (error) {
    console.error("Error while deleting company user:", error);
    return res.status(500).json({ message: "Impossible de supprimer le compte employé." });
  }
}

module.exports = { getCompanyUsers, createCompanyUser, updateCompanyUser, deleteCompanyUser };
