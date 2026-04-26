const express = require("express");
const router = express.Router();
const {
  sendRequest,
  acceptRequest,
  declineRequest,
  getConnections,
  getPendingRequests,
  discoverUsers,
} = require("../controllers/connectionController");
const authMiddleware = require("../middlewares/authMiddleware");
router.get("/", authMiddleware, getConnections);
router.get("/requests", authMiddleware, getPendingRequests);
router.get("/discover", authMiddleware, discoverUsers);
router.post("/send/:id", authMiddleware, sendRequest);
router.post("/accept/:id", authMiddleware, acceptRequest);
router.post("/decline/:id", authMiddleware, declineRequest);
module.exports = router;