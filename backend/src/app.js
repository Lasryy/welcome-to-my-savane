const express = require('express');
const app = express();

const adsRoutes = require("./routes/ads_routes");

app.use(express.json());

app.use("/api/ads", adsRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});