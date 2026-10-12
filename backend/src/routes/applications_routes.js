const express = require("express");
const {
  createApplication,
  getMyApplications,
} = require("../controllers/applications_controller.js");

const router = express.Router();

router.get("/mine", getMyApplications);
router.post("/", createApplication);

module.exports = router;
