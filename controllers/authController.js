const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save role from request — defaults to 'student' if not provided
    const validRoles = ["student", "admin"];
    const userRole = validRoles.includes(role) ? role : "student";

    user = new User({ name, email, password: hashedPassword, role: userRole });
    await user.save();

    res.json({ msg: "User registered successfully" });
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

   const token = jwt.sign(
  { id: user._id, role: user.role },  // ✅ ADD ROLE
  "secretkey",
  { expiresIn: "1h" }
);

    res.json({ token });
  } catch (err) {
    res.status(500).send("Server error");
  }
};