const pool = require("../db/pool");

// Check the current database role before allowing access to the admin catalogue.
async function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Connectez-vous pour accéder à l’administration." });
  }

  try {
    const result = await pool.query(
      "SELECT role FROM people WHERE id = $1",
      [req.session.userId],
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Compte introuvable. Reconnectez-vous." });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({ message: "Cette action est réservée à l’administration." });
    }

    return next();
  } catch (error) {
    console.error("Error while checking admin access:", error);
    return res.status(500).json({ message: "Impossible de vérifier votre accès." });
  }
}

module.exports = requireAdmin;
