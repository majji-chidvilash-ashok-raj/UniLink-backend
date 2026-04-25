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
    
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt");
    const bannedUsersCount = await User.countDocuments({ isBanned: true });

    // Calculate User Growth (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const growthData = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Fill in zeros for days with no signups
    const growthArray = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = growthData.find(g => g._id === dateStr);
      growthArray.push(match ? match.count : 0);
    }

    // Compile Recent Activity
    const [latestUsers, latestPosts, latestEvents] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(3).select("name createdAt"),
      Post.find().sort({ createdAt: -1 }).limit(3).populate("userId", "name").select("createdAt"),
      Event.find().sort({ createdAt: -1 }).limit(3).select("eventName createdAt")
    ]);

    const activity = [
      ...latestUsers.map(u => ({ action: "New user registered", detail: u.name, time: u.createdAt, type: "user" })),
      ...latestPosts.map(p => ({ action: "New post created", detail: `By ${p.userId?.name || 'Unknown'}`, time: p.createdAt, type: "post" })),
      ...latestEvents.map(e => ({ action: "New event launched", detail: e.eventName, time: e.createdAt, type: "event" }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

    res.json({
      counts: {
        users: userCount,
        posts: postCount,
        events: eventCount,
        groups: groupCount,
        banned: bannedUsersCount
      },
      recentUsers,
      userGrowth: growthArray,
      recentActivity: activity
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