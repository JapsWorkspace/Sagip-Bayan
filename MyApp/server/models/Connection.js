const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true
  },
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  pendingMembers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }]
}, { timestamps: true });

const ConnectionModel = mongoose.model("Connection", connectionSchema);
<<<<<<< HEAD
module.exports = ConnectionModel;
=======
module.exports = ConnectionModel;
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
