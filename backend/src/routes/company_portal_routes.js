const express = require("express");
const {
  getCompanyProfile,
  getCompanyAds,
  createCompanyAd,
  updateCompanyAd,
  getCompanyApplications,
  getCompanyApplication,
  updateCompanyApplicationStatus,
} = require("../controllers/company_portal_controller");

const router = express.Router();

router.get("/", getCompanyProfile);
router.get("/ads", getCompanyAds);
router.post("/ads", createCompanyAd);
router.patch("/ads/:id", updateCompanyAd);
router.get("/applications", getCompanyApplications);
router.get("/applications/:id", getCompanyApplication);
router.patch("/applications/:id", updateCompanyApplicationStatus);

module.exports = router;
