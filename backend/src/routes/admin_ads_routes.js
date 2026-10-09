const express = require("express");
const {
  getAdminAds,
  getAdminAdById,
  createAdminAd,
  updateAdminAd,
} = require("../controllers/admin_ads_controller");

const router = express.Router();

router.get("/", getAdminAds);
router.post("/", createAdminAd);
router.get("/:id", getAdminAdById);
router.put("/:id", updateAdminAd);
router.patch("/:id", updateAdminAd);

module.exports = router;
