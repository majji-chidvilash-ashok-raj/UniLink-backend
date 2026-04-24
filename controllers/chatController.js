const Message = require("../models/Message");
const Group = require("../models/Group");

// SEND MESSAGE IN GROUP
exports.sendGroupMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const groupId = req.params.groupId;

    // 🔥 check if user is part of group
    const group = await Group.findById(groupId);

    const isMember = group.members.find(
      (m) => m.userId.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ msg: "Not a group member" });
    }

    const message = new Message({
      sender: req.user.id,
      groupId,
      text,
    });

    await message.save();
    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// GET GROUP MESSAGES
exports.getGroupMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      groupId: req.params.groupId,
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name");

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};