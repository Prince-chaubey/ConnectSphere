const express = require("express");
const profileRouter = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const resumeUpload = require("../middleware/resumeUpload");

const {
  getProfile,
  getProfileById,
  updateProfile,
  updateProfilePicture,
  updateCoverPicture,
  updateStats,
  updateRating,
  updateResume
} = require("../controller/profileController");


// All routes require authentication
profileRouter.use(auth);

// Profile routes
profileRouter.get("/profile", getProfile);
profileRouter.get("/profile/:id", getProfileById);
profileRouter.put("/profile", updateProfile);
profileRouter.put(
  "/profile/picture",
  auth,
  upload.single("profilePic"),
  updateProfilePicture
);

profileRouter.put(
  "/profile/resume",
  auth,
  resumeUpload.single("resume"),
  updateResume
);

profileRouter.put("/profile/cover", updateCoverPicture);
profileRouter.put("/profile/stats/:type", updateStats);
profileRouter.put("/profile/rating/:userId", updateRating);

module.exports = profileRouter;