const mongoose = require('mongoose');

const barangaySchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, trim: true, lowercase: true },
    password: { type: String, required: true },

    barangayName: { type: String, required: true, trim: true },

    verified: { type: Boolean, default: true },

    phoneNumber: { type: String, required: true, trim: true },
    hotline: { type: String, default: '', trim: true },
    address: { type: String, required: true, trim: true },

    archived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Barangay', barangaySchema);