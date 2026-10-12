const express = require("express");
const { createApplication } = require("../controllers/applications_controller.js");

const router = express.Router();

router.post("/", createApplication);

module.exports = router;
