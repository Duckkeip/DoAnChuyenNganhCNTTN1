const mongoose = require('mongoose');

const XephangSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  id_chude: { type: mongoose.Schema.Types.ObjectId, ref: "Chude", required: true },
  diem: { type: Number, required: true },
  tongcauhoi: { type: Number, required: true },
  socaudung: { type: Number, required: true },
  ngaychoi: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Xephang", XephangSchema,"xephang");
  