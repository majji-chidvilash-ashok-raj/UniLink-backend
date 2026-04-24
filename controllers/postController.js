const Post = require("../models/post");

exports.createPost = async (req, res) => {
  try {
    const content = req.body.content;

    const post = new Post({
      userId: req.user.id,
      content,
      image: req.file ? req.file.path : null,
    });

    await post.save();
    res.json(post);
  } catch (err) {
  console.error(err);   // 🔥 THIS LINE
  res.status(500).send(err.message);
}
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("userId", "name");
    res.json(posts);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({ msg: "Already liked" });
    }

    post.likes.push(req.user.id);
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.commentPost = async (req, res) => {
  try {
    const { text } = req.body;

    const post = await Post.findById(req.params.id);

    post.comments.push({
      userId: req.user.id,
      text,
    });

    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    if (
      req.user.role !== "admin" &&
      post.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await post.deleteOne();

    res.json({ msg: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};