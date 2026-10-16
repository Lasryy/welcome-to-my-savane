const express = require("express");
const {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} = require("../controllers/admin_users_controller");

const router = express.Router();

router.get("/", getAdminUsers);
router.post("/", createAdminUser);
router.patch("/:id", updateAdminUser);
router.delete("/:id", deleteAdminUser);

module.exports = router;
