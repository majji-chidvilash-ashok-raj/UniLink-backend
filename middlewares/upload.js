const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Try to use Cloudinary if credentials are available
let storage;

try {
  const { CloudinaryStorage } = require("multer-storage-cloudinary");
  const cloudinary = require("../config/cloudinary");

  // Test that credentials look valid (non-empty)
  const name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const key = process.env.CLOUDINARY_API_KEY?.trim();
  const secret = process.env.CLOUDINARY_API_SECRET?.trim();
  const forceLocal = process.env.USE_LOCAL_STORAGE === "true";

  if (!forceLocal && name && key && secret && secret.length > 20) {
    storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "unilink_posts",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      },
    });
    console.log("✅ Cloudinary storage active");
  } else {
    throw new Error(forceLocal ? "Local storage forced" : "Cloudinary credentials missing or invalid");
  }
} catch (err) {
  console.warn("⚠️  Using local disk storage:", err.message);

  // Ensure uploads directory exists
  const uploadDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  });
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

module.exports = upload;