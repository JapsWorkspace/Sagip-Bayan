const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  username: {
    type: String,
    required: false // comes from userContext (logged-in user)
  },
  amount: {
    type: Number,
    required: true
  },
  referenceNumber: {
    type: String,
    required: true
  },
  proof: {
    type: String, // file path
    required: true
  },
  status: {
    type: String,
    default: "pending" // pending | verified | rejected
  }
}, { timestamps: true });

module.exports = mongoose.model("Donation", donationSchema);