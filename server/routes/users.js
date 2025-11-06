const express = require("express");
const router = express.Router();
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
// ------------------ CẤU HÌNH MULTER CHO ẢNH ĐẠI DIỆN ------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/avatars");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.id}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// ------------------ LẤY THÔNG TIN NGƯỜI DÙNG ------------------
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("");
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ------------------ CẬP NHẬT THÔNG TIN ------------------
router.put("/:id", async (req, res) => {
  try {
    const { username, email, SDT, password,avatar } = req.body;

    // Lấy user hiện tại từ DB
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    // Cập nhật các trường
    if (username) user.username = username;
    if (email) user.email = email;
    if (SDT) user.SDT = SDT;
    if (avatar) user.avatar = avatar;

    // Nếu có password mới
    if (password) {
      user.password = password; // plain text
      user.passwordHash = await bcrypt.hash(password, 10); // hash
    }

    await user.save();

    res.json({ message: "Cập nhật thành công", user: { ...user._doc, password: undefined, passwordHash: undefined } });
  } catch (err) {
    console.error("Lỗi khi cập nhật user:", err);
    res.status(500).json({ message: "Cập nhật thất bại" });
  }
});

// ------------------ UPLOAD ẢNH ĐẠI DIỆN ------------------
router.post("/:id/", upload.single("avatar"), async (req, res) => {
  try {
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatar: avatarPath },
      { new: true }
    ).select("-password");
    res.json({ message: "Tải ảnh đại diện thành công", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ------------------ XOÁ TÀI KHOẢN ------------------
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xoá tài khoản." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
