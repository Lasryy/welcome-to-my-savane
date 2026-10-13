const express = require("express");
const { getMyProfile, updateMyProfile } = require("../controllers/profile_controller");

const router = express.Router();

router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);

module.exports = router;
