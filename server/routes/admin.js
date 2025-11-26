const express = require("express");
const router = express.Router();
const mongoose = require("mongoose")
const User = require("../models/User");
const ChuDe = require("../models/ChuDe"); // model chủ đề
// Tải module Cauhoi để có thể truy cập model
const { Cauhoi } = require("../models/Cauhoi") 
const { verifyToken, isAdmin } = require("../middleware/auth");

// ------------------ LẤY TOÀN BỘ NGƯỜI DÙNG ------------------
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password -passwordHash"); // loại bỏ password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ------------------ THỐNG KÊ NGƯỜI DÙNG & CHỦ ĐỀ ------------------
router.get("/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const topicCount = await ChuDe.countDocuments();
    res.json({ users: userCount, topics: topicCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🆕 ------------------ LẤY CÂU HỎI THEO CHỦ ĐỀ (DỮ LIỆU THÔ CHO ADMIN) ------------------
router.get("/questions/:topicId", verifyToken, isAdmin, async (req, res) => {
    try {
        const topicId = req.params.topicId;
        // Lấy dữ liệu câu hỏi thô từ DB, không qua hàm shuffleOptions
        const questions = await Cauhoi.find({ id_chude: topicId });
        res.json(questions);
    } catch (err) {
        console.error("Lỗi khi lấy câu hỏi cho Admin:", err);
        res.status(500).json({ message: "Lỗi khi lấy câu hỏi" });
    }
});


// CẬP NHẬT TRẠNG THÁI NGƯỜI DÙNG
router.put("/users/:id/status", verifyToken, isAdmin, async (req, res) => {
// ... (giữ nguyên)
  const { id } = req.params;
  const { tinhtrang, verified } = req.body; // active/blocked, true/false
  console.log(id, tinhtrang, verified)
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { 
        ...(tinhtrang !== undefined && { tinhtrang }), 
        ...(verified !== undefined && { verified })
      },
      { new: true }
    );
    res.json({ message: "Cập nhật thành công", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 🆕 ------------------ XÓA CÂU HỎI THEO ID ------------------
router.delete("/questions/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const questionId = req.params.id;
        
        // Dùng findByIdAndDelete để xóa câu hỏi
        const result = await Cauhoi.findByIdAndDelete(questionId);
        
        if (!result) {
            return res.status(404).json({ message: "Không tìm thấy câu hỏi" });
        }

        res.json({ message: "Xóa câu hỏi thành công" });
    } catch (err) {
        console.error("Lỗi khi xóa câu hỏi:", err);
        res.status(500).json({ message: "Lỗi server khi xóa câu hỏi" });
    }
});
  // ------- XÓA NGƯỜI DÙNG VÀ TẤT CẢ DỮ LIỆU LIÊN QUAN -----------
  router.delete("/users/:id", verifyToken, isAdmin, async (req, res) => {
// ... (giữ nguyên)
    const session = await mongoose.startSession(); // dùng transaction
    session.startTransaction();
    try {
      const userId = req.params.id;

      // Lấy tất cả chủ đề của user
      const topics = await ChuDe.find({ user_id: userId }).session(session);
      const topicIds = topics.map(topic => topic._id);
      console.log("Cauhoi:", Cauhoi);
      // Xóa tất cả câu hỏi liên quan
      await Cauhoi.deleteMany({ id_chude: { $in: topicIds } }).session(session);

      // Xóa tất cả chủ đề của user
      await ChuDe.deleteMany({ user_id: userId }).session(session);

      // Xóa user
      await User.findByIdAndDelete(userId).session(session);

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Trả về thống kê mới
      const userCount = await User.countDocuments();
      const topicCount = await ChuDe.countDocuments();
      const questionCount = await Cauhoi.countDocuments();

      res.json({ 
        message: "Xóa thành công user, chủ đề và câu hỏi liên quan",
        users: userCount,
        topics: topicCount,
        questions: questionCount
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  });

module.exports = router;