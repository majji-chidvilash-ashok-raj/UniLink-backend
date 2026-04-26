const User = require("../models/user");
exports.sendRequest = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ msg: "User not found" });
    if (targetUser._id.toString() === req.user.id) {
      return res.status(400).json({ msg: "Cannot connect with yourself" });
    }
    if (targetUser.requests.includes(req.user.id)) {
      return res.status(400).json({ msg: "Already requested" });
    }
    if (targetUser.connections.includes(req.user.id)) {
      return res.status(400).json({ msg: "Already connected" });
    }
    targetUser.requests.push(req.user.id);
    await targetUser.save();
    res.json({ msg: "Request sent" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
exports.acceptRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const senderId = req.params.id;
    if (!user.requests.includes(senderId)) {
      return res.status(400).json({ msg: "No request from this user" });
    }
    user.requests = user.requests.filter(
      (id) => id.toString() !== senderId
    );
    user.connections.push(senderId);
    const sender = await User.findById(senderId);
    if (!sender) return res.status(404).json({ msg: "Sender not found" });
    sender.connections.push(req.user.id);
    await user.save();
    await sender.save();
    res.json({ msg: "Connected" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
exports.declineRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.requests = user.requests.filter(
      (id) => id.toString() !== req.params.id
    );
    await user.save();
    res.json({ msg: "Request declined" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
exports.getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("connections", "name email role university");
    res.json(user.connections);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
exports.getPendingRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("requests", "name email role university");
    res.json(user.requests);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
exports.discoverUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const excludedIds = [req.user.id, ...currentUser.connections];
    const users = await User.find({
      _id: { $nin: excludedIds },
      role: 'student',
      isBanned: false
    }).select("name email university profilePicture requests");
    const formattedUsers = users.map(u => {
      const uObj = u.toObject();
      let status = 'none';
      if (u.requests.some(rid => rid.toString() === req.user.id)) {
        status = 'sent';
      } else if (currentUser.requests.some(rid => rid.toString() === u._id.toString())) {
        status = 'received';
      }
      return {
        ...uObj,
        status
      };
    });
    res.json(formattedUsers);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};