const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true }, // e.g. "Elementary School"
    barangay: { type: String, required: true },

    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },

    // Capacity (expanded)
    capacityIndividual: { type: Number, required: true },
    capacityFamily: { type: Number, required: true },
    bedCapacity: { type: Number, default: 0 },

    // Infrastructure
    floorArea: { type: Number }, // in sq.m.

    // Facilities
    femaleCR: { type: Boolean, default: false },
    maleCR: { type: Boolean, default: false },
    commonCR: { type: Boolean, default: false },

    potableWater: { type: Boolean, default: false },
    nonPotableWater: { type: Boolean, default: false },

    foodPackCapacity: { type: Number, default: 0 },

    // Flags
    isPermanent: { type: Boolean, default: false },
    isCovidFacility: { type: Boolean, default: false },

    // Status
    capacityStatus: {
      type: String,
      enum: ["available", "limited", "full"],
      default: "available",
    },
  },
  { timestamps: true }
);

// Palitan  ng yung model ng ganito. tapos update  yung evacuation controller
// Barangay {
//   name: String,
//   district: String,
//   evacuationAreas: [
//     {
//       name: String,y
//       latitude: Number,
//       longitude: Number,
//       capacityIndividual: Number,
//       capacityFamily: Number,
//       bedCapacity: Number,
//       facilities: { ... },
//       capacityStatus: "available" | "limited" | "full"
//     }
//   ]
// }





module.exports = mongoose.model("EvacPlace", placeSchema);