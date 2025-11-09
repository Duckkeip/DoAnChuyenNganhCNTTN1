const express = require("express");
const router = express.Router();
const mongoose = require("mongoose")
// Import models
const Chude = require("../models/ChuDe");
const Cauhoi = require("../models/Cauhoi");
const Ketqua = require("../models/Ketqua");
const Quizzuser = require("../models/Quizzuser");

// 🧩 CHỦ ĐỀ lấy tất cả của tất cả user có tạo chủ đề trang home chung 
router.get("/chude", async (req, res) => {
  try {
    const data = await Chude.find({}).populate('user_id')
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Lấy tất cả chủ đề của 1 user
router.get("/chude/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const data = await Chude.find({ user_id: user_id }).populate("user_id");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧠 lấy CÂU HỎI tất cả 
router.get("/cauhoi", async (req, res) => {
  try {
    const data = await Cauhoi.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 🧠 lấy CÂU HỎI của 1 chủ đề 
router.get("/cauhoi/:id_chude", async (req, res) => {
  try {
    const { id_chude } = req.params;
    const data = await Cauhoi.find({ id_chude: id_chude });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//tạo chủ đề 
router.post("/chude", async (req, res) => {
  try {
    console.log("Body nhận từ client:", req.body); // debug
    const { tenchude, loaichude, user_id } = req.body;

    if (!tenchude || !loaichude) {
      return res.status(400).json({ error: "tenchude và loaichude là bắt buộc" });
    }

    if (!["ôn tập", "thi đấu"].includes(loaichude)) {
      return res.status(400).json({ error: "loaichude không hợp lệ" });
    }

    const newChude = new Chude({ tenchude, loaichude, user_id });
    await newChude.save();
    res.json(newChude);
  } catch (err) {
    console.error("Lỗi tạo chủ đề:", err);
    res.status(500).json({ error: err.message });
  }
});
//tạo câu hỏi
router.post("/cauhoi", async (req, res) => {
  try {
    const newQuestion = new Cauhoi(req.body);
    await newQuestion.save();
    res.json(newQuestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🏁 Tạo PHÒNG THI
router.post("/room", async (req, res) => {
  try {
    const room = new Quizzuser(req.body);
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/room", async (req, res) => {
  try {
    const rooms = await Quizzuser.find().populate("id_host", "username");
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧾 gửi KẾT QUẢ
router.post("/ketqua", async (req, res) => {
  try {
    const newKetqua = new Ketqua(req.body);
    await newKetqua.save();
    res.json(newKetqua);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//xem kết quả 
router.get("/ketqua", async (req, res) => {
  try {
    const data = await Ketqua.find()
      .populate("user_id", "username")
      .populate("id_chude", "tenchude");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
