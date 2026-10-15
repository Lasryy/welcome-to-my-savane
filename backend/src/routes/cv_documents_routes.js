const express = require("express");
const {
  requireCvAccount,
  createCvDocument,
  getCvDocuments,
  getCurrentCv,
  setCurrentCv,
  removeCurrentCv,
  getCvFile,
} = require("../controllers/cv_documents_controller");
const { receiveCv, validateCv } = require("../middleware/cv_upload");
const requireCandidate = require("../middleware/require_candidate");

const router = express.Router();

router.use(requireCvAccount);
router.get("/", requireCandidate, getCvDocuments);
router.get("/current", requireCandidate, getCurrentCv);
router.delete("/current", requireCandidate, removeCurrentCv);
router.put("/:id/current", requireCandidate, setCurrentCv);
router.post("/", requireCandidate, receiveCv, validateCv, createCvDocument);
router.get("/:id/file", getCvFile);

module.exports = router;
