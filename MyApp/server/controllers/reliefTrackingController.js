const Barangay = require('../models/Barangay.js');
const User = require('../models/User.js');

const categories = ['food', 'hygiene', 'clothing', 'furniture', 'medicine'];

async function getReliefTracking(req, res) {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: 'Not logged in' });
    }

    const user = await User.findById(req.session.userId);
    const isDRRMO = user?.role === 'drrmo';

    /* ================= DRRMO VIEW ================= */
    if (isDRRMO) {
      const barangays = await Barangay.find();

      const rows = barangays.flatMap(barangay =>
        categories
          .map(key => {
            const r = barangay.reliefReq?.[key];
            if (!r) return null;
            if (!['approved', 'received'].includes(r.status)) return null;

            return {
              viewerType: 'drrmo',
              barangayId: barangay._id,
              barangayName: barangay.barangayName,
              categoryKey: key,
              status: r.status,
              peopleRange: r.peopleRange,
              requestedAt: r.requestedAt
            };
          })
          .filter(Boolean)
      );

      return res.json(rows);
    }

    /* ================= BARANGAY VIEW ================= */
    const barangay = await Barangay.findById(req.session.userId);
    if (!barangay) {
      return res.status(404).json({ message: 'Barangay not found' });
    }

    const rows = categories
      .map(key => {
        const r = barangay.reliefReq?.[key];
        if (!r || !r.status) return null;

        return {
          viewerType: 'barangay',
          barangayId: barangay._id,
          barangayName: barangay.barangayName,
          categoryKey: key,
          status: r.status,
          peopleRange: r.peopleRange,
          requestedAt: r.requestedAt
        };
      })
      .filter(Boolean);

    res.json({
      rows,
      history: barangay.history || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = {getReliefTracking}