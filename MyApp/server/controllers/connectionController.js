const UserModel = require("../models/User");
const ConnectionModel = require("../models/Connection");

/* =========================
   SAFETY STATUS
========================= */

const markSafe = (req, res) => {
  const userId = req.params.id;
  const { message = "" } = req.body || {};

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
      if (!user) return res.status(404).json({ message: "User not found" });

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

/* =========================
   CONNECTION CREATION
========================= */

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
    const userId = req.params.id;
    let code;
    let exists = true;

    while (exists) {
      code = generateConnectionCode();
      const check = await ConnectionModel.findOne({ code });
      if (!check) exists = false;
    }

    const connection = await ConnectionModel.create({
      code,
      creator: userId,
      members: [userId],
      pendingMembers: []
    });

    await UserModel.findByIdAndUpdate(userId, {
      $push: { connections: connection._id }
    });

    res.json({ message: "Connection created", code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   JOIN CONNECTION
========================= */

const joinConnection = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.params.id;

    const connection = await ConnectionModel.findOne({ code });
    if (!connection) {
      return res.status(404).json({ message: "Invalid code" });
    }

    // ✅ MAX 5 MEMBERS ENFORCEMENT
    if (connection.members.length >= 5) {
      return res.status(400).json({
        message: "This connection already has the maximum of 5 members"
      });
    }

    if (
      connection.members.includes(userId) ||
      connection.pendingMembers.includes(userId)
    ) {
      return res.json({ message: "Already joined or pending approval" });
    }

    connection.pendingMembers.push(userId);
    await connection.save();

    res.json({ message: "Request sent. Waiting for creator approval" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET CONNECTION MEMBERS
========================= */

const getConnectionMembers = async (req, res) => {
  try {
    const connectionId = req.params.id;

    const connection = await ConnectionModel.findById(connectionId)
      .populate("members", "username avatar location safetyStatus safetyMessage");

    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    res.json(connection.members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   ✅ FIXED: GET USER CONNECTIONS
========================= */

const getUserConnections = async (req, res) => {
  try {
    const userId = req.params.id;

    const connections = await ConnectionModel.find({
      $or: [{ members: userId }, { creator: userId }]
    })
      .populate(
        "members",
        "username avatar location safetyStatus safetyMessage"
      )
      .populate(
        "pendingMembers",
        "username avatar"
      );

    res.json(connections);
  } catch (err) {
    console.error("Get user connections error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   LEAVE CONNECTION
========================= */
const leaveConnection = async (req, res) => {
  try {
    const userId = req.params.userId;
    const connectionId = req.params.connectionId;

    const connection = await ConnectionModel.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    // ✅ Creator cannot leave their own connection
    if (connection.creator.toString() === userId) {
      return res.status(400).json({
        message: "Creator cannot leave their own connection"
      });
    }

    // ✅ Remove user from members
    connection.members = connection.members.filter(
      id => id.toString() !== userId
    );

    // ✅ ALSO remove user from pendingMembers (CRITICAL FIX)
    connection.pendingMembers = connection.pendingMembers.filter(
      id => id.toString() !== userId
    );

    await connection.save();

    // ✅ Remove connection from user's list
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { connections: connectionId }
    });

    res.json({ message: "You have left the connection" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
/* =========================
   APPROVE / REJECT MEMBERS
========================= */

const approveMember = async (req, res) => {
  try {
    const { connectionId, memberId, userId } = req.params;

    const connection = await ConnectionModel.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    if (connection.creator.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ MAX 5 MEMBERS ENFORCEMENT
    if (connection.members.length >= 5) {
      return res.status(400).json({
        message: "Connection already has 5 members"
      });
    }

    connection.pendingMembers = connection.pendingMembers.filter(
      id => id.toString() !== memberId
    );

    connection.members.addToSet(memberId);
    await connection.save();

    await UserModel.findByIdAndUpdate(memberId, {
      $addToSet: { connections: connection._id }
    });

    res.json({ message: "Member approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
const kickMember = async (req, res) => {
  try {
    const { connectionId, memberId, userId } = req.params;

    const connection = await ConnectionModel.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    if (connection.creator.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (connection.creator.toString() === memberId) {
      return res.status(400).json({ message: "Creator cannot be kicked" });
    }

    connection.members = connection.members.filter(
      id => id.toString() !== memberId
    );

    connection.pendingMembers = connection.pendingMembers.filter(
      id => id.toString() !== memberId
    );

    await connection.save();

    await UserModel.findByIdAndUpdate(memberId, {
      $pull: { connections: connection._id }
    });

    // ✅ Send notification FIRST
    await UserModel.findByIdAndUpdate(memberId, {
      $push: {
        notifications: {
          type: "KICKED",
          message: "You were removed from a family connection.",
          connectionId: connection._id,
          createdAt: new Date(),
          read: false,
        },
      },
    });

    res.json({ message: "Member has been removed from the connection" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const rejectMember = async (req, res) => {
  try {
    const { connectionId, memberId, userId } = req.params;

    const connection = await ConnectionModel.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    if (connection.creator.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    connection.pendingMembers = connection.pendingMembers.filter(
      id => id.toString() !== memberId
    );

    await connection.save();
    res.json({ message: "Member rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET CONNECTION BY ID
========================= */

const getConnectionById = async (req, res) => {
  try {
    const { connectionId } = req.params;

    const connection = await ConnectionModel.findById(connectionId)
      .populate("pendingMembers", "username avatar")

    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    res.json(connection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   EXPORTS
========================= */

module.exports = {
  createConnection,
  joinConnection,
  getConnectionMembers,
  getUserConnections,
  getConnectionById,
  leaveConnection,
  markSafe,
  markNotSafe,
  approveMember,
  kickMember,
  rejectMember
};