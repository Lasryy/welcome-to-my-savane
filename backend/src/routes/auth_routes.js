const express = require("express");

const {
  register,
  login,
  getMe,
  logout,
} = require("../controllers/auth_controller.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", getMe);
router.post("/logout", logout);

module.exports = router;