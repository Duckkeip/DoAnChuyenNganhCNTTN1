// server/models/ChuDe.js
const mongoose = require('mongoose');

const chuDeSchema = new mongoose.Schema({
  id_chude: String,
  tenchude: { type: String, required: true },
  loai: String,
  user_id: String, // id user tạo
  ngaytao: { type: Date, default: Date.now },
  tinhtrang: { type: String, default: 'active' }
});

module.exports = mongoose.model('ChuDe', chuDeSchema);
