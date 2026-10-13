const pool = require("../db/pool");

const PROFILE_FIELDS = new Set(["first_name", "last_name", "email", "phone"]);
const PROFILE_COLUMNS = "id, first_name, last_name, email, phone, role";

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateProfileChanges(body) {
  if (!isRecord(body)) {
    return { error: "Le profil doit être envoyé sous forme d’objet JSON." };
  }

  const fields = Object.keys(body);
  if (!fields.length || fields.some((field) => !PROFILE_FIELDS.has(field))) {
    return { error: "Indique au moins un champ de profil autorisé." };
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
    const maxLength = { first_name: 100, last_name: 100, email: 255, phone: 30 }[field];
    if (field !== "phone" && !trimmed) {
      return { error: `Le champ ${field} ne peut pas être vide.` };
    }
    if (trimmed.length > maxLength) {
      return { error: `Le champ ${field} est trop long.` };
    }

    if (field === "email") {
      const email = trimmed.toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: "Adresse e-mail invalide." };
      }
      values.email = email;
    } else {
      values[field] = trimmed || null;
    }
  }

  return { value: values };
}

// Returns the public profile for the account in the current session.
async function getMyProfile(req, res) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Connexion requise." });
  }

  try {
    const result = await pool.query(
      `SELECT ${PROFILE_COLUMNS} FROM people WHERE id = $1`,
      [req.session.userId],
    );
    if (!result.rowCount) {
      return res.status(401).json({ error: "Compte introuvable." });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error while fetching candidate profile:", error);
    return res.status(500).json({ error: "Impossible de charger le profil." });
  }
}

// Updates only editable profile fields for the account in the current session.
async function updateMyProfile(req, res) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Connexion requise." });
  }

  const { value, error } = validateProfileChanges(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const fields = Object.keys(value);
  const parameters = fields.map((field) => value[field]);
  parameters.push(req.session.userId);
  const assignments = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  try {
    const result = await pool.query(
      `UPDATE people SET ${assignments} WHERE id = $${parameters.length}
       RETURNING ${PROFILE_COLUMNS}`,
      parameters,
    );
    if (!result.rowCount) {
      return res.status(401).json({ error: "Compte introuvable." });
    }
    return res.status(200).json(result.rows[0]);
  } catch (requestError) {
    if (requestError.code === "23505") {
      return res.status(409).json({ error: "Cette adresse e-mail est déjà utilisée." });
    }
    console.error("Error while updating candidate profile:", requestError);
    return res.status(500).json({ error: "Impossible de modifier le profil." });
  }
}

module.exports = { getMyProfile, updateMyProfile };
