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
const {
  getCompanyCandidates,
  getCompanyCandidate,
} = require("../controllers/company_candidates_controller");

const router = express.Router();

router.get("/", getCompanyProfile);
router.get("/ads", getCompanyAds);
router.post("/ads", createCompanyAd);
router.patch("/ads/:id", updateCompanyAd);
router.get("/applications", getCompanyApplications);
router.get("/applications/:id", getCompanyApplication);
router.patch("/applications/:id", updateCompanyApplicationStatus);
router.get("/candidates", getCompanyCandidates);
router.get("/candidates/:personId", getCompanyCandidate);

module.exports = router;
