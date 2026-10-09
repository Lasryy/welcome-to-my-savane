const bcrypt = require("bcrypt");
const pool = require("../db/pool");

// Creates a new account. The database gives it the USER role by default.
async function register(req, res) {
  const body = req.body ?? {};

  const firstName =
    typeof body.first_name === "string" ? body.first_name.trim() : "";
  const lastName =
    typeof body.last_name === "string" ? body.last_name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const phone =
    typeof body.phone === "string" ? body.phone.trim() || null : null;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      error: "Prénom, nom, e-mail et mot de passe obligatoires.",
    });
  }

  if (firstName.length > 100 || lastName.length > 100 || email.length > 255) {
    return res.status(400).json({
      error: "Un des champs dépasse la longueur autorisée.",
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Adresse e-mail invalide." });
  }

  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).json({
      error: "Le mot de passe doit contenir entre 8 et 72 octets.",
    });
  }

  if (phone && phone.length > 30) {
    return res.status(400).json({ error: "Numéro de téléphone trop long." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO people (first_name, last_name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, first_name, last_name, email, phone, role`,
      [firstName, lastName, email, phone, passwordHash],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    // PostgreSQL code 23505 means a unique value already exists.
    if (error.code === "23505") {
      return res.status(409).json({ error: "Cette adresse e-mail est déjà utilisée." });
    }

    console.error("Error while registering user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Checks the password and starts a session for the matching account.
async function login(req, res) {
  const body = req.body ?? {};
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail et mot de passe obligatoires." });
  }

  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone, password_hash, role
       FROM people
       WHERE LOWER(email) = $1`,
      [email],
    );

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "E-mail ou mot de passe incorrect." });
    }

    if (!req.session) {
      return res.status(500).json({ error: "Session serveur non configurée." });
    }

    // Give the logged-in user a fresh session.
    return req.session.regenerate((error) => {
      if (error) {
        console.error("Error while creating session:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      req.session.userId = user.id;

      return res.status(200).json({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });
    });
  } catch (error) {
    console.error("Error while logging in:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Returns the account linked to the current session.
async function getMe(req, res) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Connexion requise." });
  }

  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone, role
       FROM people
       WHERE id = $1`,
      [req.session.userId],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Compte introuvable." });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error while fetching current user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Ends the current session.
function logout(req, res) {
  if (!req.session) {
    return res.status(500).json({ error: "Session serveur non configurée." });
  }

  return req.session.destroy((error) => {
    if (error) {
      console.error("Error while logging out:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Déconnexion réussie." });
  });
}

module.exports = {
  register,
  login,
  getMe,
  logout,
};