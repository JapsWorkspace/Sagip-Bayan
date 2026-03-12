const express = require('express');
const drrmoController = require('../controllers/drrmoController');
const router = express.Router();

router.get('/pending-requests', drrmoController.getPendingRequests);
router.put('/relief-request-status/:barangayId', drrmoController.updateReliefStatus);

module.exports = router;
