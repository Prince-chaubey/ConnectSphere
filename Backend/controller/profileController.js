const User = require("../models/userModel");

const getProfile = async (req, res) => {
  try {
    // console.log(req.userId);
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        coverPic: user.coverPic,
        resume: user.resume,
        location: user.location,
        joined: user.joined,
        bio: user.bio,
        skills: user.skills,
        social: user.social,
        stats: user.stats,
        experience: user.experience,
        availability: user.availability,
        hourlyRate: user.hourlyRate,
        phone: user.phone,
        isProfileComplete: user.isProfileComplete,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        coverPic: user.coverPic,
        resume: user.resume,
        location: user.location,
        joined: user.joined,
        bio: user.bio,
        skills: user.skills,
        social: user.social,
        stats: user.stats,
        experience: user.experience,
        availability: user.availability,
        hourlyRate: user.hourlyRate,
        phone: user.phone,
        isProfileComplete: user.isProfileComplete,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get profile by id error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      location,
      skills,
      social,
      experience,
      availability,
      hourlyRate,
      phone,
      role,
    } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields only if provided
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (skills !== undefined) user.skills = skills;
    if (social !== undefined) user.social = social;
    if (experience !== undefined) user.experience = experience;
    if (availability !== undefined) user.availability = availability;
    if (hourlyRate !== undefined) user.hourlyRate = hourlyRate;
    if (phone !== undefined) user.phone = phone;

    // Check if profile is complete
    const requiredFields = ["name", "email", "bio", "location"];
    const hasRequiredFields = requiredFields.every((field) => {
      return user[field] && user[field] !== "";
    });
    const hasSkills = user.skills && user.skills.length > 0;
    user.isProfileComplete = hasRequiredFields && hasSkills;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        coverPic: user.coverPic,
        resume: user.resume,
        location: user.location,
        joined: user.joined,
        bio: user.bio,
        skills: user.skills,
        social: user.social,
        stats: user.stats,
        experience: user.experience,
        availability: user.availability,
        hourlyRate: user.hourlyRate,
        phone: user.phone,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // multer-storage-cloudinary puts the Cloudinary URL in req.file.path
    const imageUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { profilePic: imageUrl },
      { new: true },
    ).select("-password");

    res.json({
      success: true,
      message: "Profile picture updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile picture error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded or invalid file format",
      });
    }

    // multer-storage-cloudinary attaches the remote url in 'path'
    const resumeUrl = req.file.path;
    console.log("File Object:", req.file); // ✅ CORRECT PLACE
    console.log("File URL:", req.file.path); // 🔥 MOST IMPORTANT

    const user = await User.findByIdAndUpdate(
      req.userId,
      { resume: resumeUrl },
      { new: true },
    ).select("-password");

    res.json({
      success: true,
      message: "Resume uploaded successfully",
      user,
    });
  } catch (error) {
    console.error("Update resume error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateCoverPicture = async (req, res) => {
  try {
    const { coverPic } = req.body;

    if (!coverPic) {
      return res.status(400).json({
        success: false,
        message: "Cover picture URL is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { coverPic },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Cover picture updated successfully",
      coverPic: user.coverPic,
    });
  } catch (error) {
    console.error("Update cover picture error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateStats = async (req, res) => {
  try {
    const { type } = req.params;

    if (!["application", "team", "project"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stat type. Use 'application', 'team', or 'project'",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update the appropriate stat
    if (type === "application") {
      user.stats.applications += 1;
    } else if (type === "team") {
      user.stats.teamsJoined += 1;
    } else if (type === "project") {
      user.stats.projectsCreated += 1;
    }

    await user.save();

    res.json({
      success: true,
      message: `${type} stat updated successfully`,
      stats: user.stats,
    });
  } catch (error) {
    console.error("Update stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateRating = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const { userId } = req.params;

    if (!rating || rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 0 and 5",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate new average rating
    // This is simplified - you might want to store all ratings in an array
    const newRating = (user.stats.rating + rating) / 2;
    user.stats.rating = Math.round(newRating * 10) / 10;

    await user.save();

    res.json({
      success: true,
      message: "Rating updated successfully",
      rating: user.stats.rating,
    });
  } catch (error) {
    console.error("Update rating error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getProfile,
  getProfileById,
  updateProfile,
  updateProfilePicture,
  updateCoverPicture,
  updateStats,
  updateRating,
  updateResume,
};
