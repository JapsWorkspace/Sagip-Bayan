const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem'
  },

  itemName: String,

  action: String, // ADD, RELEASE, EDIT

  quantity: Number,

  performedBy: String,

  date: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);