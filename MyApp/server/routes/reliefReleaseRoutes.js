const express = require('express');
const router = express.Router();
const controller = require('../controllers/reliefReleaseController');

router.get('/approved-requests', controller.getApprovedRequestsForRelease);
router.post('/', controller.createReliefRelease);
router.get('/', controller.getAllReliefReleases);
router.get('/request/:reliefRequestId', controller.getReleasesByRequest);

module.exports = router;
