const express = require("express");
const router = express.Router();

const {
  sendGroupMessage,
  getGroupMessages,
} = require("../controllers/chatController");

const authMiddleware = require("../middlewares/authMiddleware");

// group chat
router.post("/group/:groupId", authMiddleware, sendGroupMessage);
router.get("/group/:groupId", authMiddleware, getGroupMessages);

module.exports = router;