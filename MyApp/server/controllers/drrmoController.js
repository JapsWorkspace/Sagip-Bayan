const Barangay = require('../models/Barangay');
const Audit = require('../models/Audit');

const categoryLabels = {
  food: 'Food & Water',
  hygiene: 'Hygiene & Sanitation',
  clothing: 'Clothes & Warmth',
  furniture: 'Furniture',
  medicine: 'Medical & Safety'
};

// GET all pending relief requests for DRRMO
const getPendingRequests = async (req, res) => {
  try {
    const barangays = await Barangay.find().sort({ barangayName: 1 });
    const categories = Object.keys(categoryLabels);

    const pendingRequests = [];

    barangays.forEach(b => {
      const reliefReq = b.reliefReq || {};

      categories.forEach(key => {
        // Ensure every category has proper defaults
        const reqCategory = reliefReq[key] || {};
        const status = reqCategory.status || null;
        const peopleRange = reqCategory.peopleRange || '-';
        const requestedAt = reqCategory.requestedAt || null;

        if (status === 'requested') {
          pendingRequests.push({
            barangayId: b._id,
            barangayName: b.barangayName,
            categoryKey: key,
            category: categoryLabels[key],
            peopleRange,
            requestedAt,
            status
          });
        }
      });
    });

    console.log('Pending requests:', pendingRequests);
    res.json(pendingRequests);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Update relief request status (approve/cancel)
const updateReliefStatus = async (req, res) => {
  try {
    const { categoryKey, action } = req.body;
    const barangay = await Barangay.findById(req.params.barangayId);
    if (!barangay) return res.status(404).json({ message: 'Barangay not found' });

    const reqCategory = barangay.reliefReq[categoryKey];
    if (!reqCategory?.active) return res.status(400).json({ message: 'No active request' });

    if (action === 'accept') {
      reqCategory.status = 'approved';

      await Audit.create({
        barangayId: barangay._id,
        barangayName: barangay.barangayName,
        category: categoryKey,
        peopleRange: reqCategory.peopleRange,
        status: 'approved',
        actionBy: 'drrmo'
      });

    } else if (action === 'cancel') {
      await Audit.create({
        barangayId: barangay._id,
        barangayName: barangay.barangayName,
        category: categoryKey,
        peopleRange: reqCategory.peopleRange,
        status: 'cancelled',
        actionBy: 'drrmo'
      });

      barangay.history = barangay.history || [];
      barangay.history.push({
        category: categoryKey,
        peopleRange: reqCategory.peopleRange,
        status: 'Rejected/Cancelled By:',
        actionBy: 'drrmo',
        actionByName: req.session.userId,
        actionAt: new Date()
      });

      // Reset the request
      barangay.reliefReq[categoryKey] = { active: false, status: null };
    }

    await barangay.save();

    res.json({ message: 'Updated successfully', reliefReq: barangay.reliefReq, history: barangay.history });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getPendingRequests,
  updateReliefStatus
};
