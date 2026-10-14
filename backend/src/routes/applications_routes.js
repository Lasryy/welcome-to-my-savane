const express = require("express");
const {
  createApplication,
  getTodayApplicationCount,
  getMyApplications,
} = require("../controllers/applications_controller.js");

const router = express.Router();

router.get("/mine", getMyApplications);
router.get("/today", getTodayApplicationCount);
router.post("/", createApplication);

module.exports = router;
