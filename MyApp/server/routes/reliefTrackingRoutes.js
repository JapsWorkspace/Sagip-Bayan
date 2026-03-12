const express = require('express');
const { getReliefTracking } = require('../controllers/reliefTrackingController.js');

const router = express.Router();

router.get('/', getReliefTracking);

module.exports = router;
