const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Cloudinary treats PDFs and DOC/DOCX as raw files
    return {
      folder: "connectin_resumes",
      resource_type: "raw", 
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

const fileFilter = (req, file, cb) => {
  // Accept pdf, doc, docx
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/msword" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF and DOCX files are allowed."), false);
  }
};

const resumeUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB Limit
  },
});

module.exports = resumeUpload;
