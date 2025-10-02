// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: String, // nếu muốn tự sinh UUID có thể dùng plugin, nếu không mongoose._id cũng được
  username: { type: String, required: true },
  passwordHash: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  tenhienthi: String,
  avatar: String,
  ngaytaotk: { type: Date, default: Date.now },
  tinhtrang: { type: String, default: 'active' } // active / blocked
});

module.exports = mongoose.model('User', userSchema);
