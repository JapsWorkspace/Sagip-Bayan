const InventoryItem = require('../models/InventoryItem');
const InventoryLog = require('../models/InventoryLog');

const VALID_TYPES = ['goods', 'monetary'];
const VALID_CATEGORIES = ['food', 'clothing', 'hygiene'];
const VALID_SOURCE_TYPES = ['external', 'government', 'internal'];

const normalizeString = (value) => {
  if (value === undefined || value === null) return '';
  return String(value).trim();
};

const normalizeLower = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).trim().toLowerCase();
};

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const validateInventoryData = (body, isUpdate = false, currentType = null) => {
  const errors = [];

  const type = normalizeLower(body.type, currentType || 'goods');
  const name = body.name !== undefined ? normalizeString(body.name) : undefined;
  const category = body.category !== undefined ? normalizeLower(body.category) : undefined;
  const quantity = body.quantity !== undefined ? toNumber(body.quantity) : undefined;
  const unit = body.unit !== undefined ? normalizeString(body.unit) : undefined;
  const amount = body.amount !== undefined ? toNumber(body.amount) : undefined;
  const description = body.description !== undefined ? normalizeString(body.description) : undefined;
  const sourceType = body.sourceType !== undefined
    ? normalizeLower(body.sourceType)
    : undefined;
  const sourceName = body.sourceName !== undefined ? normalizeString(body.sourceName) : undefined;

  if (!VALID_TYPES.includes(type)) {
    errors.push('Invalid type. Must be goods or monetary.');
  }

  if (!isUpdate || body.name !== undefined) {
    if (!name) errors.push('Name is required.');
  }

  if (sourceType !== undefined && !VALID_SOURCE_TYPES.includes(sourceType)) {
    errors.push('Invalid sourceType. Must be external, government, or internal.');
  }

  if (type === 'goods') {
    if (!isUpdate || body.category !== undefined) {
      if (!category || !VALID_CATEGORIES.includes(category)) {
        errors.push('Category is required for goods and must be food, clothing, or hygiene.');
      }
    }

    if (!isUpdate || body.quantity !== undefined) {
      if (quantity === undefined || quantity < 0) {
        errors.push('Quantity is required for goods and must be 0 or higher.');
      }
    }

    if (!isUpdate || body.unit !== undefined) {
      if (!unit) {
        errors.push('Unit is required for goods.');
      }
    }
  }

  if (type === 'monetary') {
    if (!isUpdate || body.amount !== undefined) {
      if (amount === undefined || amount < 0) {
        errors.push('Amount is required for monetary and must be 0 or higher.');
      }
    }
  }

  return {
    errors,
    data: {
      type,
      name,
      category,
      quantity,
      unit,
      amount,
      description,
      sourceType,
      sourceName
    }
  };
};

const createLog = async (item, action, username, remarks = '') => {
  await InventoryLog.create({
    inventoryItem: item._id,
    itemName: item.name,
    itemType: item.type,
    action,
    quantity: item.type === 'goods' ? item.quantity : undefined,
    amount: item.type === 'monetary' ? item.amount : undefined,
    performedBy: username || '',
    remarks
  });
};

// Add new inventory item
const addInventory = async (req, res) => {
  try {
    const username = req.session?.username || '';

    const { errors, data } = validateInventoryData(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const proofFiles = req.files ? req.files.map(file => file.filename) : [];

    const itemData = {
      type: data.type,
      name: data.name,
      description: data.description || '',
      sourceType: data.sourceType || 'external',
      sourceName: data.sourceName || '',
      proofFiles,
      addedBy: username,
      isArchive: false
    };

    if (data.type === 'goods') {
      itemData.category = data.category;
      itemData.quantity = data.quantity;
      itemData.unit = data.unit;
    }

    if (data.type === 'monetary') {
      itemData.amount = data.amount;
    }

    const item = await InventoryItem.create(itemData);

    await createLog(item, 'create', username, 'Inventory item created');

    res.status(201).json(item);
  } catch (err) {
    console.error('Add Inventory Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get all active inventory items
const getInventory = async (req, res) => {
  try {
    const items = await InventoryItem.find({ isArchive: false }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('Get Inventory Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update inventory item
const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.session?.username || '';

    const item = await InventoryItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const finalType = req.body.type
      ? normalizeLower(req.body.type, item.type)
      : item.type;

    const mergedBody = {
      ...req.body,
      type: finalType
    };

    const { errors, data } = validateInventoryData(mergedBody, true, item.type);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    if (req.body.name !== undefined) item.name = data.name;
    if (req.body.type !== undefined) item.type = data.type;
    if (req.body.description !== undefined) item.description = data.description;
    if (req.body.sourceType !== undefined) item.sourceType = data.sourceType;
    if (req.body.sourceName !== undefined) item.sourceName = data.sourceName;

    if (item.type === 'goods') {
      if (req.body.category !== undefined) item.category = data.category;
      if (req.body.quantity !== undefined) item.quantity = data.quantity;
      if (req.body.unit !== undefined) item.unit = data.unit;

      item.amount = undefined;
    }

    if (item.type === 'monetary') {
      if (req.body.amount !== undefined) item.amount = data.amount;

      item.category = undefined;
      item.quantity = undefined;
      item.unit = undefined;
    }

    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map(file => file.filename);
      item.proofFiles = [...(item.proofFiles || []), ...newFiles];
    }

    await item.save();

    await createLog(item, 'update', username, 'Inventory item updated');

    res.json(item);
  } catch (err) {
    console.error('Update Inventory Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Soft delete / archive
const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.session?.username || '';

    const item = await InventoryItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.isArchive = true;
    await item.save();

    await createLog(item, 'archive', username, 'Inventory item archived');

    res.json({
      message: 'Inventory archived successfully',
      item
    });
  } catch (err) {
    console.error('Delete Inventory Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get archived inventory
const getArchivedInventory = async (req, res) => {
  try {
    const items = await InventoryItem.find({ isArchive: true }).sort({ updatedAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('Get Archived Inventory Error:', err);
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
