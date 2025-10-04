const mongoose = require('mongoose');

const chuDeSchema = new mongoose.Schema({
  // ten chu de
  tenchude: { type: String, required: true },
  // loại chủ đề (nếu có)
  loai: { type: String },
  // id user tạo
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // ngày tạo
  ngaytao: { type: Date, default: Date.now },
  // tình trạng
  tinhtrang: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

module.exports = mongoose.model('ChuDe', chuDeSchema);
