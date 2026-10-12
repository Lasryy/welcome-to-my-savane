const express = require("express");
const {
  getAdminApplications,
  updateApplicationStatus,
} = require("../controllers/applications_controller");

const router = express.Router();

router.get("/", getAdminApplications);
router.patch("/:id", updateApplicationStatus);

module.exports = router;
