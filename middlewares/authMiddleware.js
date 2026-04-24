const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "Token missing" });
    }

    const decoded = jwt.verify(token, "secretkey");

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    if (user.isBanned) {
      return res.status(403).json({ msg: "User is banned" });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = authMiddleware;