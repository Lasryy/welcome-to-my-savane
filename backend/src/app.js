const express = require("express");
const app = express();

const adsRoutes = require("./routes/ads_routes");
const authRoutes = require("./routes/auth_routes");
const sessionMiddleware = require("./middleware/session_middleware");

app.use(express.json());
app.use(sessionMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/ads", adsRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});