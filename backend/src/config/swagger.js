const swaggerJSDoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Welcome To My Savane API",
      version: "1.0.0",
      description: "API du job board Welcome To My Savane.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Serveur local (port par défaut)",
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
  apis: ["./src/docs/api.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// The admin catalogue routers are also mounted at these shorter paths.
swaggerSpec.paths["/api/companies"] = swaggerSpec.paths["/api/admin/companies"];
swaggerSpec.paths["/api/companies/{id}"] = swaggerSpec.paths["/api/admin/companies/{id}"];
swaggerSpec.paths["/api/categories"] = swaggerSpec.paths["/api/admin/categories"];
swaggerSpec.paths["/api/categories/{id}"] = swaggerSpec.paths["/api/admin/categories/{id}"];

module.exports = swaggerSpec;
