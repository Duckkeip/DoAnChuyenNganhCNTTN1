const express = require('express');
const router = express.Router();

// 🧱 Models
const Chude = require('../models/ChuDe');
const Cauhoi = require('../models/Cauhoi');
const Ketqua = require('../models/Ketqua');
const Quizzuser = require('../models/Quizzuser');


// ===================================================================
// ✅ LẤY DANH SÁCH CHỦ ĐỀ
// ===================================================================
router.get('/chude', async (req, res) => {
  try {
    const data = await Chude.find().populate('user_id', 'username');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ TẠO CHỦ ĐỀ MỚI
router.post('/chude', async (req, res) => {
  try {
    const newChude = new Chude(req.body);
    await newChude.save();
    res.json(newChude);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===================================================================
// ✅ CÂU HỎI (Cauhoi)
// ===================================================================

// ✅ Lấy danh sách câu hỏi theo chủ đề
router.get('/cauhoi/:id_chude', async (req, res) => {
  try {
    const data = await Cauhoi.find({ id_chude: req.params.id_chude });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Thêm câu hỏi vào chủ đề
router.post('/cauhoi', async (req, res) => {
  try {
    const newQuestion = new Cauhoi(req.body);
    await newQuestion.save();
    res.json(newQuestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===================================================================
// ✅ KẾT QUẢ (Ketqua)
// ===================================================================

// ✅ Lưu kết quả bài làm
router.post('/ketqua', async (req, res) => {
  try {
    const newResult = new Ketqua(req.body);
    await newResult.save();
    res.json(newResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Lấy kết quả theo người dùng hoặc theo chủ đề (tùy bạn mở rộng sau)
router.get('/ketqua', async (req, res) => {
  try {
    const data = await Ketqua.find()
      .populate('user_id', 'username')
      .populate('id_chude', 'tenchude');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===================================================================
// ✅ PHÒNG THI (Quizz Room)
// ===================================================================

// ✅ Tạo phòng mới
router.post('/room', async (req, res) => {
  try {
    const room = new Quizzuser(req.body);
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Lấy danh sách phòng
router.get('/room', async (req, res) => {
  try {
    const rooms = await Quizzuser.find().populate('id_host', 'username');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===================================================================
module.exports = router;
