const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
  
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  text: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

module.exports = Message;