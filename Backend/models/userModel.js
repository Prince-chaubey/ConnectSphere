const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
   
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"]
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },

    profilePic: {
      type: String,
      default: ""
    },

    coverPic: {
      type: String,
      default: ""
    },

    role: {
      type: String,
      enum: ["seeker", "creator"],
      default: "seeker"
    },

    // ==================== PROFILE ====================
    resume: {
      type: String,
      default: ""
    },

    bio: {
      type: String,
      default: ""
    },

    location: {
      type: String,
      default: "",
      trim: true
    },

    skills: {
      type: [String],
      default: []
    },

    isProfileComplete: {
      type: Boolean,
      default: false
    },

    experience: {
      type: String,
      enum: ["Beginner", "Intermediate", "Expert"],
      default: "Beginner"
    },

    availability: {
      type: String,
      enum: ["Available", "Busy", "Looking for team", "Not available"],
      default: "Available"
    },

    hourlyRate: {
      type: Number,
      default: 0,
      min: 0
    },

    phone: {
      type: String,
      default: "",
      trim: true,
      match: [/^\d{10}$/, "Enter valid 10-digit phone number"]
    },

    // ==================== SOCIAL ====================
    social: {
      github: {
        type: String,
        default: "",
        trim: true
      },
      linkedin: {
        type: String,
        default: "",
        trim: true
      },
      portfolio: {
        type: String,
        default: "",
        trim: true
      }
    },

    // ==================== STATS ====================
    stats: {
      applications: {
        type: Number,
        default: 0
      },
      teamsJoined: {
        type: Number,
        default: 0
      },
      projectsCreated: {
        type: Number,
        default: 0
      },
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      }
    },

    // ==================== DATE ====================
    joined: {
      type: Date,
      default: Date.now
    },

    resetPasswordOTP: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// ==================== METHODS ====================

// Check profile completion
userSchema.methods.checkProfileComplete = function () {
  const hasRequiredFields =
    this.name &&
    this.email &&
    this.bio &&
    this.location;

  const hasSkills = this.skills && this.skills.length > 0;

  this.isProfileComplete = hasRequiredFields && hasSkills;
  return this.isProfileComplete;
};

module.exports = mongoose.model("User", userSchema);

