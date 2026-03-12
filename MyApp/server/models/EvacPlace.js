const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  capacity: { type: Number, required: true },
  capacityStatus: { 
    type: String, enum: ["available","limited","full"], 
    default: "available" }
  },
  { timestamps: true }
);

const EvacPlaceModel = mongoose.model('EvacPlace', placeSchema);
module.exports = EvacPlaceModel;


