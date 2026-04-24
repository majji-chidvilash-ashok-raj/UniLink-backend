const User = require("../models/user");
const Post = require("../models/post");

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").populate("connections", "name university");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, university, bio } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    // Note: Bio and University might need to be added to the schema if not there
    // But since the schema is flexible in Mongo, we can just save them.
    // However, it's better if they are in the schema for consistency.

    // We'll update what we can
    const updateData = {};
    if (name) updateData.name = name;
    if (university) updateData.university = university;
    if (bio) updateData.bio = bio;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Get current user posts
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
