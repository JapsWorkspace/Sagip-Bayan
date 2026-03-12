const Place = require("../models/EvacPlace.js");
const EHistory = require("../models/EvacHistory.js");


const sanitizeText = (value) => {
  return value.replace(/<[^>]*>?/gm, "").trim();
};

const createPlace = async (req, res) => {
  try {
    const { name, location, capacity, latitude, longitude } = req.body;

    // Ensure all fields including coordinates are provided
    if (
      !name ||
      !location ||
      capacity === undefined ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({ message: "All fields including coordinates are required." });
    }

    // Convert coordinates and capacity to numbers
    const latNum = Number(latitude);
    const lngNum = Number(longitude);
    const capNum = Number(capacity);

    // Validate conversion
    if (isNaN(latNum) || isNaN(lngNum) || isNaN(capNum)) {
      return res.status(400).json({ message: "Coordinates and capacity must be valid numbers." });
    }

    const newPlace = new Place({
      name: sanitizeText(name),
      location: sanitizeText(location),
      latitude: latNum,
      longitude: lngNum,
      capacity: capNum,
      capacityStatus: "available"
    });

    await newPlace.save();

    await EHistory.create({
      action: "ADD",
      placeName: newPlace.name,
      details: `Added with capacity ${newPlace.capacity}`
    });

    res.status(201).json({
      message: "Place created successfully",
      place: newPlace
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


const getPlaces = (req, res) => {
  Place.find().sort({ createdAt: -1 })
    .then(places => {
      res.json(places);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    });
};

const getHistory = (req, res) => {
  EHistory.find().sort({ createdAt: -1 })
    .then((logs) => res.json(logs))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Failed to load history" });
    });
};


const updateCapacityStatus = (req, res) => {
  const { id } = req.params;
  const { capacityStatus } = req.body;

  Place.findByIdAndUpdate(id, { capacityStatus }, { new: true })
    .then((updated) => {
      if (!updated) {
        return res.status(404).json({ message: "Place not found" });
      }

      return EHistory.create({
        action: "STATUS_UPDATE",
        placeName: updated.name,
        details: `Status changed to ${capacityStatus}`
      }).then(() => res.json(updated));
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Update failed" });
    });
};

const deletePlace = (req, res) => {
  const { id } = req.params;

  Place.findByIdAndDelete(id)
    .then((deleted) => {
      if (!deleted) {
        return res.status(404).json({ message: "Place not found" });
      }

      return EHistory.create({
        action: "DELETE",
        placeName: deleted.name,
        details: "Place deleted"
      }).then(() =>
        res.json({ message: "Place deleted successfully" })
      );
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Delete failed" });
    });
};

module.exports = { getHistory, createPlace, getPlaces, updateCapacityStatus, deletePlace };


