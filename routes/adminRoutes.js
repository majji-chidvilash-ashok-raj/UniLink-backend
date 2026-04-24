const express = require("express");
const router = express.Router();

const { banUser, getAllUsers, updateUserRole, getStats } = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// Get overview stats
router.get("/stats", authMiddleware, adminMiddleware, getStats);

// Get all users list (admin only)
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);

// Toggle ban / unban a user
router.put("/ban/:userId", authMiddleware, adminMiddleware, banUser);

// Update a user's role (promote to admin / demote to student)
router.put("/role/:userId", authMiddleware, adminMiddleware, updateUserRole);

module.exports = router;