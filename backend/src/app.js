const express = require("express");
const path = require("node:path");

// Load the shared environment before importing the database and session middleware.
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const adsRoutes = require("./routes/ads_routes");
const authRoutes = require("./routes/auth_routes");
const applicationsRoutes = require("./routes/applications_routes");
const profileRoutes = require("./routes/profile_routes");
const favoritesRoutes = require("./routes/favorites_routes");
const projectsRoutes = require("./routes/projects_routes");
const experiencesRoutes = require("./routes/experiences_routes");
const cvDocumentsRoutes = require("./routes/cv_documents_routes");
const adminAdsRoutes = require("./routes/admin_ads_routes");
const adminApplicationsRoutes = require("./routes/admin_applications_routes");
const adminUsersRoutes = require("./routes/admin_users_routes");
const companiesRoutes = require("./routes/companies_routes");
const categoriesRoutes = require("./routes/categories_routes");
const publicCatalogueRoutes = require("./routes/public_catalogue_routes");
const companyPortalRoutes = require("./routes/company_portal_routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const sessionMiddleware = require("./middleware/session_middleware");
const requireAdmin = require("./middleware/require_admin");
const requireCompany = require("./middleware/require_company");
const requireCandidate = require("./middleware/require_candidate");

const app = express();

app.use(express.json());
app.use(sessionMiddleware);

app.get("/api-docs/openapi.json", (req, res) => {
  res.json(swaggerSpec);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/ads", adsRoutes);
app.use("/api/public", publicCatalogueRoutes);
app.use("/api/applications", requireCandidate, applicationsRoutes);
app.use("/api/people", requireCandidate, profileRoutes);
app.use("/api/favorites", requireCandidate, favoritesRoutes);
app.use("/api/projects", requireCandidate, projectsRoutes);
app.use("/api/experiences", requireCandidate, experiencesRoutes);
app.use("/api/cv-documents", cvDocumentsRoutes);

// Both URL forms use the same admin check and the same catalogue controllers.
app.use("/api/admin/ads", requireAdmin, adminAdsRoutes);
app.use("/api/admin/applications", requireAdmin, adminApplicationsRoutes);
app.use("/api/admin/users", requireAdmin, adminUsersRoutes);
app.use("/api/company", requireCompany, companyPortalRoutes);
app.use("/api/companies", requireAdmin, companiesRoutes);
app.use("/api/admin/companies", requireAdmin, companiesRoutes);
app.use("/api/categories", requireAdmin, categoriesRoutes);
app.use("/api/admin/categories", requireAdmin, categoriesRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

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
