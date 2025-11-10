//routes/chude.js
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
// Xóa chủ đề và câu hỏi
router.delete("/chude/:id", async (req, res) => {
  try {
    //  xóa chủ đề
    const chude = await Chude.findByIdAndDelete(req.params.id);
    if (!chude)
      return res.status(404).json({ message: "Không tìm thấy chủ đề" });

    // xóa tất cả câu hỏi thuộc chủ đề này
    const result = await Cauhoi.deleteMany({ id_chude: req.params.id });
    //  trả về phản hồi
    res.json({
      message: "Đã xoá chủ đề và tất cả câu hỏi liên quan",
      deletedQuestions: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi xoá chủ đề",
      error: err.message,
    });
  }
});
//tạo câu hỏi
router.post("/cauhoi", async (req, res) => {
  try {
    console.log("req.body nhận được:", req.body);

    // Kiểm tra id_chude hợp lệ
    if (!mongoose.Types.ObjectId.isValid(req.body.id_chude)) {
      return res.status(400).json({ error: "id_chude không hợp lệ" });
    }
    const newQuestion = new Cauhoi(req.body);
    await newQuestion.save();
    res.json(newQuestion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// ===== CẬP NHẬT CÂU HỎI =====
router.put("/cauhoi/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      noidung,
      dapan_a,
      dapan_b,
      dapan_c,
      dapan_d,
      dapandung,
      mucdo,
    } = req.body;

    // Kiểm tra xem câu hỏi có tồn tại không
    const question = await Cauhoi.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Không tìm thấy câu hỏi." });
    }

    // Cập nhật nội dung
    question.noidung = noidung;
    question.dapan_a = dapan_a;
    question.dapan_b = dapan_b;
    question.dapan_c = dapan_c;
    question.dapan_d = dapan_d;
    question.dapandung = dapandung;
    question.mucdo = mucdo;

    await question.save();

    res.json({ message: "Cập nhật câu hỏi thành công!", question });
  } catch (err) {
    console.error("Lỗi khi cập nhật câu hỏi:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật câu hỏi." });
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
