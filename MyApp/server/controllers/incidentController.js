const IncidentModel = require("../models/Incident");
const history = require("../models/History");

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

// ✅ Register Incident (WITH IMAGE SUPPORT)
const registerIncident = async (req, res) => {
  try {
    // Ensure req.body exists
    if (!req.body) req.body = {};

    let imageData = null;

    // If an image was uploaded
    if (req.file) {
      imageData = {
        fileName: req.file.originalname,
        fileUrl: `http://localhost:8000/uploads/incidents/${req.file.filename}`,
      };
    }

    const newIncident = new IncidentModel({
      type: req.body.type || "", // fallback to empty string
      level: req.body.level || "",
      location: req.body.location || "",
      description: req.body.description || "",
      latitude: req.body.latitude ? Number(req.body.latitude) : null,
      longitude: req.body.longitude ? Number(req.body.longitude) : null,
      image: imageData, // 👈 stores the single image
      usernames: req.body.usernames || null,
      phone: req.body.phone || null
    });

    const incident = await newIncident.save();

    console.log("Incident registered:", incident);

    // Save to history
    await history.create({
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

    res.json({ message: "Incident deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete incident" });
  }
};

module.exports = {
  getIncidents,
  registerIncident,
  updateStatus,
  deleteIncident,
};