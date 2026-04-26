const express = require("express");
const router = express.Router();
const {
  createEvent,
  getEvents,
  joinEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
} = require("../controllers/eventController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
router.get("/", authMiddleware, getEvents);
router.put("/join/:id", authMiddleware, joinEvent);
router.post("/", authMiddleware, adminMiddleware, createEvent);
router.put("/:id", authMiddleware, adminMiddleware, updateEvent);
router.delete("/:id", authMiddleware, adminMiddleware, deleteEvent);
router.get("/:id/participants", authMiddleware, adminMiddleware, getEventParticipants);
module.exports = router;