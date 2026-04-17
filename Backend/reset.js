const mongoose = require("mongoose");
const Project = require("./models/projectModel");
const Application = require("./models/applicationModel");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/connectsphere").then(async () => {
  console.log("Connected to DB, resetting team sizes...");
  
  // Reset all projects
  await Project.updateMany({}, { $set: { membersFilled: 0 } });
  
  // Reset roles array objects inside projects
  const projects = await Project.find();
  for (const p of projects) {
    p.roles.forEach(r => r.membersFilled = 0);
    p.status = "open";
    await p.save();
  }
  
  // Set all selected applications back to interview_invited
  await Application.updateMany({ status: "selected" }, { $set: { status: "interview_invited" } });

  console.log("Reset Complete!");
  process.exit(0);
});
