const express = require("express");
const { getMyProfile, updateMyProfile, changeMyPassword } = require("../controllers/profile_controller");

const router = express.Router();

router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);
router.patch("/me/password", changeMyPassword);

module.exports = router;
