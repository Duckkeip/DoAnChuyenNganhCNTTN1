// server/models/CauHoiMacDinh.js
const mongoose = require('mongoose');
const cauHoiMacDinhSchema = new mongoose.Schema({
    id_cauhoi: String,
    id_chude: String,
    noidung: String,
    dapan_a: String,
    dapan_b: String,
    dapan_c: String,
    dapan_d: String,
    dapandung: String,
    mucdo: { type: String, enum: ['easy', 'average', 'hard'] }
  });
module.exports = mongoose.model('CauHoiMacDinh', cauHoiSchema);
