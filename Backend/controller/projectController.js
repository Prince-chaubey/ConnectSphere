const Project = require("../models/projectModel");
const Application = require("../models/applicationModel");
const User = require("../models/userModel");
const analyzeResume = require("../utils/analyzeResume");
const {
  sendApplicationConfirmation,
  sendCreatorNotification,
  sendApplicationStatusEmail,
} = require("../utils/emailer");

// ─── Create Project (Creator only) ────────────────────────────────────────────
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
      .populate("project", "title createdBy")
      .populate("applicant", "name email");

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
            "roles.$.membersFilled": 1 
          } 
        }
      );
    }

    // Send email notification for accepted/rejected status
    if (status === "accepted" || status === "rejected") {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        sendApplicationStatusEmail({
          toEmail: application.applicant.email,
          applicantName: application.applicant.name,
          projectTitle: application.project.title,
          roleName: application.roleName,
          status,
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
};
