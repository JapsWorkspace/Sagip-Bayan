const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  active: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['requested', 'approved', 'received'],
    default: null
  },
  peopleRange: String,
  requestedAt: Date
});

const barangaySchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  barangayName: { type: String, required: true },
  verified: { type: Boolean, default: true },
  phoneNumber: { type: String, required: true },
  hotline: String,
  address: { type: String, required: true },
  archived: { type: Boolean, default: false },
  archivedAt: { type: Date },

  reliefReq: {
    food: { type: categorySchema, default: () => ({}) },
    hygiene: { type: categorySchema, default: () => ({}) },
    clothing: { type: categorySchema, default: () => ({}) },
    furniture: { type: categorySchema, default: () => ({}) },
    medicine: { type: categorySchema, default: () => ({}) },
  },

  history: [
    {
      category: String,
      peopleRange: String,
      status: String,
      actionBy: String,
      actionByName: String,
      actionAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Barangay', barangaySchema);
