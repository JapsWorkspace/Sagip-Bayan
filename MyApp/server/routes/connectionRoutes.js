const express = require("express");
const connectionController = require("../controllers/connectionController");
const router = express.Router();

/* =========================
   CONNECTION MANAGEMENT
========================= */

router.post("/create/:id", connectionController.createConnection);
router.post("/join/:id", connectionController.joinConnection);

/* =========================
   FETCH CONNECTION DATA
========================= */

router.get("/members/:id", connectionController.getConnectionMembers);
router.get("/user/:id", connectionController.getUserConnections);
router.get("/:connectionId", connectionController.getConnectionById);

/* =========================
   SAFETY STATUS
========================= */

router.put("/safe/:id", connectionController.markSafe);
router.put("/not-safe/:id", connectionController.markNotSafe);

/* =========================
   APPROVAL FLOW (FIXED)
========================= */

// ✅ Added :userId so controller can securely authorize the creator
router.put(
  "/approve/:connectionId/:memberId/:userId",
  connectionController.approveMember
);

router.put(
  "/reject/:connectionId/:memberId/:userId",
  connectionController.rejectMember
);

/* =========================
   LEAVE CONNECTION
========================= */

router.delete(
  "/leave/:userId/:connectionId",
  connectionController.leaveConnection
);
router.put(
  "/kick/:connectionId/:memberId/:userId",
  connectionController.kickMember
);
module.exports = router;