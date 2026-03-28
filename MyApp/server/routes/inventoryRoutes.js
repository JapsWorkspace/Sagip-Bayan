const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { uploadProof } = require('../middleware/upload');

// Add new inventory item
router.post(
  '/',
  uploadProof.array('proofFiles', 5),
  inventoryController.addInventory
);

// Get all active inventory items
router.get('/', inventoryController.getInventory);

// Get archived inventory items
router.get('/archived', inventoryController.getArchivedInventory);

// Update inventory item
router.put(
  '/:id',
  uploadProof.array('proofFiles', 5),
  inventoryController.updateInventory
);

// Archive inventory item
router.delete('/:id', inventoryController.deleteInventory);

module.exports = router;
