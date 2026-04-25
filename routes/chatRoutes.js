const express = require("express");
const router = express.Router();

const {
  sendGroupMessage,
  getGroupMessages,
  sendDirectMessage,
  getDirectMessages,
  getConversations
} = require("../controllers/chatController");

const authMiddleware = require("../middlewares/authMiddleware");

// conversations list
router.get("/conversations", authMiddleware, getConversations);

// group chat
router.post("/group/:groupId", authMiddleware, sendGroupMessage);
router.get("/group/:groupId", authMiddleware, getGroupMessages);

// direct chat
router.post("/direct/:receiverId", authMiddleware, sendDirectMessage);
router.get("/direct/:receiverId", authMiddleware, getDirectMessages);

module.exports = router;