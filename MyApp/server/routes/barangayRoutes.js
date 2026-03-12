const express = require('express');

const barangayController = require('../controllers/barangayController');

const router = express.Router();

router.get('/me', barangayController.getMe);
router.get('/', barangayController.getBarangays);
router.put('/relief-request', barangayController.submitReliefRequest);
router.put('/relief-request-action', barangayController.updateOwnReliefRequest);

module.exports = router;
