const pool = require("../db/pool");
const { isRecord, parseId } = require("./admin_validation");

const USER_ROLES = new Set(["USER", "ADMIN"]);
const USER_FIELDS = new Set(["first_name", "last_name", "email", "phone", "role"]);
const USER_COLUMNS = "id, first_name, last_name, email, phone, role, created_at";

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
        return { error: "Le rôle doit être USER ou ADMIN." };
      }
      values.role = trimmed;
    } else {
      values[field] = trimmed || null;
    }
  }

  return { value: values };
}

async function getAdminUsers(req, res) {
  try {
    const result = await pool.query(
      `SELECT ${USER_COLUMNS} FROM people ORDER BY last_name ASC, first_name ASC, id ASC`,
    );
    return res.status(200).json(result.rows);
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
      "SELECT id, role FROM people WHERE id = $1 FOR UPDATE",
      [id],
    );

    if (!currentUser.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Compte introuvable." });
    }

    const isDemotingLastAdmin =
      currentUser.rows[0].role === "ADMIN" && value.role === "USER" && admins.rowCount === 1;
    if (isDemotingLastAdmin) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Le dernier compte ADMIN ne peut pas perdre ce rôle." });
    }

    const result = await client.query(
      `UPDATE people SET ${assignments} WHERE id = $${values.length}
       RETURNING ${USER_COLUMNS}`,
      values,
    );
    await client.query("COMMIT");
    return res.status(200).json(result.rows[0]);
  } catch (requestError) {
    await client.query("ROLLBACK");
    if (requestError.code === "23505") {
      return res.status(409).json({ message: "Cette adresse e-mail est déjà utilisée." });
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
