const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Fixed folder for guideline uploads
const uploadDir = path.join(__dirname, "../uploads/guidelines");

// Ensure folder exists
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Saving file to:", uploadDir); // 🔹 debug destination
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    console.log("Uploading file:", file.originalname, "as", uniqueSuffix + "-" + file.originalname); // 🔹 debug filename
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// Accept all file types
const fileFilter = (req, file, cb) => {
  console.log("File type:", file.mimetype); // 🔹 debug mimetype
  cb(null, true);
};

// Multer instance
const upload = multer({ storage, fileFilter });

// Debug helper (optional)
upload.debugMiddleware = (req, res, next) => {
  console.log("Request files:", req.files);  // 🔹 see uploaded files
  console.log("Request body:", req.body);    // 🔹 see form data
  next();
};

module.exports = upload;