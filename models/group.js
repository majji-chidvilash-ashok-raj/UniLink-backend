const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema({
  groupName: String,
  description: String,
  members: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String, default: "member" },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.models.Group || mongoose.model('Group', groupSchema)