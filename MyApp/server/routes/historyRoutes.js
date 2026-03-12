const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

router.post('/registerHistory', historyController.registerHistory);
router.get('/getHistory', historyController.getHistory);

module.exports = router;
