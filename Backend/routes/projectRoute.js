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
  verifyAssessmentToken,
  generateAssessmentQuestions,
  submitAssessment,
  inviteToInterview,
  selectCandidate,
  submitInterview,
} = require("../controller/projectController");

// Public
projectRouter.get("/", getAllProjects);
projectRouter.get("/admin/stats", auth, getAdminStats);
projectRouter.get("/my-projects", auth, getMyProjects);
projectRouter.get("/my-applications", auth, getMyApplications);
projectRouter.get("/assessment/verify", verifyAssessmentToken);
projectRouter.get("/:id", checkUser, getProjectById);

// Protected
projectRouter.post("/", auth, createProject);
projectRouter.post("/:id/apply", auth, applyToProject);
projectRouter.put("/applications/:applicationId/status", auth, updateApplicationStatus);
projectRouter.post("/applications/:applicationId/analyze", auth, analyzeApplication);
projectRouter.post("/applications/:applicationId/interview", auth, inviteToInterview);
projectRouter.post("/applications/:applicationId/select", auth, selectCandidate);
projectRouter.post("/applications/:applicationId/submit-interview", auth, submitInterview);
projectRouter.post("/assessment/generate", auth, generateAssessmentQuestions);
projectRouter.post("/assessment/submit", auth, submitAssessment);

module.exports = projectRouter;


