const express = require("express");
const router = express.Router();

const donationController = require("../controllers/donationController");
const { uploadProof } = require("../middleware/upload");

// ✅ CREATE (with file upload)
router.post(
  "/",
  uploadProof.single("proof"),
  donationController.createDonation
);

// ✅ READ
router.get("/", donationController.getAllDonations);
router.get("/:id", donationController.getDonationById);

// ✅ UPDATE
router.put("/:id/status", donationController.updateDonationStatus);

// ✅ DELETE
router.delete("/:id", donationController.deleteDonation);

module.exports = router;