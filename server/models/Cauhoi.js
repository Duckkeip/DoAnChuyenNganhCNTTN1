const mongoose = require('mongoose')

const CauhoiSchema = new mongoose.Schema({
  id_chude: { type: mongoose.Schema.Types.ObjectId, ref: "Chude", required: true },
  noidung: { type: String, required: true },
  dapan_a: { type: String, required: true },
  dapan_b: { type: String, required: true },
  dapan_c: { type: String, required: true },
  dapan_d: { type: String, required: true },
  dapandung: { type: String, enum: ["A", "B", "C", "D"], required: true },
  mucdo: { type: String, enum: ["easy", "average", "hard"], default: "easy" },
  diem: { 
    type: Number,
    default: function () {
      if (this.mucdo === "easy") return 5;
      if (this.mucdo === "average") return 7;
      return 10;
    }
  }
});

function shuffleOptions(q) {
  const options = [
    { key: "A", text: q.dapan_a },
    { key: "B", text: q.dapan_b },
    { key: "C", text: q.dapan_c },
    { key: "D", text: q.dapan_d }
  ];

  // ✅ xác định đáp án đúng ban đầu theo index
  const correctIndexOriginal = ["A", "B", "C", "D"].indexOf(q.dapandung);

  // ✅ tạo mảng kèm theo index gốc
  const optionsWithIndex = options.map((opt, idx) => ({
    ...opt,
    originalIndex: idx
  }));

  // ✅ random vị trí
  const shuffled = optionsWithIndex.sort(() => Math.random() - 0.5);

  // ✅ tìm xem đáp án đúng sau random nằm ở đâu
  const correctIndexAfterShuffle = shuffled.findIndex(
    (opt) => opt.originalIndex === correctIndexOriginal
  );

  // ✅ trả về câu hỏi đã random và đúng chuẩn
  return {
    _id: q._id,
    noidung: q.noidung,
    options: shuffled.map(o => ({ text: o.text })), // ✅ bỏ key A/B/C/D
    correct: correctIndexAfterShuffle,              // ✅ lưu index đáp án đúng (0–3)
    mucdo: q.mucdo,
    diem: q.diem
  };
}

const model = mongoose.model("Cauhoi", CauhoiSchema, "cauhoi");

module.exports = {
  Cauhoi: model,
  shuffleOptions
};