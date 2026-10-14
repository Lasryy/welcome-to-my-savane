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

const router = express.Router();

router.use(requireCvAccount);
router.get("/", getCvDocuments);
router.get("/current", getCurrentCv);
router.delete("/current", removeCurrentCv);
router.put("/:id/current", setCurrentCv);
router.post("/", receiveCv, validateCv, createCvDocument);
router.get("/:id/file", getCvFile);

module.exports = router;
