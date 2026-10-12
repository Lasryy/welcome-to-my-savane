const swaggerJSDoc = require("swagger-jsdoc");
const path = require("node:path");

const swaggerOptions = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Welcome To My Savane API",
      version: "1.0.0",
      description: "API du job board Welcome To My Savane. Le catalogue admin permet de créer, modifier, fermer, rouvrir et supprimer les offres sans candidature liée. Connectez-vous via POST /api/auth/login avec un compte ADMIN pour tester ces opérations ; le cookie de session est envoyé par le navigateur.",
    },
    servers: [
      {
        url: "/",
        description: "Serveur hébergeant cette documentation",
      },
    ],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
          description: "Cookie de session obtenu avec POST /api/auth/login.",
        },
      },
    },
  },
  apis: [path.resolve(__dirname, "../docs/api.js")],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// The admin catalogue routers are also mounted at these shorter paths.
swaggerSpec.paths["/api/companies"] = swaggerSpec.paths["/api/admin/companies"];
swaggerSpec.paths["/api/companies/{id}"] = swaggerSpec.paths["/api/admin/companies/{id}"];
swaggerSpec.paths["/api/categories"] = swaggerSpec.paths["/api/admin/categories"];
swaggerSpec.paths["/api/categories/{id}"] = swaggerSpec.paths["/api/admin/categories/{id}"];

module.exports = swaggerSpec;
