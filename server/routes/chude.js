
const express = require("express");
const router = express.Router();

// Import models
const Chude = require("../models/ChuDe");
const Cauhoi = require("../models/Cauhoi");
const Ketqua = require("../models/Ketqua");
const Quizzuser = require("../models/Quizzuser");

// ----------------------------
// 🧩 CHỦ ĐỀ (CHUDE)
// ----------------------------
router.get("/chude", async (req, res) => {
  try {
    const data = await Chude.find().populate("user_id");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/chude", async (req, res) => {
  try {
    const newChude = new Chude(req.body);
    await newChude.save();
    res.json(newChude);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------
// 🧠 CÂU HỎI (CAUHOI)
// ----------------------------
router.get("/cauhoi/:id_chude", async (req, res) => {
  try {
    const data = await Cauhoi.find({ id_chude: req.params.id_chude });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/cauhoi", async (req, res) => {
  try {
    const newQuestion = new Cauhoi(req.body);
    await newQuestion.save();
    res.json(newQuestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------
// 🏁 PHÒNG THI (ROOM)
// ----------------------------
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

// ----------------------------
// 🧾 KẾT QUẢ (KETQUA)
// ----------------------------
router.post("/ketqua", async (req, res) => {
  try {
    const newKetqua = new Ketqua(req.body);
    await newKetqua.save();
    res.json(newKetqua);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

router.post("/chude", async (req, res) => {
  try {
    const newChude = new Chude(req.body);
    await newChude.save();
    res.json(newChude);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------
// 🧠 CÂU HỎI (CAUHOI)
// ----------------------------
router.get("/cauhoi/:id_chude", async (req, res) => {
  try {
    const data = await Cauhoi.find({ id_chude: req.params.id_chude });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/cauhoi", async (req, res) => {
  try {
    const newQuestion = new Cauhoi(req.body);
    await newQuestion.save();
    res.json(newQuestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------
// 🏁 PHÒNG THI (ROOM)
// ----------------------------
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

// ----------------------------
// 🧾 KẾT QUẢ (KETQUA)
// ----------------------------
router.post("/ketqua", async (req, res) => {
  try {
    const newKetqua = new Ketqua(req.body);
    await newKetqua.save();
    res.json(newKetqua);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
