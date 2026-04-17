const IncidentModel = require("../models/Incident");
const HistoryModel = require("../models/History");
const cloudinary = require("../config/cloudinary");

const exif = require("exif-parser");
const { verifyIncidentImage } = require("../utils/verifyIncidentImage");

// ✅ Get all incidents
const getIncidents = async (req, res) => {
  try {
    const incidents = await IncidentModel.find().sort({ createdAt: -1 });
    res.json(incidents);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
    
  }
};
const generateReasoning = (v) => {
  if (!v) return "No verification data";

  if (!v.isMatch) {
    return "Rejected: Image does not match the reported incident type.";
  }

  if (!v.metadata?.gps && !v.metadata?.timestamp) {
    return "Weak evidence: Missing GPS and timestamp metadata.";
  }

  if (!v.metadataFlags?.isWithinArea) {
    return "Outside monitored area (Jaen).";
  }

  if (!v.metadataFlags?.isRecent) {
    return "Image is not recent (older than 24 hours).";
  }

  if (v.status === "approved") {
    return `Approved: High confidence (${v.confidence}%) with labels: ${v.matchedLabels.join(", ")}`;
  }

  return `Pending: Partial match (${v.confidence}%) — needs manual review.`;
};




// ✅ Register Incident (WITH IMAGE SUPPORT)
const registerIncident = async (req, res) => {
  const buffer = Buffer.isBuffer(req.file.buffer)
      ? req.file.buffer
      : Buffer.from(req.file.buffer);

  if (req.file) {
    try {
      
      const parser = exif.create(buffer);
      const result = parser.parse();

    } catch (err) {
      console.log("⚠️ Metadata extraction failed:", err.message);
    }
  }
  try {
    if (!req.body) req.body = {};

    let imageData = null;
    let verification = null;

    

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "evacuation_app/incidents" },
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        ).end(req.file.buffer);
      });

      imageData = {
        fileName: req.file.originalname,
        fileUrl: result.secure_url,
        public_id: result.public_id, // 🔥 important for delete later
      };

      if (imageData?.fileUrl) {
          verification = await verifyIncidentImage(
          buffer,   // 🔥 ORIGINAL IMAGE BUFFER
          req.body.type
        );
      }
    }

    const newIncident = new IncidentModel({
      type: req.body.type || "",
      level: req.body.level || "",
      location: req.body.location || "",
      description: req.body.description || "",
      latitude: req.body.latitude ? Number(req.body.latitude) : null,
      longitude: req.body.longitude ? Number(req.body.longitude) : null,
      image: imageData,
      usernames: req.body.usernames || null,
      phone: req.body.phone || null,
      status: "reported", // ✅ default status
      verification: verification
      ? {
          status: verification.status,
          confidence: verification.confidence,
          labels: verification.labels,
          matchedLabels: verification.matchedLabels,
          isMatch: verification.isMatch,

          score: verification.confidence,

          reasoning: generateReasoning(verification),

          metadata: {
            hasGPS: verification.metadataFlags?.hasLocation || false,
            isRecent: verification.metadataFlags?.isRecent || false,
            isWithinArea: verification.metadataFlags?.isWithinArea || false,

            device: verification.metadata?.device || null,
            width: verification.metadata?.width || null,
            height: verification.metadata?.height || null,
            timestamp: verification.metadata?.timestamp || null,
          }
        }
      : undefined,
    });

    const incident = await newIncident.save();

    console.log("Incident registered:", incident);

    // Save to history
    await HistoryModel.create({
      action: "ADD",
      placeName: incident.location,
      details: incident.description,
    });

    return res.status(201).json({
      message: "Incident created successfully",
      incident,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Update status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updatedIncident = await IncidentModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedIncident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    // Save to history
    await HistoryModel.create({
      action: "STATUS_UPDATE",
      placeName: updatedIncident.location,
      details: `Updated to ${status}`,
    });

    res.json(updatedIncident);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
};

// ✅ Delete incident
const deleteIncident = async (req, res) => {
  try {
    const deleted = await IncidentModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Incident not found" });
    }

    // Save to history
    await HistoryModel.create({
      action: "DELETE",
      placeName: deleted.location,
      details: deleted.description,
    });

    res.json({ message: "Incident deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete incident" });
  }
};

// ✅ Analytics (STATUS COUNTS)
const getIncidentStats = async (req, res) => {
  try {
    const stats = await IncidentModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    let result = {
      reported: 0,
      onProcess: 0,
      resolved: 0,
      total: 0
    };

    stats.forEach(item => {
      if (item._id === "reported" || item._id === "" || item._id === null) {
        result.reported += item.count;
      } else if (item._id === "onProcess") {
        result.onProcess = item.count;
      } else if (item._id === "resolved") {
        result.resolved = item.count;
      }
    });

    // Calculate total after summing all statuses
    result.total = result.reported + result.onProcess + result.resolved;

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};
// Get count of incidents per type
const getIncidentTypeStats = async (req, res) => {
  try {
    const stats = await IncidentModel.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);

    // Format as key-value object
    const result = {};
    stats.forEach(item => {
      result[item._id || "Unknown"] = item.count;
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch type stats" });
  }
};

const getTrend = async (req, res) => {
  try {
    const data = await IncidentModel.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d", //"%Y-%m-%d"
              date: "$createdAt",
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateVerification = async (req, res) => {
  try {
    const { status } = req.body;

    const incident = await IncidentModel.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }
    if (!["approved", "pending", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // ✅ Update verification status only
    incident.verification = incident.verification || {
       status: verification.status,
      confidence: verification.confidence,
      labels: verification.labels,
      matchedLabels: verification.matchedLabels,
      isMatch: verification.isMatch,

      score: verification.confidence,

      reasoning: generateReasoning(verification),

      metadata: {
        hasGPS: verification.metadataFlags?.hasLocation || false,
        isRecent: verification.metadataFlags?.isRecent || false,
        isWithinArea: verification.metadataFlags?.isWithinArea || false,

        device: verification.metadata?.device || null,
        width: verification.metadata?.width || null,
        height: verification.metadata?.height || null,
        timestamp: verification.metadata?.timestamp || null
      }
    };

    incident.verification.status = status;

    await incident.save();

    // ✅ Save history (important for admin logs)
    await HistoryModel.create({
      action: "VERIFICATION_UPDATE",
      placeName: incident.location,
      details: `Verification set to ${status}`,
    });

    res.json({
      message: "Verification updated",
      incident,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update verification" });
  }
};

const reverifyIncident = async (req, res) => {
  try {
    const incident = await IncidentModel.findById(req.params.id);

    if (!incident || !incident.image?.fileUrl) {
      return res.status(404).json({ message: "Incident or image not found" });
    }

    // 🔥 Re-run AI
    const axios = require("axios");

    const response = await axios.get(incident.image.fileUrl, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(response.data);

    const verification = await verifyIncidentImage(
      buffer,
      incident.type
    );
    console.log("=== AI VERIFICATION RESULT ===");
    console.log("Status:", verification?.status);
    console.log("Confidence:", verification?.confidence);
    console.log("Labels:", verification?.labels);
    console.log("Matched Labels:", verification?.matchedLabels);
    console.log("Is Match:", verification?.isMatch);

    console.log("---- METADATA ----");
    console.log("Raw Metadata:", verification?.metadata);
    console.log("Metadata Flags:", verification?.metadataFlags);

    console.log("GPS:", verification?.metadata?.gps);
    console.log("Device:", verification?.metadata?.device);
    console.log("Dimensions:", verification?.metadata?.width, "x", verification?.metadata?.height);

    console.log("==============================");

    incident.verification = {
      status: verification?.status || "pending",
      confidence: verification?.confidence || 0,
      labels: verification?.labels || [],
      valid: verification?.valid || false
    };

    await incident.save();

    try {
      await HistoryModel.create({
        action: "VERIFICATION_UPDATE",
        placeName: incident.location || "unknown",
        details: `Verification set to ${verification.status}`,
      });
    } catch (e) {
      console.error("History save failed:", e.message);
    }

    res.json({
      message: "Reverification complete",
      incident,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reverify incident" });
  }
};



module.exports = {
  getIncidents,
  registerIncident,
  updateStatus,
  deleteIncident,
  getIncidentStats,
  getIncidentTypeStats,
  getTrend,
  updateVerification,
  reverifyIncident, 
};
