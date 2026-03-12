const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    
    action: {
      type: String,
      enum: ["ADD", "STATUS_UPDATE", "DELETE"],
      required: true
    },
    placeName: {
      type: String,
      required: true
    },
    details: {
      type: String
    }

  },
  { timestamps: true }
);


const EvacHistoryModel = mongoose.model('EHistory', notificationSchema);
module.exports = EvacHistoryModel;
