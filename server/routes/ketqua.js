///routes/ketqua
const Chude = require("../models/ChuDe");
const Cauhoi = require("../models/Cauhoi");
const User = require("../models/User");
const Ketqua = require("../models/Ketqua");
const express = require("express");
const router = express.Router();
// POST /ketqua
router.post("/ketqua", async (req, res) => {
  try { 
    console.log("📤 Payload ketqua nhận được:", req.body);
    const newResult = new Ketqua(req.body);
    await newResult.save();
    res.json({ success: true, message: "Đã lưu ketqua" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});


// GET /history/:userId
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Lấy tất cả ketqua của user, sort theo ngày làm mới nhất
    const results = await Ketqua.find({ user_id: userId })
      .populate("id_chude", "tenchude") // lấy tên chủ đề
      .sort({ ngay_lam: -1 });
    
    res.json({ success: true, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});
module.exports = router;