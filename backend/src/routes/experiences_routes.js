const express = require("express");
const {
  getMyExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
} = require("../controllers/experiences_controller");

const router = express.Router();

router.get("/", getMyExperiences);
router.post("/", createExperience);
router.patch("/:id", updateExperience);
router.delete("/:id", deleteExperience);

module.exports = router;
