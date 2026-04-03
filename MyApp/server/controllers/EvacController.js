const Place = require("../models/EvacPlace.js");
const EHistory = require("../models/EvacHistory.js");
const BarangayStock = require("../models/BarangayStock");
const BarangayStockTransaction = require("../models/BarangayStockTransaction");

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

const allocateStockToPlace = async (req, res) => {
  try {
    const { id } = req.params; // evacPlaceId
    const { stockId, quantity } = req.body;

    const username = req.session?.username || "unknown";

    // 1. Validate
    if (!stockId || !quantity) {
      return res.status(400).json({
        message: "Stock ID and quantity are required",
      });
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    // 2. Find evac place
    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({ message: "Evac place not found" });
    }

    // 3. Find stock
    const stock = await BarangayStock.findById(stockId);
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    // 4. SECURITY CHECK (VERY IMPORTANT)
    if (String(stock.barangayId) !== String(place.barangayId)) {
      return res.status(403).json({
        message: "Stock and evac place do not belong to the same barangay",
      });
    }

    // 5. Check quantity
    if (stock.quantityAvailable < qty) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${stock.quantityAvailable}`,
      });
    }

    // 6. Deduct stock
    stock.quantityAvailable -= qty;
    stock.lastUpdatedBy = username;

    await stock.save();

    // 7. Create transaction
    await BarangayStockTransaction.create({
      barangayId: stock.barangayId,
      barangayName: stock.barangayName,

      stockId: stock._id,

      itemName: stock.itemName,
      category: stock.category,
      unit: stock.unit,

      quantity: qty,
      transactionType: "allocation",

      evacPlaceId: place._id,
      evacPlaceName: place.name,

      remarks: `Allocated to evac place: ${place.name}`,
      performedBy: username,
    });

    res.json({
      message: "Stock allocated to evacuation place successfully",
    });
  } catch (err) {
    console.error("Allocate Stock Error:", err);
    res.status(500).json({ message: "Allocation failed" });
  }
};

module.exports = {
  createPlace,
  getPlaces,
  getHistory,
  updateCapacityStatus,
  deletePlace,
  getAnalyticsSummary,
  allocateStockToPlace,
};