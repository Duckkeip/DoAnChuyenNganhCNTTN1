const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const transporter = require('../utils/mailer');

// ----- Cấu hình chế độ dev/prod -----
const DEV_MODE = true; 
// true = dev, false = production, dev mode giúp không cần gửi email,
//  còn production thì có gửi email xác thực thì phải đổi trong file mailer.js

// ===== ĐĂNG KÝ =====
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, tenhienthi } = req.body;

    // Kiểm tra trùng email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: 'Email đã được sử dụng' });

    // Kiểm tra trùng username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: 'Username đã tồn tại' });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Tạo token xác thực
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Tạo user mới
    const user = new User({
      username,
      email,
      tenhienthi,
      password,
      passwordHash,
      verificationToken,
      verified: false
    });

    await user.save();

    const verifyLink = `http://localhost:5000/auth/verify/${verificationToken}`;

    if (DEV_MODE) {
      // Dev: không gửi mail, trả token trực tiếp
      console.log(`Dev mode: verification token for ${username}: ${verificationToken}`);
      return res.json({
        message: 'Đăng ký thành công (dev mode)!',
        verificationToken,
        verifyLink
      });
    }

    // Production: gửi mail
    await transporter.sendMail({
      from: '"Hệ thống Quiz" <doggygerman@gmail.com>',
      to: email,
      subject: 'Xác nhận đăng ký tài khoản',
      text: `Xin chào ${tenhienthi || username}, nhấn vào link để xác nhận: ${verifyLink}`
    });

    res.json({ message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.' });

  } catch (err) {
    console.error('💥 Lỗi đăng ký:', err);
    res.status(500).json({ message: 'Lỗi server khi đăng ký' });
  }
});

// ===== ĐĂNG NHẬP =====
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Sai email hoặc mật khẩu' });

    if (!user.verified) {
      return res.status(403).json({ message: 'Vui lòng xác nhận email trước khi đăng nhập.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ message: 'Sai email hoặc mật khẩu' });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || "MY_SECRET_KEY",
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        tenhienthi: user.tenhienthi,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('💥 Lỗi đăng nhập:', err);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập' });
  }
});

// ===== XÁC NHẬN EMAIL =====
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).send('Liên kết xác nhận không hợp lệ.');

    user.verified = true;
    user.verificationToken = null;
    await user.save();

    res.send('✅ Xác nhận tài khoản thành công! Bạn có thể đăng nhập.');
  } catch (err) {
    console.error('💥 Lỗi xác nhận email:', err);
    res.status(500).send('Lỗi xác nhận tài khoản.');
  }
});

module.exports = router;
