const express = require("express");
const router = express.Router();

const EvacController = require ("../controllers/EvacController.js");



router.post("/make", EvacController.createPlace);
router.get("/", EvacController.getPlaces);
router.put("/:id/status", EvacController.updateCapacityStatus);
router.delete("/:id", EvacController.deletePlace);

/* HISTORY */
router.get("/history/logs", EvacController.getHistory);

router.get("/analytics/summary", EvacController.getAnalyticsSummary);

module.exports = router;
