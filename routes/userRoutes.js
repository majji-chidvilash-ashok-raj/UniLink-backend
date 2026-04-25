const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, updateProfilePicture, getMyPosts, getUserById, getUserPosts } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

// Wrap multer to handle errors gracefully
const uploadProfilePic = (req, res, next) => {
  upload.single("profilePicture")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ msg: err.message });
    }
    next();
  });
};

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/profile/picture", authMiddleware, uploadProfilePic, updateProfilePicture);
router.get("/posts", authMiddleware, getMyPosts);
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);
    const users = await require("../models/user").find({
      $and: [
        { _id: { $ne: req.user.id } },
        {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        },
      ],
    }).select("name profilePicture role university").limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/:id", authMiddleware, getUserById);
router.get("/:id/posts", authMiddleware, getUserPosts);

module.exports = router;
