const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

// ✅ CONTROLLERS
const userController = require("../controllers/userController");

// ✅ MODEL
const UserModel = require("../models/User");

/* =========================
   USER ROUTES
========================= */

router.get("/users", userController.getUsers);
router.post("/register", userController.registerUser);
router.put("/update/:id", userController.updateUser);
router.post("/login", userController.loginUser);

router.put("/archive/:id", userController.archiveUser);
router.put("/restore/:id", userController.restoreUser);

router.get("/verify/:token", userController.verifyEmail);

router.post("/send-otp", userController.sendOtp);
router.post("/verify-otp", userController.verifyOtp);

// ✅ ✅ ✅ FIXED LOCATION ROUTE
router.put("/location/:id", userController.updateLocation);

router.put("/twofactor/:id", userController.toggleTwoFactor);

router.get("/:id", userController.getUserById);

router.post("/verify-email", userController.verifyEmailByEmail);
/* =========================
   AVATAR UPLOAD
========================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/avatars"));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${req.params.id}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });

router.put(
  "/avatar/:id",
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      const user = await UserModel.findByIdAndUpdate(
        req.params.id,
        { avatar: avatarUrl },
        { new: true }
      );

      res.json({ avatar: avatarUrl, user });
    } catch (err) {
      console.error("AVATAR UPLOAD ERROR:", err);
      res.status(500).json({ message: "Avatar upload failed" });
    }
  }
);

module.exports = router;