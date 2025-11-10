const express = require("express");
const router = express.Router();
const User = require("../models/User");
const ChuDe = require("../models/ChuDe"); // model chủ đề nếu muốn thống kê

// ------------------ LẤY TOÀN BỘ NGƯỜI DÙNG ------------------
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password -passwordHash"); // loại bỏ password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ------------------ THỐNG KÊ NGƯỜI DÙNG & CHỦ ĐỀ ------------------
router.get("/stats", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const topicCount = await ChuDe.countDocuments();
    res.json({ users: userCount, topics: topicCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;