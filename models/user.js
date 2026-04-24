const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "student" },
  isBanned: { type: Boolean, default: false },

  connections: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],
  requests: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],
  university: { type: String, default: "" },
  bio: { type: String, default: "" },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;