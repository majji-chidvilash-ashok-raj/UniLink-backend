const User = require("../models/user");
const Post = require("../models/post");
const Event = require("../models/event");
const Group = require("../models/group");

// GET all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// GET overview stats
exports.getStats = async (req, res) => {
  try {
    const [userCount, postCount, eventCount, groupCount] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Event.countDocuments(),
      Group.countDocuments()
    ]);
    
    const recentUsers = await User.find().sort({ _id: -1 }).limit(5).select("name email role createdAt");
    const bannedUsers = await User.countDocuments({ isBanned: true });

    res.json({
      counts: {
        users: userCount,
        posts: postCount,
        events: eventCount,
        groups: groupCount,
        banned: bannedUsers
      },
      recentUsers
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Update a user's role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ["student", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ msg: "Invalid role. Must be student or admin" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true, select: "-password" }
    );
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ msg: `Role updated to ${role}`, user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Toggle ban status
exports.banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ msg: "Cannot ban admin" });
    }

    // Toggle the ban status
    user.isBanned = !user.isBanned;
    await user.save();

    res.json({ msg: user.isBanned ? "User banned" : "User unbanned", isBanned: user.isBanned, user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};