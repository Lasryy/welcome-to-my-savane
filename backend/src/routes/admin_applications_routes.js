const express = require("express");
const {
  getAdminApplications,
  getAdminApplicationById,
  updateAdminApplication,
} = require("../controllers/applications_controller");

const router = express.Router();

router.get("/", getAdminApplications);
router.get("/:id", getAdminApplicationById);
router.patch("/:id", updateAdminApplication);

module.exports = router;
