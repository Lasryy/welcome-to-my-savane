const express = require('express');
const path = require("node:path");
const app = express();

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const adsRoutes = require("./routes/ads_routes");
const adminAdsRoutes = require("./routes/admin_ads_routes");
const companiesRoutes = require("./routes/companies_routes");
const categoriesRoutes = require("./routes/categories_routes");

app.use(express.json());

app.use("/api/ads", adsRoutes);
app.use("/api/admin/ads", adminAdsRoutes);

// Keep the frontend endpoints and expose the requested admin aliases.
app.use("/api/companies", companiesRoutes);
app.use("/api/admin/companies", companiesRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/admin/categories", categoriesRoutes);

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Le corps de la requête doit contenir un JSON valide." });
  }

  console.error("Unhandled API error:", error);
  return res.status(500).json({ message: "Une erreur interne est survenue." });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API running on port ${PORT}`);
  });
}

module.exports = app;
