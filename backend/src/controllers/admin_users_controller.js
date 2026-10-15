const pool = require("../db/pool");
const { isRecord, parseId } = require("./admin_validation");
const { parsePagination, paginated } = require("./pagination");

const USER_ROLES = new Set(["USER", "COMPANY", "ADMIN"]);
const USER_FIELDS = new Set(["first_name", "last_name", "email", "phone", "role", "company_id"]);
const USER_COLUMNS = "people.id, people.first_name, people.last_name, people.email, people.phone, people.role, people.company_id, companies.name AS company_name, people.created_at";

function validateUserChanges(body) {
  if (!isRecord(body)) {
    return { error: "Le corps de la requête doit être un objet JSON." };
  }

  const fields = Object.keys(body);
  if (!fields.length || fields.some((field) => !USER_FIELDS.has(field))) {
    return { error: "Indique au moins un champ utilisateur autorisé à modifier." };
  }

  const values = {};
  for (const field of fields) {
    const value = body[field];
    if (field === "phone" && (value === null || value === "")) {
      values.phone = null;
      continue;
    }

    if (field === "company_id") {
      if (value === null || value === "") {
        values.company_id = null;
      } else {
        const companyId = parseId(value);
        if (companyId === null) return { error: "L’entreprise sélectionnée est invalide." };
        values.company_id = companyId;
      }
      continue;
    }

    if (typeof value !== "string") {
      return { error: `Le champ ${field} doit être du texte.` };
    }

    const trimmed = value.trim();
    const maxLengths = { first_name: 100, last_name: 100, email: 255, phone: 30 };
    if (!trimmed && field !== "phone") {
      return { error: `Le champ ${field} ne peut pas être vide.` };
    }
    if (trimmed.length > (maxLengths[field] || Infinity)) {
      return { error: `Le champ ${field} est trop long.` };
    }

    if (field === "email") {
      const email = trimmed.toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: "Adresse e-mail invalide." };
      }
      values.email = email;
    } else if (field === "role") {
      if (!USER_ROLES.has(trimmed)) {
        return { error: "Le rôle doit être USER, COMPANY ou ADMIN." };
      }
      values.role = trimmed;
    } else {
      values[field] = trimmed || null;
    }
  }

  if (values.role === "COMPANY" && !values.company_id) {
    return { error: "Un compte recruteur doit être rattaché à une entreprise." };
  }
  if (values.role && values.role !== "COMPANY" && values.company_id === undefined) {
    values.company_id = null;
  }

  return { value: values };
}

async function getAdminUsers(req, res) {
  const pagination = parsePagination(req.query);
  if (pagination.error) return res.status(400).json({ message: pagination.error });
  const { page, pageSize, offset } = pagination.value;
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const role = req.query.role || "all";
  if (typeof req.query.q !== "undefined" && (typeof req.query.q !== "string" || q.length > 200)) {
    return res.status(400).json({ message: "Le texte de recherche est invalide." });
  }
  if (!new Set(["all", ...USER_ROLES]).has(role)) {
    return res.status(400).json({ message: "Le filtre de rôle est invalide." });
  }
  const filters = [];
  const values = [];
  if (role !== "all") { values.push(role); filters.push(`people.role = $${values.length}`); }
  if (q) {
    values.push(`%${q}%`);
    filters.push(`(people.first_name ILIKE $${values.length} OR people.last_name ILIKE $${values.length} OR people.email ILIKE $${values.length} OR companies.name ILIKE $${values.length})`);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  try {
    const count = await pool.query(`SELECT COUNT(*)::int AS total FROM people LEFT JOIN companies ON companies.id = people.company_id ${where}`, values);
    const result = await pool.query(
      `SELECT ${USER_COLUMNS} FROM people LEFT JOIN companies ON companies.id = people.company_id
       ${where} ORDER BY people.last_name ASC, people.first_name ASC, people.id ASC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, pageSize, offset],
    );
    const hasPagination = req.query.page !== undefined || req.query.page_size !== undefined;
    return res.status(200).json(hasPagination
      ? paginated(result.rows, page, pageSize, count.rows[0].total)
      : result.rows);
  } catch (error) {
    console.error("Error while fetching admin users:", error);
    return res.status(500).json({ message: "Impossible de charger les comptes." });
  }
}

async function updateAdminUser(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "L’identifiant du compte est invalide." });
  }

  const { value, error } = validateUserChanges(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  if (id === req.session.userId && Object.hasOwn(value, "role")) {
    return res.status(409).json({ message: "Tu ne peux pas modifier ton propre rôle." });
  }

  const fields = Object.keys(value);
  const values = fields.map((field) => value[field]);
  values.push(id);
  const assignments = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const admins = await client.query(
      "SELECT id FROM people WHERE role = 'ADMIN' ORDER BY id FOR UPDATE",
    );
    const currentUser = await client.query(
      "SELECT id, role, company_id FROM people WHERE id = $1 FOR UPDATE",
      [id],
    );

    if (!currentUser.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Compte introuvable." });
    }

    const nextRole = value.role ?? currentUser.rows[0].role;
    const nextCompanyId = Object.hasOwn(value, "company_id")
      ? value.company_id
      : currentUser.rows[0].company_id;
    if ((nextRole === "COMPANY") !== (nextCompanyId !== null && nextCompanyId !== undefined)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Un compte recruteur doit être rattaché à une entreprise, et les autres rôles ne peuvent pas l’être." });
    }

    const isDemotingLastAdmin = currentUser.rows[0].role === "ADMIN" &&
      value.role !== undefined && value.role !== "ADMIN" && admins.rowCount === 1;
    if (isDemotingLastAdmin) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Le dernier compte ADMIN ne peut pas perdre ce rôle." });
    }

    const result = await client.query(
      `UPDATE people SET ${assignments} WHERE id = $${values.length}
       RETURNING id`,
      values,
    );
    const updated = await client.query(
      `SELECT ${USER_COLUMNS} FROM people LEFT JOIN companies ON companies.id = people.company_id WHERE people.id = $1`,
      [result.rows[0].id],
    );
    await client.query("COMMIT");
    return res.status(200).json(updated.rows[0]);
  } catch (requestError) {
    await client.query("ROLLBACK");
    if (requestError.code === "23505") {
      return res.status(409).json({ message: "Cette adresse e-mail est déjà utilisée." });
    }
    if (requestError.code === "23503") {
      return res.status(409).json({ message: "L’entreprise sélectionnée n’existe plus." });
    }

    console.error("Error while updating admin user:", requestError);
    return res.status(500).json({ message: "Impossible de modifier ce compte." });
  } finally {
    client.release();
  }
}

async function deleteAdminUser(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: "L’identifiant du compte est invalide." });
  }
  if (id === req.session.userId) {
    return res.status(409).json({ message: "Tu ne peux pas supprimer ton propre compte." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const admins = await client.query(
      "SELECT id FROM people WHERE role = 'ADMIN' ORDER BY id FOR UPDATE",
    );
    const result = await client.query(
      "DELETE FROM people WHERE id = $1 RETURNING id, role",
      [id],
    );

    if (!result.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Compte introuvable." });
    }
    if (result.rows[0].role === "ADMIN" && admins.rowCount === 1) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Le dernier compte ADMIN ne peut pas être supprimé." });
    }

    await client.query("COMMIT");
    return res.status(204).end();
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error while deleting admin user:", error);
    return res.status(500).json({ message: "Impossible de supprimer ce compte." });
  } finally {
    client.release();
  }
}

module.exports = { getAdminUsers, updateAdminUser, deleteAdminUser };
