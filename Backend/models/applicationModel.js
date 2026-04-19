const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roleName: {
      type: String,
      required: true,
      trim: true,
    },
    coverLetter: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    resumeUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "interview_invited", "selected"],
      default: "pending",
    },

    // ── AI CV Analysis ──────────────────────────────────────────────────────────
    aiScore:       { type: Number,   default: null },
    aiSummary:     { type: String,   default: "" },
    aiStrengths:   { type: [String], default: [] },
    aiGaps:        { type: [String], default: [] },
    aiAnalyzedAt:  { type: Date,     default: null },

    // ── Online Assessment ────────────────────────────────────────────────────────
    assessmentToken:       { type: String,    default: null },
    assessmentAnswers:     { type: [Number],  default: [] },   // correct answer indices (server-only)
    assessmentScore:       { type: Number,    default: null },  // 0-100 percentage
    assessmentSubmitted:   { type: Boolean,   default: false },
    assessmentSubmittedAt: { type: Date,      default: null },

    // ── Video Interview ────────────────────────────────────────────────────────
    interviewScore:        { type: Number,    default: null },  // 0-100 percentage
    interviewSummary:      { type: String,    default: "" },
    interviewSubmitted:    { type: Boolean,   default: false },
    interviewSubmittedAt:  { type: Date,      default: null },
  },
  { timestamps: true }
);

// Prevent duplicate applications per role per project
applicationSchema.index(
  { project: 1, applicant: 1, roleName: 1 },
  { unique: true }
);

module.exports = mongoose.model("Application", applicationSchema);
