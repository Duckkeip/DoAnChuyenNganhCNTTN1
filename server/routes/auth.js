const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const transporter = require('../utils/mailer');

// ----- Cấu hình chế độ dev/prod -----
const DEV_MODE = false; 
// true = dev: không gửi mail
// false = production: gửi mail xác thực tài khoản

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

    // Tạo token xác thực và link
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verifyLink = `http://localhost:5000/auth/verify/${verificationToken}`;

    // Tạo user object (chưa lưu)
    const user = new User({
      user_id: crypto.randomBytes(16).toString('hex'),
      username,
      email,
      password,
      passwordHash,
      verificationToken,
      verificationLink: "http://localhost:5000/auth/verify/" + verificationToken,
      verified: false
    });

    // Dev mode: không gửi mail, trả token về
    if (DEV_MODE) {
      console.log(`✅ Dev mode: token cho ${username}: ${verificationToken}`);
      await user.save();
      return res.json({
        message: 'Đăng ký thành công (DEV MODE)!',
        verificationToken,
        verifyLink
      });
    }

    // Production: gửi mail xác thực
    await transporter.sendMail({
      from: `"Hệ thống Quiz" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Xác nhận đăng ký tài khoản',
      text: `Xin chào ${tenhienthi || username}, nhấn vào link sau để xác nhận tài khoản của bạn: ${verifyLink}`
    });

    // Lưu user sau khi gửi mail thành công
    await user.save();

    res.json({ message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.' });

  } catch (err) {
    console.error('💥 Lỗi đăng ký:', err);
    res.status(500).json({ message: 'Lỗi server khi đăng ký. Vui lòng thử lại.' });
  }
});

// ===== ĐĂNG NHẬP =====
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({$or: [{ email: identifier }, { username: identifier }]});
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
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('💥 Lỗi đăng nhập:', err);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
  }
});

// ===== XÁC NHẬN EMAIL =====
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).send('❌ Liên kết xác nhận không hợp lệ.');

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
