const express = require("express");
const router = express.Router();
const controller = require("../controllers/GuidelineController");
const upload = require("../middleware/upload"); // uses the fixed guidelines folder

// Only uploads go into uploads/guidelines/
router.post("/", upload.array("attachments"), controller.createGuideline);

router.get("/", controller.getGuidelines);
router.get("/:id", controller.getGuidelineById);
router.put("/:id", controller.updateGuideline);
router.delete("/:id", controller.deleteGuideline);

module.exports = router;