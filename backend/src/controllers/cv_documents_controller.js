const { randomUUID } = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const pool = require("../db/pool");
const { CV_STORAGE_DIR } = require("../config/cv");

// Check the account before reading an uploaded file or serving a document.
async function requireCvAccount(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Connecte-toi pour accéder aux CV." });
  }

  try {
    const result = await pool.query("SELECT id, role FROM people WHERE id = $1", [req.session.userId]);
    if (!result.rowCount) {
      return res.status(401).json({ message: "Compte introuvable. Reconnecte-toi." });
    }
    req.cvAccount = result.rows[0];
    return next();
  } catch (error) {
    console.error("Error while checking CV account:", error);
    return res.status(500).json({ message: "Impossible de vérifier ton accès." });
  }
}

async function createCvDocument(req, res) {
  const storageKey = `${randomUUID()}.pdf`;
  const filePath = path.join(CV_STORAGE_DIR, storageKey);
  const originalName = path.basename(req.file.originalname.replaceAll("\\", "/"))
    .replace(/[\x00-\x1f\x7f]/g, "").slice(0, 255);
  let fileWritten = false;

  try {
    await fs.mkdir(CV_STORAGE_DIR, { recursive: true });
    const file = await fs.open(filePath, "wx", 0o600);
    fileWritten = true;
    try {
      await file.writeFile(req.file.buffer);
    } finally {
      await file.close();
    }

    const result = await pool.query(
      `INSERT INTO cv_documents (person_id, original_name, storage_key, mime_type, size_bytes)
       VALUES ($1, $2, $3, 'application/pdf', $4)
       RETURNING id, original_name, mime_type, size_bytes, created_at`,
      [req.cvAccount.id, originalName, storageKey, req.file.size],
    );
    const document = result.rows[0];
    return res.status(201).json({ ...document, file_url: `/api/cv-documents/${document.id}/file` });
  } catch (error) {
    // A failed SQL insert must not leave an unused file behind.
    if (fileWritten) {
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.error("Error while removing failed CV upload:", cleanupError);
      }
    }
    console.error("Error while creating CV document:", error);
    return res.status(500).json({ message: "Impossible d’enregistrer le CV." });
  }
}

async function getCvFile(req, res, next) {
  const id = Number(req.params.id);
  if (!/^\d+$/.test(req.params.id) || !Number.isInteger(id) || id < 1 || id > 2147483647) {
    return res.status(400).json({ message: "L’identifiant du CV est invalide." });
  }

  try {
    // Return the same 404 for a missing document and another candidate's document.
    const result = await pool.query(
      `SELECT original_name, storage_key FROM cv_documents
       WHERE id = $1 AND (person_id = $2 OR $3 = 'ADMIN')`,
      [id, req.cvAccount.id, req.cvAccount.role],
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: "CV introuvable." });
    }

    const document = result.rows[0];
    res.attachment(document.original_name);
    res.type("pdf");
    if (req.query.download !== "1") {
      res.set("Content-Disposition", res.get("Content-Disposition").replace(/^attachment/, "inline"));
    }
    res.set("Cache-Control", "private, no-store");
    res.set("X-Content-Type-Options", "nosniff");

    return res.sendFile(document.storage_key, { root: CV_STORAGE_DIR, cacheControl: false }, (error) => {
      if (!error) return;
      if (res.headersSent) return next(error);
      // Remove PDF headers before sending a readable JSON error.
      res.removeHeader("Content-Disposition");
      res.type("json");
      if (error.status === 404 || error.code === "ENOENT") {
        return res.status(404).json({ message: "Le fichier CV est indisponible." });
      }
      return next(error);
    });
  } catch (error) {
    console.error("Error while reading CV document:", error);
    return res.status(500).json({ message: "Impossible de consulter le CV." });
  }
}

module.exports = { requireCvAccount, createCvDocument, getCvFile };
