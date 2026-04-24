const Group = require("../models/Group");

exports.createGroup = async (req, res) => {
  try {
    const { groupName, description } = req.body;

    const group = new Group({
      groupName,
      description,
      members: [
        {
          userId: req.user.id,
          role: "admin",
        },
      ],
    });

    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    const isMember = group.members.find(
      (m) => m.userId.toString() === req.user.id
    );

    if (isMember) {
      return res.status(400).json({ msg: "Already a member" });
    }

    group.members.push({
      userId: req.user.id,
      role: "member",
    });

    await group.save();

    res.json(group);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.addUserToGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    const userId = req.params.userId;

    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }

    const alreadyMember = group.members.find(
      (m) => m.userId.toString() === userId
    );

    if (alreadyMember) {
      return res.status(400).json({ msg: "User already in group" });
    }

    group.members.push({
      userId,
      role: "member",
    });

    await group.save();

    res.json({ msg: "User added to group" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.removeUserFromGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    const userId = req.params.userId;

    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }

    group.members = group.members.filter(
      (m) => m.userId.toString() !== userId
    );

    await group.save();

    res.json({ msg: "User removed from group" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};