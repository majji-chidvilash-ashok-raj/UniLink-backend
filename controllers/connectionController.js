const User = require("../models/user");

// Send connection request
exports.sendRequest = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ msg: "User not found" });

    // Prevent sending request to self
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

// Accept connection request
exports.acceptRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const senderId = req.params.id;

    // Check if request exists
    if (!user.requests.includes(senderId)) {
      return res.status(400).json({ msg: "No request from this user" });
    }

    // Remove from requests
    user.requests = user.requests.filter(
      (id) => id.toString() !== senderId
    );

    // Add to connections
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

// Decline connection request
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

// Get current connections
exports.getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("connections", "name email role university");
    res.json(user.connections);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Get pending requests
exports.getPendingRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("requests", "name email role university");
    res.json(user.requests);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Discover students
exports.discoverUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    // Find students who:
    // 1. Are not the current user
    // 2. Are not already connected
    // 3. Have not received a request from current user
    // 4. Have not sent a request to current user

    const excludedIds = [
      req.user.id,
      ...currentUser.connections,
      ...currentUser.requests
    ];

    // Also need to exclude users current user has SENT requests TO
    // But our schema stores requests on the TARGET user. 
    // So we find users who have current user in THEIR requests array.

    const usersWithMyRequest = await User.find({ requests: req.user.id }, '_id');
    const myRequestIds = usersWithMyRequest.map(u => u._id.toString());

    const allExcluded = [...excludedIds, ...myRequestIds];

    const users = await User.find({
      _id: { $nin: allExcluded },
      role: 'student',
      isBanned: false
    }).select("name email university");

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};