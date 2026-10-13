const express = require("express");
const {
  getMyProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projects_controller");

const router = express.Router();

router.get("/", getMyProjects);
router.post("/", createProject);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);

module.exports = router;
