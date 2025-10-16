const express = require('express');
const router = express.Router();
const Chude = require('../models/ChuDe');//main
const Ketqua = require('../models/ketqua');//main
const Quizzuser = require('../models/Quizzuser');

// ✅ Lấy danh sách chủ đề
router.get('/chude', async (req, res) => {
  try {
    const data = await Chude.find().populate('user_id', 'username');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Tạo chủ đề mới
router.post('/chude', async (req, res) => {
  try {
    const newChude = new Chude(req.body);
    await newChude.save();
    res.json(newChude);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Thêm câu hỏi vào chủ đề
router.post('/ketqua', async (req, res) => {
  try {
    const newQ = new Ketqua(req.body);
    await newQ.save();
    res.json(newQ);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Lấy câu hỏi theo chủ đề
router.get('/ketqua/:id_chude', async (req, res) => {
  try {
    const data = await Ketqua.find({ id_chude: req.params.id_chude });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Tạo phòng thi (quizz room)
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

module.exports = router;
