const Barangay = require('../models/Barangay');
const User = require('../models/User');

/* GET LOGGED-IN BARANGAY */
const getMe = async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: 'Not logged in' });
    }

    let account = await Barangay.findById(req.session.userId).select('-password');

    if (account) {
      return res.json({
        ...account.toObject(),
        role: 'barangay'
      });
    }

    account = await User.findById(req.session.userId).select('-password');
    if (account) {
      return res.json(account);
    }

    return res.status(404).json({ message: 'Account not found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET ALL BARANGAYS (NAMES ONLY) */
const getBarangays = async (req, res) => {
  try {
    const barangays = await Barangay.find({ archived: false })
      .select('barangayName -_id')
      .sort({ barangayName: 1 });

    res.json(barangays);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMe,
  getBarangays
};