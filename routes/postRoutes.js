const express = require("express");
const router = express.Router();
const path = require("path");
const {
  createPost,
  getPosts,
  likePost,
  commentPost,
  deletePost,
} = require("../controllers/postController");
const upload = require("../middlewares/upload");
const authMiddleware = require("../middlewares/authMiddleware");
const uploadWithFallback = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.warn("Upload error (continuing without image):", err.message);
      req.file = null; 
    }
    next();
  });
};
router.post("/", authMiddleware, uploadWithFallback, createPost);
router.get("/", authMiddleware, getPosts);
router.put("/like/:id", authMiddleware, likePost);
router.post("/comment/:id", authMiddleware, commentPost);
router.delete("/:id", authMiddleware, deletePost);
module.exports = router;