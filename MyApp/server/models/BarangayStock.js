<<<<<<< HEAD
const mongoose = require("mongoose");

const barangayStockSchema = new mongoose.Schema(
  {
    barangayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barangay",
      required: true,
    },

    barangayName: {
      type: String,
      required: true,
      trim: true,
    },

    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    unit: {
      type: String,
      default: "",
      trim: true,
    },

    quantityAvailable: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastUpdatedBy: {
      type: String,
      default: "",
      trim: true,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate stock entries per barangay + item
barangayStockSchema.index(
  { barangayId: 1, itemName: 1, category: 1 },
  {
    unique: true,
    partialFilterExpression: { isArchived: false },
  }
);

=======
const mongoose = require("mongoose");

const barangayStockSchema = new mongoose.Schema(
  {
    barangayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barangay",
      required: true,
    },

    barangayName: {
      type: String,
      required: true,
      trim: true,
    },

    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    unit: {
      type: String,
      default: "",
      trim: true,
    },

    quantityAvailable: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastUpdatedBy: {
      type: String,
      default: "",
      trim: true,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate stock entries per barangay + item
barangayStockSchema.index(
  { barangayId: 1, itemName: 1, category: 1 },
  {
    unique: true,
    partialFilterExpression: { isArchived: false },
  }
);

>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
module.exports = mongoose.model("BarangayStock", barangayStockSchema);