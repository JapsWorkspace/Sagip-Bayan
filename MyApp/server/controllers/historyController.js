<<<<<<< HEAD
const HistoryModel = require("../models/History");

/* =========================
   GET HISTORY (BY PLACE / CONNECTION)
========================= */

const getHistory = async (req, res) => {
  try {
    const { placeName } = req.params;

    if (!placeName) {
      return res.status(400).json({
        message: "placeName is required to fetch history"
      });
    }

    const histories = await HistoryModel.find({ placeName })
      .sort({ createdAt: -1 });

    res.json(histories);
  } catch (err) {
    console.error("Get history error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* =========================
   REGISTER HISTORY
========================= */

const registerHistory = async (req, res) => {
  try {
    const { action, placeName, details } = req.body;

    if (!action || !placeName) {
      return res.status(400).json({
        message: "action and placeName are required"
      });
    }

    const newHistory = new HistoryModel({
      action,
      placeName,
      details
    });

    const savedHistory = await newHistory.save();
    res.json(savedHistory);
  } catch (err) {
    console.error("Register history error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getHistory,
  registerHistory
};
=======
const UserModel = require("../models/History");

const getHistory = (req, res) => {
    UserModel.find()
    .then(histories => res.json(histories))
    .catch(err => {
        console.log(err)
         res.status(500).json({error: "Internal  Server Error"});
    })

}

const registerHistory = (req, res) => {
    const newHistory = new UserModel(req.body);
    newHistory.save()
    .then(histories => res.json(histories))
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    });
};

module.exports = { getHistory, registerHistory };
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
