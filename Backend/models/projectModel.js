const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  roleName: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  skillsRequired: { type: [String], default: [] },
  membersNeeded: { type: Number, required: true, min: 1 },
  membersFilled: { type: Number, default: 0 },
});

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["capstone", "hackathon", "group", "freelancing"],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roles: [roleSchema],
    totalMembers: { type: Number, required: true, min: 1 },
    membersFilled: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ["open", "closed", "completed"],
      default: "open",
    },
    // Extra details
    techStack: { type: [String], default: [] },
    duration: { type: String, default: "" },
    teamSize: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
