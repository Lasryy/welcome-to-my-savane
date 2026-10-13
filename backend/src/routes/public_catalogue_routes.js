const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

// Ces routes ne montent aucun contrôleur d'écriture admin.
router.get("/companies", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, description, website, location, logo_url FROM companies ORDER BY name, id",
    );
    return res.json(result.rows);
  } catch (error) {
    console.error("Error while fetching public companies:", error);
    return res.status(500).json({ message: "Les entreprises ne peuvent pas être chargées." });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM categories ORDER BY name, id");
    return res.json(result.rows);
  } catch (error) {
    console.error("Error while fetching public categories:", error);
    return res.status(500).json({ message: "Les domaines ne peuvent pas être chargés." });
  }
});

module.exports = router;
