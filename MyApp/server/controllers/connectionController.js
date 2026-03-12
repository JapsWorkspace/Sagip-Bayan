const UserModel = require("../models/User");
const ConnectionModel = require("../models/Connection");

const markSafe = (req, res) => {
  const userId = req.params.id;
  const { message = "" } = req.body || {}; // default empty string

  UserModel.findByIdAndUpdate(
    userId,
    {
      safetyStatus: "SAFE",
      safetyMessage: message,
      safetyUpdatedAt: new Date()
    },
    { new: true }
  )
    .then(user => {
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({
        message: "Safety status updated",
        safetyStatus: user.safetyStatus,
        safetyMessage: user.safetyMessage
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
};

const markNotSafe = (req, res) => {
  const userId = req.params.id;
  const { message } = req.body;

  UserModel.findByIdAndUpdate(
    userId,
    {
      safetyStatus: "NOT_SAFE",
      safetyMessage: message,
      safetyUpdatedAt: new Date()
    },
    { new: true }
  )
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        message: "Safety status updated",
        safetyStatus: user.safetyStatus
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
};

function generateConnectionCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

const createConnection = async (req, res) => {
  try {
    const userId = req.params.id; // creator
    let code;
    let exists = true;

    // ensure code is unique
    while (exists) {
      code = generateConnectionCode();
      const check = await ConnectionModel.findOne({ code });
      if (!check) exists = false;
    }

    // create connection group WITH creator
    const connection = await ConnectionModel.create({
      code,
      creator: userId,      // ✅ set creator
      members: [userId],    // initial member is creator
      pendingMembers: []    // start empty
    });

    // add connection to user's connections array
    await UserModel.findByIdAndUpdate(userId, {
      $push: { connections: connection._id }
    });

    res.json({
      message: "Connection created",
      code
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const joinConnection = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.params.id;

    const connection = await ConnectionModel.findOne({ code });
    if (!connection) return res.status(404).json({ message: "Invalid code" });

    // Check if already a member
    if (connection.members.includes(userId) || connection.pendingMembers.includes(userId)) {
      return res.json({ message: "Already joined or pending approval" });
    }

    // Add to pendingMembers
    connection.pendingMembers.push(userId);
    await connection.save();

    res.json({ message: "Request sent. Waiting for creator approval", code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getConnectionMembers = async (req, res) => {
  try {
    const connectionId = req.params.id;
    const connection = await ConnectionModel.findById(connectionId)
      .populate("members", "username safetyStatus safetyMessage");

    if (!connection) return res.status(404).json({ message: "Connection not found" });

    res.json(connection.members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserConnections = async (req, res) => {
  try {
    const userId = req.params.id;

    // 1️⃣ Get the user
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ Get the connections
    const connections = await ConnectionModel.find({
      _id: { $in: user.connections }
    });

    // 3️⃣ For each connection get members
    const result = [];

    for (const connection of connections) {

      const members = await UserModel.find({
        _id: { $in: connection.members }
      }).select("username safetyStatus safetyMessage");

      result.push({
        _id: connection._id,
        code: connection.code,
        members: members
      });
    }

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const leaveConnection = async (req, res) => {
try {
const userId = req.params.userId;
const connectionId = req.params.connectionId;
// 1️⃣ Remove user from connection members
const connection = await ConnectionModel.findByIdAndUpdate(
  connectionId,
  { $pull: { members: userId } },
  { new: true }
);

if (!connection) {
  return res.status(404).json({ message: "Connection not found" });
}

// 2️⃣ Remove connection from user's connections
await UserModel.findByIdAndUpdate(
  userId,
  { $pull: { connections: connectionId } }
);

// 3️⃣ If no members remain, delete the connection
if (connection.members.length === 0) {
  await ConnectionModel.findByIdAndDelete(connectionId);
  return res.json({
    message: "You left the connection. Connection deleted because no members remain."
  });
}

res.json({ message: "Successfully left the connection" });

} catch (err) {
console.error(err);
res.status(500).json({ message: "Server error" });
}
};


const approveMember = async (req, res) => {
  try {
    const { connectionId, memberId } = req.params;
    const connection = await ConnectionModel.findById(connectionId);

    if (!connection) return res.status(404).json({ message: "Connection not found" });

    // Only creator can approve
    if (connection.creator.toString() !== req.body.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Move member from pendingMembers to members
    connection.pendingMembers = connection.pendingMembers.filter(id => id.toString() !== memberId);
    if (!connection.members.includes(memberId)) {
      connection.members.push(memberId);
    }

    await connection.save();

    // Update user's connections array
    await UserModel.findByIdAndUpdate(memberId, { $addToSet: { connections: connection._id } });

    res.json({ message: "Member approved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const rejectMember = async (req, res) => {
  try {
    const { connectionId, memberId } = req.params;
    const connection = await ConnectionModel.findById(connectionId);

    if (!connection) return res.status(404).json({ message: "Connection not found" });

    // Only creator can reject
    if (connection.creator.toString() !== req.body.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Remove from pendingMembers
    connection.pendingMembers = connection.pendingMembers.filter(id => id.toString() !== memberId);

    await connection.save();

    res.json({ message: "Member rejected" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getConnectionById = async (req, res) => {
  try {
    const { connectionId } = req.params;

    const connection = await ConnectionModel.findById(connectionId)
      .populate("pendingMembers", "username safetyStatus");

    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    // DEBUG: show all pending members
    console.log("Pending Members for connection:", connection.code);
    if (connection.pendingMembers.length === 0) {
      console.log("No pending members.");
    } else {
      connection.pendingMembers.forEach(member => {
        console.log(`Member ID: ${member._id}, Username: ${member.username}, Status: ${member.safetyStatus}`);
      });
    }

    res.json(connection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createConnection, joinConnection, getConnectionMembers, getUserConnections, leaveConnection, markSafe, markNotSafe, approveMember, rejectMember, getConnectionById };