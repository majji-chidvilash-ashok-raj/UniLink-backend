const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "student" },
  isVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  profilePicture: { type: String, default: "" },
  connections: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],
  requests: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],
  university: { type: String, default: "" },
  course: { type: String, default: "" },
  bio: { type: String, default: "" },
  isBanned: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;