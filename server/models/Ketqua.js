const mongoose =require ("mongoose");

const KetquaSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  id_chude: { type: mongoose.Schema.Types.ObjectId, ref: "Chude", required: true },
  tong_cau: { type: Number, required: true },
  cau_dung: { type: Number, required: true },
  cau_sai: { type: Number, required: true },
  tong_diem: { type: Number, required: true },
  dapAnDaChon: [
    { 
      id_cauhoi: { type: mongoose.Schema.Types.ObjectId, ref: "Cauhoi", required: true },
      noidung: { type: String, required: true },
      dapan_chon: { type: String, enum: ["A", "B", "C", "D"], required: null },
      dung: { type: Boolean, required: true }
    }
  ],
  thoigian_lam: { type: String },
  ngay_lam: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Ketqua", KetquaSchema,"ketqua");
