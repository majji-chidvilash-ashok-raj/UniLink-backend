const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, getMyPosts } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.get("/posts", authMiddleware, getMyPosts);

module.exports = router;
