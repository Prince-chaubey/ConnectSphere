const Project = require("../models/projectModel");
const Application = require("../models/applicationModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const analyzeResume = require("../utils/analyzeResume");
const generateAssessment = require("../utils/generateAssessment");
const {
  sendApplicationConfirmation,
  sendCreatorNotification,
  sendApplicationStatusEmail,
  sendShortlistEmail,
} = require("../utils/emailer");

// Create Project (Creator only)
const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      roles,
      tags,
      deadline,
      techStack,
      duration,
      budget,
    } = req.body;

    if (!title || !description || !type || !roles || roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title, description, type, and at least one role are required.",
      });
    }

    // Validate budget for freelancing projects
    if (type === "freelancing" && (!budget || Number(budget) <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Budget is required for freelancing projects.",
      });
    }

    // Calculate totalMembers from all roles
    const totalMembers = roles.reduce(
      (sum, r) => sum + Number(r.membersNeeded || 0),
      0
    );

    const project = await Project.create({
      title,
      description,
      type,
      createdBy: req.userId,
      roles,
      totalMembers,
      tags: tags || [],
      deadline: deadline || null,
      techStack: techStack || [],
      duration: duration || "",
      budget: type === "freelancing" ? Number(budget) : 0,
    });

    // update creator stats
    await User.findByIdAndUpdate(req.userId, {
      $inc: { "stats.projectsCreated": 1 },
    });

    res.status(201).json({ success: true, project });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Projects (Public, with filters) ──────────────────────────────────
const getAllProjects = async (req, res) => {
  try {
    const { type, status, search } = req.query;
    const filter = {};

    if (type && type !== "all") filter.type = type;
    if (status) filter.status = status;
    else filter.status = "open";

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const projects = await Project.find(filter)
      .populate("createdBy", "name profilePic role")
      .sort({ createdAt: -1 });

    // attach applicant count per project
    const projectsWithCounts = await Promise.all(
      projects.map(async (p) => {
        const count = await Application.countDocuments({ project: p._id });
        return { ...p.toObject(), applicantCount: count };
      })
    );

    res.json({ success: true, projects: projectsWithCounts });
  } catch (error) {
    console.error("Get all projects error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Single Project ────────────────────────────────────────────────────────
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "createdBy",
      "name profilePic bio email location"
    );

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const applicantCount = await Application.countDocuments({
      project: project._id,
    });

    let hasApplied = false;
    if (req.userId) {
      const existing = await Application.findOne({
        project: project._id,
        applicant: req.userId,
      });
      hasApplied = !!existing;
    }

    res.json({ success: true, project: { ...project.toObject(), applicantCount, hasApplied } });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Apply to Project ──────────────────────────────────────────────────────────
const applyToProject = async (req, res) => {
  try {
    const { roleName, coverLetter, resumeUrl } = req.body;
    const projectId = req.params.id;

    const project = await Project.findById(projectId).populate(
      "createdBy",
      "name email"
    );

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    if (project.status !== "open") {
      return res
        .status(400)
        .json({ success: false, message: "This project is no longer accepting applications." });
    }

    if (project.createdBy._id.toString() === req.userId.toString()) {
      return res.status(400).json({ success: false, message: "Project creators cannot apply to their own projects." });
    }

    // Check role exists
    const role = project.roles.find((r) => r.roleName === roleName);
    if (!role) {
      return res
        .status(400)
        .json({ success: false, message: "Role not found in this project." });
    }

    // Check slots
    if (role.membersFilled >= role.membersNeeded) {
      return res
        .status(400)
        .json({ success: false, message: "This role is already full." });
    }

    // Check if already applied
    const existing = await Application.findOne({
      project: projectId,
      applicant: req.userId,
      roleName,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this role.",
      });
    }

    const application = await Application.create({
      project: projectId,
      applicant: req.userId,
      roleName,
      coverLetter: coverLetter || "",
      resumeUrl: resumeUrl || "",
    });

    // Update user stats
    await User.findByIdAndUpdate(req.userId, {
      $inc: { "stats.applications": 1 },
    });

    // Fetch applicant info for emails
    const applicant = await User.findById(req.userId).select("name email");

    // Send emails (non-blocking)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      sendApplicationConfirmation({
        toEmail: applicant.email,
        applicantName: applicant.name,
        projectTitle: project.title,
        projectType: project.type,
        roleName,
        resumeUrl: resumeUrl || "",
      });

      if (project.createdBy?.email) {
        sendCreatorNotification({
          toEmail: project.createdBy.email,
          creatorName: project.createdBy.name,
          applicantName: applicant.name,
          projectTitle: project.title,
          roleName,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Application submitted successfully! Check your email for confirmation.",
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "You have already applied for this role." });
    }
    console.error("Apply error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── My Applications (User) ────────────────────────────────────────────────────
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.userId })
      .populate({
        path: "project",
        select: "title type status deadline createdBy",
        populate: {
          path: "createdBy",
          select: "name profilePic",
        },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    console.error("My applications error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── My Projects (Creator) ─────────────────────────────────────────────────────
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.userId }).sort({
      createdAt: -1,
    });

    const projectsWithCounts = await Promise.all(
      projects.map(async (p) => {
        const count = await Application.countDocuments({ project: p._id });
        const applications = await Application.find({ project: p._id })
          .populate("applicant", "name email profilePic skills experience")
          .sort({ createdAt: -1 });
        return { ...p.toObject(), applicantCount: count, applications };
      })
    );

    res.json({ success: true, projects: projectsWithCounts });
  } catch (error) {
    console.error("My projects error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Application Status (Creator) ──────────────────────────────────────
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { applicationId } = req.params;

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const application = await Application.findById(applicationId)
      .populate({
        path: "project",
        select: "title createdBy roles type",
      })
      .populate("applicant", "name email skills");

    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    // Ensure only creator can update
    if (application.project.createdBy.toString() !== req.userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    application.status = status;
    await application.save();

    // If accepted, increment project and role filled counts
    if (status === "accepted") {
      await Project.updateOne(
        { _id: application.project._id, "roles.roleName": application.roleName },
        {
          $inc: {
            membersFilled: 1,
            "roles.$.membersFilled": 1,
          },
        }
      );
    }

    // Send email notification for accepted/rejected status
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      sendApplicationStatusEmail({
        toEmail: application.applicant.email,
        applicantName: application.applicant.name,
        projectTitle: application.project.title,
        roleName: application.roleName,
        status,
      });

      // ── Shortlisting logic — only on acceptance ──────────────────────────────
      if (status === "accepted") {
        const role = application.project.roles.find(
          (r) => r.roleName === application.roleName
        );
        const skillsRequired = role?.skillsRequired || [];
        const applicantSkills = application.applicant?.skills || [];

        // Compute skill match %
        let skillMatch = 100; // Default to 100% if no skills are specifically required
        if (skillsRequired.length > 0) {
          const matched = skillsRequired.filter((req) =>
            applicantSkills.some(
              (s) => s.toLowerCase().trim() === req.toLowerCase().trim()
            )
          );
          skillMatch = Math.round((matched.length / skillsRequired.length) * 100);
        }

        // Generate a short-lived assessment token (48 hours)
        const assessmentToken = jwt.sign(
          {
            userId: application.applicant._id,
            applicationId: application._id,
            projectId: application.project._id,
            roleName: application.roleName,
            skillMatch,
          },
          process.env.JWT_SECRET,
          { expiresIn: "48h" }
        );

        // Store token on application for verification
        application.assessmentToken = assessmentToken;
        await application.save();

        sendShortlistEmail({
          toEmail: application.applicant.email,
          applicantName: application.applicant.name,
          projectTitle: application.project.title,
          roleName: application.roleName,
          skillMatch,
          assessmentToken,
        });
      }
    }

    res.json({
      success: true,
      message: `Application ${status}`,
      application,
    });
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Verify Assessment Token ───────────────────────────────────────────────────
const verifyAssessmentToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const application = await Application.findById(decoded.applicationId)
      .populate("project", "title type roles")
      .populate("applicant", "name email");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.status !== "accepted") {
      return res.status(403).json({ success: false, message: "Application is not accepted" });
    }

    if (application.assessmentSubmitted) {
      return res.status(400).json({ success: false, message: "Assessment already submitted" });
    }

    res.json({
      success: true,
      info: {
        applicantName: application.applicant.name,
        projectTitle: application.project.title,
        roleName: decoded.roleName,
        skillMatch: decoded.skillMatch,
      },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Assessment link has expired" });
    }
    console.error("Verify assessment token error:", error);
    res.status(401).json({ success: false, message: "Invalid assessment token" });
  }
};

// ─── Generate Assessment Questions (Grok AI) ───────────────────────────────────
const generateAssessmentQuestions = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    // Verify the token and check user is logged in
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure the logged-in user matches the token owner
    if (decoded.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized: token does not belong to this user" });
    }

    const application = await Application.findById(decoded.applicationId)
      .populate("project", "title roles");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.assessmentSubmitted) {
      return res.status(400).json({ success: false, message: "You have already submitted this assessment" });
    }

    const role = application.project.roles.find(
      (r) => r.roleName === application.roleName
    );
    const skillsRequired = role?.skillsRequired || [];

    const questions = await generateAssessment({
      roleName: application.roleName,
      skills: skillsRequired,
      projectTitle: application.project.title,
    });

    // Strip correct answers before sending to client
    const sanitizedQuestions = questions.map(({ correct, ...rest }) => rest);

    // Store hashed answers server-side on the application
    application.assessmentAnswers = questions.map((q) => q.correct);
    await application.save();

    res.json({ success: true, questions: sanitizedQuestions });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Assessment link has expired" });
    }
    console.error("Generate assessment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Submit Assessment ─────────────────────────────────────────────────────────
const submitAssessment = async (req, res) => {
  try {
    const { token, answers } = req.body;
    if (!token || !answers) {
      return res.status(400).json({ success: false, message: "Token and answers are required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const application = await Application.findById(decoded.applicationId)
      .populate("project", "title")
      .populate("applicant", "name email");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.assessmentSubmitted) {
      return res.status(400).json({ success: false, message: "Assessment already submitted" });
    }

    // Grade the answers
    const correctAnswers = application.assessmentAnswers || [];
    let score = 0;
    answers.forEach((ans, i) => {
      if (ans === correctAnswers[i]) score++;
    });
    const percentage = Math.round((score / correctAnswers.length) * 100);

    // Persist result
    application.assessmentSubmitted = true;
    application.assessmentScore = percentage;
    application.assessmentSubmittedAt = new Date();
    await application.save();

    res.json({
      success: true,
      score: percentage,
      correct: score,
      total: correctAnswers.length,
      message: `You scored ${score}/${correctAnswers.length} (${percentage}%)`,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Assessment time expired" });
    }
    console.error("Submit assessment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Analyze Application CV with Gemini AI ─────────────────────────────────────
const analyzeApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
      .populate({
        path: "project",
        select: "title roles createdBy",
      })
      .populate("applicant", "name email skills");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Only the project creator can analyze
    if (application.project.createdBy.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (!application.resumeUrl) {
      return res.status(400).json({
        success: false,
        message: "This applicant has not uploaded a resume.",
      });
    }

    // Find role details from the project
    const role = application.project.roles.find(
      (r) => r.roleName === application.roleName
    );

    const analysis = await analyzeResume({
      resumeUrl: application.resumeUrl,
      roleName: application.roleName,
      roleDescription: role?.description || "",
      skillsRequired: role?.skillsRequired || [],
      applicantSkills: application.applicant?.skills || [],
    });

    // Persist result on the application document
    application.aiScore      = analysis.score;
    application.aiSummary    = analysis.summary;
    application.aiStrengths  = analysis.strengths || [];
    application.aiGaps       = analysis.gaps || [];
    application.aiAnalyzedAt = new Date();
    await application.save();

    res.json({ success: true, analysis });
  } catch (error) {
    console.error("Analyze application error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin Stats (Admin only) ──────────────────────────────────────────────────
const getAdminStats = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    const projects = await Project.find()
      .populate("createdBy", "name email profilePic")
      .sort({ createdAt: -1 });

    const stats = await Promise.all(
      projects.map(async (p) => {
        const count = await Application.countDocuments({ project: p._id });
        const pending = await Application.countDocuments({
          project: p._id,
          status: "pending",
        });
        const accepted = await Application.countDocuments({
          project: p._id,
          status: "accepted",
        });
        const rejected = await Application.countDocuments({
          project: p._id,
          status: "rejected",
        });
        return {
          ...p.toObject(),
          applicantCount: count,
          pending,
          accepted,
          rejected,
        };
      })
    );

    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalApplications = await Application.countDocuments();

    res.json({
      success: true,
      overview: { totalUsers, totalProjects, totalApplications },
      projects: stats,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const inviteToInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    // Application is already required at the top
    const application = await Application.findById(applicationId)
      .populate("applicant", "name email")
      .populate("project", "createdBy title roles");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Verify creator ownership
    if (application.project.createdBy.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    application.status = "interview_invited";
    application.interviewInvited = true;
    await application.save();

    const { sendInterviewEmail } = require("../utils/emailer");
    sendInterviewEmail({
      toEmail: application.applicant.email,
      applicantName: application.applicant.name,
      projectTitle: application.project.title,
      roleName: application.roleName,
      applicationId: application._id
    });

    res.json({ success: true, message: "Interview invitation sent successfully" });
  } catch (error) {
    console.error("Invite to Interview Error:", error);
    res.status(500).json({ success: false, message: "Failed to send invitation" });
  }
};

const selectCandidate = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await Application.findById(applicationId)
      .populate("applicant", "name email")
      .populate("project", "createdBy title roles");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.project.createdBy.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    application.status = "selected";
    await application.save();

    // Increment project membersFilled
    await Project.findByIdAndUpdate(application.project._id, {
      $inc: { membersFilled: 1 }
    });

    // Also increment membersFilled in the exact role
    await Project.updateOne(
      { _id: application.project._id, "roles.roleName": application.roleName },
      { $inc: { "roles.$.membersFilled": 1 } }
    );

    const { sendSelectionEmail } = require("../utils/emailer");
    sendSelectionEmail({
      toEmail: application.applicant.email,
      applicantName: application.applicant.name,
      projectTitle: application.project.title,
      roleName: application.roleName,
    });

    res.json({ success: true, message: "Candidate selected successfully" });
  } catch (error) {
    console.error("Select Candidate Error:", error);
    res.status(500).json({ success: false, message: "Failed to select candidate" });
  }
};

const submitInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ success: false, message: "Interview transcript is required" });
    }

    const application = await Application.findById(applicationId)
      .populate("project", "title roles createdBy");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Must be the applicant
    if (application.applicant.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (application.interviewSubmitted) {
      return res.status(400).json({ success: false, message: "Interview already submitted" });
    }

    const evaluateInterview = require("../utils/evaluateInterview");
    
    // Evaluate the transcript using AI
    const evaluation = await evaluateInterview({
      roleName: application.roleName,
      projectTitle: application.project.title,
      transcript
    });

    application.interviewScore = evaluation.score;
    application.interviewSummary = evaluation.summary;
    application.interviewSubmitted = true;
    application.interviewSubmittedAt = new Date();

    await application.save();

    res.json({
      success: true,
      message: "Interview submitted and evaluated successfully.",
      evaluation: {
        score: evaluation.score,
        summary: evaluation.summary
      }
    });

  } catch (error) {
    console.error("Submit Interview Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
