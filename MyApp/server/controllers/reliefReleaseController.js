const ReliefRequest = require('../models/ReliefRequest');
const ReliefRelease = require('../models/ReliefRelease');
const InventoryItem = require('../models/InventoryItem');
const InventoryLog = require('../models/InventoryLog');
const Audit = require('../models/Audit');

const normalizeString = (value) => {
  if (value === undefined || value === null) return '';
  return String(value).trim();
};

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const generateReleaseNo = async () => {
  const year = new Date().getFullYear();
  const prefix = `RL-${year}`;

  const latest = await ReliefRelease.findOne({
    releaseNo: { $regex: `^${prefix}-` }
  }).sort({ createdAt: -1 });

  let nextNumber = 1;

  if (latest?.releaseNo) {
    const parts = latest.releaseNo.split('-');
    const lastSeq = Number(parts[2]);
    if (!Number.isNaN(lastSeq)) {
      nextNumber = lastSeq + 1;
    }
  }

  return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
};

const validateReleaseItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return 'At least one release item is required.';
  }

  for (const item of items) {
    const itemName = normalizeString(item.itemName);
    const category = normalizeString(item.category).toLowerCase();
    const quantityReleased = toNumber(item.quantityReleased);
    const unit = normalizeString(item.unit);

    if (!itemName) {
      return 'Each release item must have an item name.';
    }

    // ❗ REMOVED FIXED CATEGORY CHECK
    if (!category) {
      return `Category is required for item "${itemName}".`;
    }

    if (quantityReleased <= 0) {
      return `Quantity released must be greater than 0 for item "${itemName}".`;
    }

    if (!unit) {
      return `Unit is required for item "${itemName}".`;
    }
  }

  return null;
};

/* GET REQUESTS READY FOR RELEASE */
const getApprovedRequestsForRelease = async (req, res) => {
  try {
    const requests = await ReliefRequest.find({
      status: { $in: ['approved', 'partially_released'] },
      isArchived: false
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error('Get Approved Requests For Release Error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* CREATE RELEASE AND DEDUCT INVENTORY */
const createReliefRelease = async (req, res) => {
  try {
    const username = req.session?.username || req.session?.userId || '';

    const { reliefRequestId, items, remarks } = req.body;

    if (!reliefRequestId) {
      return res.status(400).json({ message: 'Relief request ID is required.' });
    }

    const releaseItems = Array.isArray(items)
      ? items.map((item) => ({
          inventoryItemId: item.inventoryItemId || null,
          itemName: normalizeString(item.itemName),
          category: normalizeString(item.category).toLowerCase(),
          quantityReleased: toNumber(item.quantityReleased),
          unit: normalizeString(item.unit),
          remarks: normalizeString(item.remarks)
        }))
      : [];

    const validationError = validateReleaseItems(releaseItems);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const reliefRequest = await ReliefRequest.findById(reliefRequestId);
    if (!reliefRequest || reliefRequest.isArchived) {
      return res.status(404).json({ message: 'Relief request not found.' });
    }

    if (!['approved', 'partially_released'].includes(reliefRequest.status)) {
      return res.status(400).json({
        message: 'Only approved or partially released requests can be released.'
      });
    }

    // Validate stock first before deducting anything
    for (const item of releaseItems) {
      let inventoryDoc = null;

      if (item.inventoryItemId) {
        inventoryDoc = await InventoryItem.findById(item.inventoryItemId);
      }

      if (!inventoryDoc) {
        inventoryDoc = await InventoryItem.findOne({
          isArchive: false,
          type: 'goods',
          name: item.itemName,
          category: item.category.toLowerCase(),
          unit: item.unit
        });
      }

      if (!inventoryDoc) {
        return res.status(404).json({
          message: `Inventory item not found for "${item.itemName}".`
        });
      }

      const availableQty = Number(inventoryDoc.quantity || 0);

      if (availableQty < item.quantityReleased) {
        return res.status(400).json({
          message: `Insufficient stock for "${item.itemName}". Available: ${availableQty}, requested release: ${item.quantityReleased}.`
        });
      }
    }

    // Deduct stock
    for (const item of releaseItems) {
      let inventoryDoc = null;

      if (item.inventoryItemId) {
        inventoryDoc = await InventoryItem.findById(item.inventoryItemId);
      }

      if (!inventoryDoc) {
        inventoryDoc = await InventoryItem.findOne({
          isArchive: false,
          type: 'goods',
          name: item.itemName,
          category: item.category.toLowerCase(),
          unit: item.unit
        });
      }

      inventoryDoc.quantity = Number(inventoryDoc.quantity || 0) - item.quantityReleased;
      await inventoryDoc.save();

      await InventoryLog.create({
        inventoryItem: inventoryDoc._id,
        itemName: inventoryDoc.name,
        itemType: inventoryDoc.type,
        action: 'release',
        quantity: item.quantityReleased,
        amount: undefined,
        performedBy: String(username),
        remarks: `Released for relief request ${reliefRequest.requestNo}`
      });

      item.inventoryItemId = inventoryDoc._id;
    }

    const releaseNo = await generateReleaseNo();

    const reliefRelease = await ReliefRelease.create({
      reliefRequestId: reliefRequest._id,
      barangayId: reliefRequest.barangayId,
      barangayName: reliefRequest.barangayName,
      releaseNo,
      items: releaseItems,
      releaseStatus: 'released',
      releasedBy: String(username),
      releasedAt: new Date(),
      remarks: normalizeString(remarks)
    });

    const totalReleased = releaseItems.reduce(
      (sum, item) => sum + Number(item.quantityReleased || 0),
      0
    );

    const requestedTotal = Number(reliefRequest.totals?.requestedFoodPacks || 0);

    if (requestedTotal > 0 && totalReleased < requestedTotal) {
      reliefRequest.status = 'partially_released';
    } else {
      reliefRequest.status = 'released';
    }

    reliefRequest.releasedBy = String(username);
    reliefRequest.releasedAt = new Date();
    await reliefRequest.save();

    await Audit.create({
      barangayId: reliefRequest.barangayId,
      barangayName: reliefRequest.barangayName,
      category: 'relief_release',
      peopleRange: `Released total quantity: ${totalReleased}`,
      status: reliefRequest.status,
      actionBy: 'drrmo'
    });

    res.status(201).json({
      message: 'Relief goods released successfully.',
      release: reliefRelease,
      request: reliefRequest
    });
  } catch (err) {
    console.error('Create Relief Release Error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* GET RELEASES FOR A REQUEST */
const getReleasesByRequest = async (req, res) => {
  try {
    const releases = await ReliefRelease.find({
      reliefRequestId: req.params.reliefRequestId,
      isArchived: false
    }).sort({ createdAt: -1 });

    res.json(releases);
  } catch (err) {
    console.error('Get Releases By Request Error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* GET ALL RELEASES */
const getAllReliefReleases = async (req, res) => {
  try {
    const releases = await ReliefRelease.find({
      isArchived: false
    }).sort({ createdAt: -1 });

    res.json(releases);
  } catch (err) {
    console.error('Get All Relief Releases Error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getApprovedRequestsForRelease,
  createReliefRelease,
  getReleasesByRequest,
  getAllReliefReleases
};
