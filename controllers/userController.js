const User = require("../models/user");
const Post = require("../models/post");
const mongoose = require("mongoose");
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").populate("connections", "name university profilePicture");
    if (!user) return res.status(404).json({ msg: "User not found" });
    const postCount = await Post.countDocuments({ userId: req.user.id });
    const connectionCount = user.connections?.length || 0;
    res.json({
      ...user.toObject(),
      postCount,
      connectionCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const { name, university, bio } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (university !== undefined) updateData.university = university;
    if (bio !== undefined) updateData.bio = bio;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select("-password");
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
exports.updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No image file provided" });
    }
    const imagePath = req.file.path || req.file.filename;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profilePicture: imagePath } },
      { new: true }
    ).select("-password");
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user.id })
      .populate("userId", "name profilePicture")
      .populate("comments.userId", "name profilePicture")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
exports.getUserById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("connections", "name university profilePicture");
    if (!user) return res.status(404).json({ msg: "User not found" });
    const postCount = await Post.countDocuments({ userId: req.params.id });
    const connectionCount = user.connections?.length || 0;
    res.json({
      ...user.toObject(),
      postCount,
      connectionCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
exports.getUserPosts = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }
    const posts = await Post.find({ userId: req.params.id })
      .populate("userId", "name profilePicture")
      .populate("comments.userId", "name profilePicture")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
