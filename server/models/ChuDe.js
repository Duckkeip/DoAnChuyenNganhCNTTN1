const mongoose = require("mongoose");

const chudeSchema = new mongoose.Schema({
  idchude: { type: String, required: true, unique: true },
  tenchude: { type: String, required: true },
  loaichude: { 
    type: String, 
    enum: ['ôn tập', 'thi thử', 'đố vui', 'thi đấu'], 
    required: true 
  },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ngaytao: { type: Date, default: Date.now },
  tinhtrang: { type: String, default: 'active' }
});

// Virtual populate đến các câu hỏi trong chủ đề
chudeSchema.virtual("cauhoi", {
  ref: "Cauhoi", // ← đổi từ "Ketqua" thành "Cauhoi"
  localField: "_id",
  foreignField: "id_chude"
});

chudeSchema.set("toObject", { virtuals: true });
chudeSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Chude", chudeSchema,"chude");
