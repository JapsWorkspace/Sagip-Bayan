const UserModel = require("../models/User");
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const sendOTP = require("../utils/sendOTP");
const bcrypt = require("bcryptjs");


const registerUser = async (req, res) => {
  try {
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new UserModel({
      ...req.body,
      password: hashedPassword, // 👈 replace plain password
      isVerified: false,
      verificationToken: verificationToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000
    });

    const user = await newUser.save();

    const verificationLink =
      `http://localhost:8000/user/verify/${verificationToken}`;

    await sendVerificationEmail(user.email, verificationLink);

    res.status(201).json({
      message: "Registration successful. Please verify your email."
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
};


const verifyEmail = (req, res) => {
  const { token } = req.params;

  UserModel.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() }
  })
    .then(user => {
      if (!user) {
        return res.status(400).send("Invalid or expired verification link");
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;

      return user.save();
    })
    .then(() => {
      res.send("Email verified successfully. You can now log in.");
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Verification error");
    });
};

const getUsers = (req, res) => {
     UserModel.find() 
     .then(users => res.json(users)) 
     .catch(err =>{ 
        console.log(err) 
        res.status(500).json({error: "Internal Server Error"}); 
    });
 };
const loginUser = async (req, res) => {
   console.log("BODY:", req.body);

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // 🔐 bcrypt password comparison
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Restore archived account
    if (user.isArchived) {
      user.isArchived = false;
      user.archivedAt = null;
      user.deleteAfter = null;
    }

    // Two-factor flow
    if (user.twoFactorEnabled) {
      await user.save();
      return res.json({
        twoFactor: true,
        userId: user._id,
        email: user.email,
        restored: true
      });
    }

    await user.save();

    res.json({
      twoFactor: false,
      user,
      restored: true
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


 const updateUser = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // If password is being updated, hash it first
    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      updateData.password = hashedPassword;
    }

    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Never send password back to frontend
    const { password, ...safeUser } = user.toObject();

    res.json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  UserModel.findOne({ email })
    .then(user => {
      if (!user) {
        // Stop chain and send proper error
        return Promise.reject({ status: 404, message: "Email not found" });
      }

      const otp = generateOTP();

      // Save OTP in user model
      user.otp = otp;
      user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

      // Save user and then send OTP email
      return user.save().then(() => sendOTP(email, otp));
    })
    .then(() => {
      res.json({ message: "OTP sent successfully" });
    })
    .catch(err => {
      console.error(err);
      // If we rejected with our own error object
      res.status(err.status || 500).json({
        message: err.message || "Server error"
      });
    });
};

const verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP are required" });

  UserModel.findOne({ email })
    .then(user => {
      if (!user) throw { status: 404, message: "User not found" };
      if (user.otp !== otp) throw { status: 400, message: "Invalid OTP" + user };
      if (user.otpExpires < Date.now()) throw { status: 400, message: "OTP expired" };

      // Clear OTP
      user.otp = null;
      user.otpExpires = null;

      return user.save();
    })
    .then(() => {
      res.json({ message: "OTP verified" });
    })
    .catch(error => {
      console.error(error);
      // If we threw our own object with status/message
      if (error.status && error.message) {
        return res.status(error.status).json({ message: error.message });
      }
      res.status(500).json({ message: "Server error" });
    });
};

const archiveUser = (req, res) => {
  const userId = req.params.id;

  const deleteAfter = new Date();
  deleteAfter.setMonth(deleteAfter.getMonth() + 6);

  UserModel.findByIdAndUpdate(
    userId,
    {
      isArchived: true,
      archivedAt: new Date(),
      deleteAfter: deleteAfter,
    },
    { new: true }
  )
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        message:
          "Your account has been archived. You can still log in. It will be permanently deleted after 6 months.",
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
};
//pang admin siguro idk
const restoreUser = (req, res) => {
  const userId = req.params.id;

  UserModel.findByIdAndUpdate(
    userId,
    {
      isArchived: false,
      archivedAt: null,
      deleteAfter: null,
    },
    { new: true }
  )
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "Account restored successfully" });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
};

const permanentlyDeleteArchivedUsers = () => {
  ArchivedUserModel.deleteMany({
    isArchived: true,
    deleteAfter: { $lte: new Date() },
  })
    .then(result => {
      console.log(`Permanently deleted ${result.deletedCount} archived users`);
    })
    .catch(err => {
      console.error("Permanent delete error:", err);
    });
};

const toggleTwoFactor = (req, res) => {
  const { id } = req.params;
  const { enabled } = req.body; // expected true/false

  if (typeof enabled !== "boolean") {
    return res.status(400).json({ message: "enabled must be true or false" });
  }

  UserModel.findByIdAndUpdate(
    id,
    { twoFactorEnabled: enabled },
    { new: true }
  )
    .then(user => {
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({
        message: `Two-Factor Authentication ${enabled ? "enabled" : "disabled"}`,
        twoFactorEnabled: user.twoFactorEnabled
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
};








module.exports = { registerUser, verifyEmail, getUsers, updateUser, sendOtp, verifyOtp, archiveUser, restoreUser, permanentlyDeleteArchivedUsers, toggleTwoFactor, loginUser };