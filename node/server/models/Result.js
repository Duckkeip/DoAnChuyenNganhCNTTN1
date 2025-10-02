// server/models/User.js
const mongoose = require('mongoose');

const ketQuaSchema = new mongoose.Schema({
  id_cauhoi: String,
  id_chude: String,
  noidung: String,
  dapan_a: String,
  dapan_b: String,
  dapan_c: String,
  dapan_d: String,
  dapandung: String,
  mucdo: { type: String, enum: ['easy', 'average', 'hard'] },
  feedback: String // người dùng gửi feedback nếu sai
});


module.exports = mongoose.model('Result', userSchema);
