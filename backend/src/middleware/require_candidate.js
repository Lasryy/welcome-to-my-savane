const pool = require("../db/pool");

async function requireCandidate(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ message: "Connectez-vous pour accéder à votre profil candidat." });
  try {
    const result = await pool.query("SELECT role FROM people WHERE id = $1", [req.session.userId]);
    if (!result.rowCount) return res.status(401).json({ message: "Compte introuvable. Reconnectez-vous." });
    if (result.rows[0].role !== "USER") return res.status(403).json({ message: "Cette action est réservée aux comptes candidats." });
    return next();
  } catch (error) {
    console.error("Error while checking candidate access:", error);
    return res.status(500).json({ message: "Impossible de vérifier votre accès." });
  }
}

module.exports = requireCandidate;
