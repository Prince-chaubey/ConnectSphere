const express = require("express");
const projectRouter = express.Router();
const auth = require("../middleware/auth");
const checkUser = require("../middleware/checkUser");

const {
  createProject,
  getAllProjects,
  getProjectById,
  applyToProject,
  getMyApplications,
  getMyProjects,
  updateApplicationStatus,
  getAdminStats,
  analyzeApplication,
} = require("../controller/projectController");

// Public
projectRouter.get("/", getAllProjects);
projectRouter.get("/admin/stats", auth, getAdminStats);
projectRouter.get("/my-projects", auth, getMyProjects);
projectRouter.get("/my-applications", auth, getMyApplications);
projectRouter.get("/:id", checkUser, getProjectById);

// Protected
projectRouter.post("/", auth, createProject);
projectRouter.post("/:id/apply", auth, applyToProject);
projectRouter.put("/applications/:applicationId/status", auth, updateApplicationStatus);
projectRouter.post("/applications/:applicationId/analyze", auth, analyzeApplication);

module.exports = projectRouter;

