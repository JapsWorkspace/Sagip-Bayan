const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { uploadProof } = require('../middleware/upload');

// Add new inventory item (with proof files)
router.post(
  '/',
  uploadProof.array('proofFiles', 5), // max 5 files
  inventoryController.addInventory
);

// Get all active inventory items
router.get('/', inventoryController.getInventory);

// Update inventory item (with optional new proof files)
router.put(
  '/:id',
  uploadProof.array('proofFiles', 5),
  inventoryController.updateInventory
);

// Soft delete / archive inventory item
router.delete('/:id', inventoryController.deleteInventory);

// Get archived inventory items
router.get('/archived', inventoryController.getArchivedInventory);

module.exports = router;