const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const eventRoutes = require("./routes/eventRoutes");
const groupRoutes = require("./routes/groupRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = 5000;

// Allow requests from the React frontend
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));

app.use(express.json());

// Serve locally uploaded images (fallback when Cloudinary is not available)
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});