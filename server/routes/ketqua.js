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
module.exports = router;