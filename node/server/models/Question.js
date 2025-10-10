// server/models/XepHang.js
const mongoose = require('mongoose');

const xepHangSchema = new mongoose.Schema({
  user_id: String,
  diem: Number,
  id_chude: String,
  ngaychoi: { type: Date, default: Date.now }
});

module.exports = mongoose.model('XepHang', xepHangSchema);
// server/models/Question.js