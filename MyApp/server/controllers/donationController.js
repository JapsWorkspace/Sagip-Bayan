const Donation = require("../models/Donation");

// ✅ CREATE Donation
exports.createDonation = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { amount, referenceNumber } = req.body;

    if (!amount || !referenceNumber || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newDonation = new Donation({
      amount,
      referenceNumber,
      proof: req.file.path
    });

    await newDonation.save();

    res.status(201).json({
      message: "Donation submitted successfully",
      data: newDonation
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ GET all donations
exports.getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ GET single donation
exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ UPDATE status (admin use)
exports.updateDonationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updated = await Donation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ DELETE donation
exports.deleteDonation = async (req, res) => {
  try {
    await Donation.findByIdAndDelete(req.params.id);

    res.json({ message: "Donation deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};