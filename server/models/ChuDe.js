// server/models/Chude.js
const mongoose = require('mongoose');

const chudeSchema = new mongoose.Schema({
  id_chude: String,
  tenchude: { type: String, required: true },
  loaichude: { 
    type: String, 
    enum: ['ôn tập', 'thi thử', 'đố vui', 'thi đấu'],
    required: true
  },
  user_id: { 
    type: mongoose.Schema.Types.ObjectId,  // 👈 Quan trọng: dùng ObjectId
    ref: 'User'                             // 👈 ref đến model User
  },
  ngaytao: { type: Date, default: Date.now },
  tinhtrang: { type: String, default: 'active' }
});

module.exports = mongoose.model('Chude', chudeSchema);
