const Barangay = require('../models/Barangay');
const User = require('../models/User');
const Audit = require('../models/Audit');

/* GET LOGGED-IN BARANGAY */
const getMe = async (req, res) => {
  try {
    if (!req.session?.userId)
      return res.status(401).json({ message: 'Not logged in' });

    let account = await Barangay.findById(req.session.userId).select('-password');
    if (account) {
      account.role = 'barangay';
      return res.json(account);
    }

    account = await User.findById(req.session.userId).select('-password');
    if (account) return res.json(account);

    return res.status(404).json({ message: 'Account not found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET ALL BARANGAYS (NAMES ONLY) */
const getBarangays = async (req, res) => {
  try {
    const barangays = await Barangay.find()
      .select('barangayName -_id')
      .sort({ barangayName: 1 });

    res.json(barangays);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* SUBMIT RELIEF REQUEST */
const submitReliefRequest = async (req, res) => {
  try {
    if (!req.session?.userId)
      return res.status(401).json({ message: 'Not logged in' });

    const { categoryKey, peopleRange } = req.body;

    const barangay = await Barangay.findById(req.session.userId);
    if (!barangay)
      return res.status(404).json({ message: 'Barangay not found' });

    // Validate category key
    const validCategories = ['food', 'hygiene', 'clothing', 'furniture', 'medicine'];
    if (!validCategories.includes(categoryKey))
      return res.status(400).json({ message: 'Invalid category' });

    // Initialize reliefReq object if missing
    barangay.reliefReq = barangay.reliefReq || {};
    barangay.reliefReq[categoryKey] = {
      active: true,
      status: 'requested',
      peopleRange,
      requestedAt: new Date()
    };

    await barangay.save();

    await Audit.create({
      barangayId: barangay._id,
      barangayName: barangay.barangayName,
      category: categoryKey,
      peopleRange,
      status: 'requested',
      actionBy: 'barangay'
    });

    res.json({ message: 'Request submitted', reliefReq: barangay.reliefReq });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* BARANGAY ACTIONS */
const updateOwnReliefRequest = async (req, res) => {
  try {
    if (!req.session?.userId)
      return res.status(401).json({ message: 'Not logged in' });

    const { categoryKey, action } = req.body;
    const barangay = await Barangay.findById(req.session.userId);
    if (!barangay)
      return res.status(404).json({ message: 'Barangay not found' });

    const reqCategory = barangay.reliefReq?.[categoryKey];
    if (!reqCategory)
      return res.status(400).json({ message: 'No request found' });

    barangay.history = barangay.history || [];

    if (action === 'cancel') {
      await Audit.create({
        barangayId: barangay._id,
        barangayName: barangay.barangayName,
        category: categoryKey,
        peopleRange: reqCategory.peopleRange,
        status: 'cancelled',
        actionBy: 'barangay'
      });

      barangay.history.push({
        category: categoryKey,
        peopleRange: reqCategory.peopleRange,
        status: 'Cancelled By:',
        actionBy: 'barangay',
        actionByName: barangay.barangayName,
        actionAt: new Date()
      });

      // Remove from reliefReq
      barangay.reliefReq[categoryKey] = { active: false, status: null };
    }

    if (action === 'received') {
      await Audit.create({
        barangayId: barangay._id,
        barangayName: barangay.barangayName,
        category: categoryKey,
        peopleRange: reqCategory.peopleRange,
        status: 'received',
        actionBy: 'barangay'
      });

      barangay.history.push({
        category: categoryKey,
        peopleRange: reqCategory.peopleRange,
        status: 'Received',
        actionBy: 'barangay',
        actionByName: barangay.barangayName,
        actionAt: new Date()
      });

      // Remove from reliefReq
      barangay.reliefReq[categoryKey] = { active: false, status: null };
    }

    await barangay.save();

    res.json({
      reliefReq: barangay.reliefReq,
      history: barangay.history
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMe,
  getBarangays,
  submitReliefRequest,
  updateOwnReliefRequest
};
