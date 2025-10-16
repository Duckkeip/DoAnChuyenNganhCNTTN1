const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  passwordHash: { type: String, required: true },// Mật khẩu đã được hash
  email: { type: String, required: true, unique: true },
  tenhienthi: { type: String },
  avatar: { type: String, default: '' },
  ngaytaotk: { type: Date, default: Date.now },
  verificationLink: { type: String } , // link xac thuc email
  tinhtrang: { 
    type: String, 
    enum: ['active', 'blocked'], 
    default: 'active' 
  },

  verified: { type: Boolean, default: false },         // gui email xac thuc
  verificationToken: { type: String } 
});

module.exports = mongoose.model('User', userSchema);
