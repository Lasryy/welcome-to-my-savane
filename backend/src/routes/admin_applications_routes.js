const express = require("express");
const {
  getAdminApplications,
  getAdminApplicationById,
  updateApplicationStatus,
} = require("../controllers/applications_controller");

const router = express.Router();

router.get("/", getAdminApplications);
router.get("/:id", getAdminApplicationById);
router.patch("/:id", updateApplicationStatus);

module.exports = router;
