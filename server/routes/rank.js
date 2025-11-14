//routes/chude.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose")
// Import models
const Xephang = require("../models/Xephang");

router.get("/xephang", async (req, res) => {
  try {
    const xephang = await Xephang.find()
      .populate("user_id", "username")
      .populate("id_chude", "ten_chude")
      .sort({ diem: -1 });
    res.json(xephang);
  } catch (error) {
    console.error("Lỗi lấy bảng xếp hạng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 📍 Lấy kết quả theo chủ đề (ví dụ cho 1 bảng xếp hạng riêng)
router.get("/:id_chude", async (req, res) => {
  try {
    const { id_chude } = req.params;
    const ketqua = await Ketqua.find({ id_chude })
      .populate("user_id", "username")
      .populate("id_chude", "ten_chude")
      .sort({ tong_diem: -1 }); // sắp xếp điểm giảm dần
    res.json(ketqua);
  } catch (error) {
    console.error("Lỗi khi lấy kết quả theo chủ đề:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});
// POST lưu kết quả quiz
router.post("/xephang", async (req, res) => {
  try {
    const { user_id, id_chude, diem, tongcauhoi, socaudung } = req.body;
    const xephang = new Xephang({ user_id, id_chude, diem, tongcauhoi, socaudung });
    await xephang.save();
    res.json({ message: "✅ Đã lưu kết quả" }); 
  } catch (err) {
    console.error("❌ Lỗi khi lưu xephang:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});


module.exports = router;
  
