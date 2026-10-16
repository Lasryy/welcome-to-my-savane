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
    if (user.role === "ADMIN") {
      const rawCompanyId = req.query.company_id;
      const companyId = typeof rawCompanyId === "string" && /^\d+$/.test(rawCompanyId)
        ? Number(rawCompanyId)
        : null;
      if (!Number.isSafeInteger(companyId) || companyId <= 0) {
        return res.status(400).json({ message: "Choisis une entreprise pour ouvrir cet espace." });
      }
      const company = await pool.query("SELECT id FROM companies WHERE id = $1", [companyId]);
      if (!company.rowCount) return res.status(404).json({ message: "Entreprise introuvable." });
      req.companyId = companyId;
      req.isAdminCompanyView = true;
      return next();
    }

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
