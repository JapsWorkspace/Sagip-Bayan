const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");


router.get("/users", userController.getUsers);
router.post("/register", userController.registerUser);
router.put("/update/:id", userController.updateUser);
router.post("/login", userController.loginUser);


router.put("/archive/:id", userController.archiveUser);   
router.put("/restore/:id", userController.restoreUser);  

router.get("/verify/:token", userController.verifyEmail);

router.post("/send-otp", userController.sendOtp);
router.post("/verify-otp", userController.verifyOtp);

router.put("/twofactor/:id", userController.toggleTwoFactor);
module.exports = router;
