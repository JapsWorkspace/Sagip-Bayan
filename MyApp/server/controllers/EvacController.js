const Place = require("../models/EvacPlace.js");
const EHistory = require("../models/EvacHistory.js");

// Sanitize input
const sanitizeText = (value) => {
  return value.replace(/<[^>]*>?/gm, "").trim();
};

// CREATE PLACE
const createPlace = async (req, res) => {
  try {
    const {
      name,
      location,
      barangay,
      latitude,
      longitude,

      capacityIndividual,
      capacityFamily,
      bedCapacity,
      floorArea,

      femaleCR,
      maleCR,
      commonCR,

      potableWater,
      nonPotableWater,

      foodPackCapacity,
      isPermanent,
      isCovidFacility,
    } = req.body;

    // Required validation
    if (
      !name ||
      !location ||
      !barangay ||
      latitude === undefined ||
      longitude === undefined ||
      capacityIndividual === undefined ||
      capacityFamily === undefined
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Convert numeric values
    const latNum = Number(latitude);
    const lngNum = Number(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return res.status(400).json({
        message: "Invalid coordinates",
      });
    }

    const newPlace = new Place({
      name: sanitizeText(name),
      location: sanitizeText(location),
      barangay: sanitizeText(barangay),

      latitude: latNum,
      longitude: lngNum,

      capacityIndividual: Number(capacityIndividual),
      capacityFamily: Number(capacityFamily),
      bedCapacity: Number(bedCapacity) || 0,
      floorArea: Number(floorArea) || 0,

      femaleCR: Boolean(femaleCR),
      maleCR: Boolean(maleCR),
      commonCR: Boolean(commonCR),

      potableWater: Boolean(potableWater),
      nonPotableWater: Boolean(nonPotableWater),

      foodPackCapacity: Number(foodPackCapacity) || 0,

      isPermanent: Boolean(isPermanent),
      isCovidFacility: Boolean(isCovidFacility),

      capacityStatus: "available",
    });

    await newPlace.save();

    await EHistory.create({
      action: "ADD",
      placeName: newPlace.name,
      details: `Added with individual capacity ${newPlace.capacityIndividual}`,
    });

    res.status(201).json({
      message: "Place created successfully",
      place: newPlace,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL PLACES
const getPlaces = async (req, res) => {
  try {
    const places = await Place.find().sort({ createdAt: -1 });
    res.json(places);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET HISTORY
const getHistory = async (req, res) => {
  try {
    const logs = await EHistory.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load history" });
  }
};

// UPDATE CAPACITY STATUS
const updateCapacityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { capacityStatus } = req.body;

    const updated = await Place.findByIdAndUpdate(
      id,
      { capacityStatus },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Place not found" });
    }

    await EHistory.create({
      action: "STATUS_UPDATE",
      placeName: updated.name,
      details: `Status changed to ${capacityStatus}`,
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

// DELETE PLACE
const deletePlace = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Place.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Place not found" });
    }

    await EHistory.create({
      action: "DELETE",
      placeName: deleted.name,
      details: "Place deleted",
    });

    res.json({ message: "Place deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};

// ANALYTICS SUMMARY
const getAnalyticsSummary = async (req, res) => {
  try {
    const places = await Place.find();

    const totalPlaces = places.length;

    const statusCounts = places.reduce(
      (acc, p) => {
        const status = p.capacityStatus || "available";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { available: 0, limited: 0, full: 0 }
    );

    const totalIndividualCapacity = places.reduce(
      (sum, p) => sum + (p.capacityIndividual || 0),
      0
    );

    const totalFamilyCapacity = places.reduce(
      (sum, p) => sum + (p.capacityFamily || 0),
      0
    );

    const totalBedCapacity = places.reduce(
      (sum, p) => sum + (p.bedCapacity || 0),
      0
    );

    const permanentCount = places.filter(p => p.isPermanent).length;
    const covidFacilities = places.filter(p => p.isCovidFacility).length;

    res.json({
      totalPlaces,
      statusCounts,
      totalIndividualCapacity,
      totalFamilyCapacity,
      totalBedCapacity,
      permanentCount,
      covidFacilities,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

module.exports = {
  createPlace,
  getPlaces,
  getHistory,
  updateCapacityStatus,
  deletePlace,
  getAnalyticsSummary,
};