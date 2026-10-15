const pool = require("../db/pool");

async function requireCompany(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Connectez-vous pour accéder à l’espace entreprise." });
  }

  try {
    const result = await pool.query(
      "SELECT role, company_id FROM people WHERE id = $1",
      [req.session.userId],
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: "Compte introuvable. Reconnectez-vous." });
    if (user.role !== "COMPANY" || !user.company_id) {
      return res.status(403).json({ message: "Cette action est réservée aux comptes recruteur." });
    }

    req.companyId = user.company_id;
    return next();
  } catch (error) {
    console.error("Error while checking company access:", error);
    return res.status(500).json({ message: "Impossible de vérifier votre accès." });
  }
}

module.exports = requireCompany;
