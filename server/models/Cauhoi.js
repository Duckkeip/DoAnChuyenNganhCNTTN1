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

module.exports = mongoose.model("Cauhoi", CauhoiSchema,"cauhoi");
