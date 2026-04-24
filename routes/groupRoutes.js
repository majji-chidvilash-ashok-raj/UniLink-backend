const express = require("express");
const router = express.Router();

const {
  createGroup,
  getGroups,
  joinGroup,
  addUserToGroup,
  removeUserFromGroup,
} = require("../controllers/groupController");

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");


router.post("/", authMiddleware, createGroup);
router.get("/", authMiddleware, getGroups);
router.put("/join/:id", authMiddleware, joinGroup);
router.put("/add/:groupId/:userId",authMiddleware,adminMiddleware,addUserToGroup);
router.put("/remove/:groupId/:userId",authMiddleware,adminMiddleware,removeUserFromGroup);

module.exports = router;