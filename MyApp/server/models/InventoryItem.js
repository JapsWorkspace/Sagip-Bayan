const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  type: { type: String, enum: ['goods', 'monetary'], default: 'goods' },
  name: String,
  category: String,
  quantity: {
    type: Number,
    default: 0
  },
  unit: String,
  description: String,
  proofFiles: [String],
  addedBy: String,
  isArchive: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);