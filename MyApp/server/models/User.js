const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  fname: String,
  lname: String,
  username: { type: String, unique: true },
  password: String,
  email: { type: String, unique: true },
  dateOfBirth: Date,
  phone: String,
  address: String,

    connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Connection"
  }],

  safetyStatus: {
    type: String,
    enum: ["SAFE", "NOT_SAFE", "UNKNOWN"],
    default: "UNKNOWN"
  },

  safetyMessage: {
    type: String,
    default: ""
  },

  safetyUpdatedAt: {
    type: Date,
    default: null
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  verificationToken: String,
  verificationTokenExpires: Date,
  otp: String,
  otpExpires: Date,

  isArchived: {
    type: Boolean,
    default: false,
  },

  archivedAt: {
    type: Date,
    default: null,
  },

  deleteAfter: {
    type: Date,
    default: null,
  },
  twoFactorEnabled: { type: Boolean, default: false },
}, { timestamps: true });

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
