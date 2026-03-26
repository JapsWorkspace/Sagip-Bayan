const InventoryItem = require('../models/InventoryItem');
const InventoryLog = require('../models/InventoryLog');
const { uploadProof } = require('../middleware/upload');

// Add new inventory item
const addInventory = async (req, res) => {
  console.log("=== ADD INVENTORY SESSION CHECK ===");
console.log("SESSION:", req.session);
console.log("SESSION ID:", req.sessionID);
console.log("USERNAME:", req.session?.username);
console.log("ROLE:", req.session?.role);
console.log("USER ID:", req.session?.userId);
  try {
    const { name, category, quantity, unit, description, type } = req.body;

    const proofFiles = req.files ? req.files.map(file => file.filename) : [];

    const addedBy = req.session?.username 

    const item = await InventoryItem.create({
      name,
      category,
      quantity,
      unit,
      description,
      type: type || 'goods',
      proofFiles,
      addedBy,
    });

    await InventoryLog.create({
      inventoryItem: item._id,
      action: 'create',
      user: req.session.username,
      timestamp: new Date()
    });

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get all active inventory items
const getInventory = async (req, res) => {
  try {
    const items = await InventoryItem.find({ isArchive: false });

    // Normalize type
    const normalized = items.map(item => ({
      ...item._doc,
      type: item.type ? item.type.toLowerCase() : 'goods'
    }));

    res.json(normalized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update inventory item
const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, unit, description, type } = req.body;

    const item = await InventoryItem.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Update all fields if provided
    if (name) item.name = name;
    if (category) item.category = category;
    if (quantity !== undefined) item.quantity = quantity;
    if (unit) item.unit = unit;
    if (description) item.description = description;
    if (type) item.type = type; // now updates goods/monetary type

    // Handle additional files
    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map(f => f.filename);
      item.proofFiles = [...item.proofFiles, ...newFiles];
    }

    await item.save();

    await InventoryLog.create({
      inventoryItem: item._id,
      action: 'update',
      user: req.session.username,
      timestamp: new Date()
    });

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Soft delete (archive)
const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await InventoryItem.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.isArchive = true;
    await item.save();

    await InventoryLog.create({
      inventoryItem: item._id,
      action: 'archive',
      user: req.session.username,
      timestamp: new Date()
    });

    res.json({ message: 'Inventory archived', item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get archived items
const getArchivedInventory = async (req, res) => {
  try {
    const items = await InventoryItem.find({ isArchive: true });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addInventory,
  getInventory,
  updateInventory,
  deleteInventory,
  getArchivedInventory
};