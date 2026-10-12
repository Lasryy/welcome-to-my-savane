const pool = require("../db/pool");

// Saves an application for the logged-in person.
async function createApplication(req, res) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      error: "Connecte-toi pour postuler à une offre.",
    });
  }

  // Get the applicant's identity from the session, never from the submitted form.
  const personId = req.session.userId;
  const adId = Number(req.body?.ad_id);
  const message =
    typeof req.body?.message === "string" ? req.body.message.trim() : "";

  if (!Number.isSafeInteger(adId) || adId <= 0) {
    return res.status(400).json({ error: "L’offre sélectionnée est invalide." });
  }

  if (!message) {
    return res.status(400).json({
      error: "Écris un message de motivation avant d’envoyer ta candidature.",
    });
  }

  if (message.length > 5000) {
    return res.status(400).json({
      error: "Le message ne peut pas dépasser 5 000 caractères.",
    });
  }

  try {
    // The application is inserted only if the offer is still published.
    const result = await pool.query(
      `INSERT INTO applications (person_id, ad_id, message)
       SELECT $1, ads.id, $3
       FROM ads
       WHERE ads.id = $2 AND ads.status = 'published'
       RETURNING id, ad_id, message, status, created_at`,
      [personId, adId, message],
    );

    if (result.rows.length === 0) {
      const adResult = await pool.query(
        "SELECT status FROM ads WHERE id = $1",
        [adId],
      );

      if (adResult.rows.length === 0) {
        return res.status(404).json({ error: "Cette offre est introuvable." });
      }

      return res.status(409).json({
        error: "Cette offre est fermée. Tu ne peux plus y postuler.",
      });
    }

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    // The database UNIQUE constraint prevents a second application to the same offer.
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Tu as déjà envoyé une candidature pour cette offre.",
      });
    }

    console.error("Error while creating application:", error);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
}

module.exports = { createApplication };
