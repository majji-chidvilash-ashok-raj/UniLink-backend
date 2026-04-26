const User = require("../models/user");
const PendingUser = require("../models/pendingUser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

exports.registerUser = async (req, res) => {
  const { name, email, password, role, course, university } = req.body;

  try {
    const allowedDomain = "@srmap.edu.in";
    if (!email.endsWith(allowedDomain)) {
      return res.status(400).json({ msg: `Only students from SRM AP (${allowedDomain}) can register.` });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const validRoles = ["student", "admin"];
    const userRole = validRoles.includes(role) ? role : "student";

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;


    await PendingUser.findOneAndUpdate(
      { email },
      {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        course: course || "",
        university: university || "",
        otp,
        otpExpires
      },
      { upsert: true, new: true }
    );

    await sendEmail({
      email,
      subject: "UniLink Registration Verification",
      message: `Your verification code is: ${otp}.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #14b8a6;">UniLink Verification</h2>
          <p>Hello ${name},</p>
          <p>Complete your registration using this code:</p>
          <h1 style="background: #f0fdf4; padding: 10px; color: #14b8a6; text-align: center; border-radius: 5px; letter-spacing: 5px;">${otp}</h1>
        </div>
      `,
    });

    res.json({ msg: "OTP sent to email", otpRequired: true, email });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });
    if (user.isBanned) {
      return res.status(403).json({ msg: "User is banned" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send email
    await sendEmail({
      email: user.email,
      subject: "UniLink Login Verification",
      message: `Your verification code is: ${otp}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #14b8a6;">UniLink Verification</h2>
          <p>Hello ${user.name},</p>
          <p>Your one-time password for login is:</p>
          <h1 style="background: #f0fdf4; padding: 10px; color: #14b8a6; text-align: center; border-radius: 5px; letter-spacing: 5px;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    res.json({ otpRequired: true, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const pendingUser = await PendingUser.findOne({ email });
    if (pendingUser) {
      if (pendingUser.otp !== otp || pendingUser.otpExpires < Date.now()) {
        return res.status(400).json({ msg: "Invalid or expired OTP" });
      }

      const user = new User({
        name: pendingUser.name,
        email: pendingUser.email,
        password: pendingUser.password,
        role: pendingUser.role,
        course: pendingUser.course,
        university: pendingUser.university,
        isVerified: true
      });

      await user.save();
      await PendingUser.deleteOne({ email });

      const token = jwt.sign(
        { id: user._id, role: user.role, name: user.name },
        "secretkey",
        { expiresIn: "1h" }
      );

      return res.json({ 
        token, 
        user: { 
          id: user._id, 
          role: user.role, 
          name: user.name,
          email: user.email,
          university: user.university,
          course: user.course,
          profilePicture: user.profilePicture,
          bio: user.bio
        } 
      });
    }

    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      "secretkey",
      { expiresIn: "1h" }
    );

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        role: user.role, 
        name: user.name,
        email: user.email,
        university: user.university,
        course: user.course,
        profilePicture: user.profilePicture,
        bio: user.bio
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Generate 6-digit OTP for password reset
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetOTP;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    await sendEmail({
      email: user.email,
      subject: "UniLink Password Reset",
      message: `Your OTP for password reset is: ${resetOTP}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #14b8a6;">UniLink Password Reset</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset. Your OTP is:</p>
          <h1 style="background: #f0fdf4; padding: 10px; color: #14b8a6; text-align: center; border-radius: 5px; letter-spacing: 5px;">${resetOTP}</h1>
          <p>This code expires in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    res.json({ msg: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};