// server/models/Chude.js
const mongoose = require("mongoose");

const chudeSchema = new mongoose.Schema({
  tenchude: { type: String, required: true },
  loaichude: { type: String, enum: ['ôn tập', 'thi thử', 'đố vui', 'thi đấu'], required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ngaytao: { type: Date, default: Date.now },
  tinhtrang: { type: String, default: 'active' }
});

// Virtual populate câu hỏi
chudeSchema.virtual("cauhoi", {
  ref: "Ketqua",
  localField: "_id",
  foreignField: "id_chude"
});

chudeSchema.set("toObject", { virtuals: true });
chudeSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Chude", chudeSchema);
