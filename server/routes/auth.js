const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const transporter = require('../utils/mailer');
const path = require('path')

// ----- Cấu hình chế độ dev/prod -----
//const DEV_MODE = false; 
// true = dev: không gửi mail
// false = production: gửi mail xác thực tài khoản

// ===== ĐĂNG KÝ =====
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, SDT } = req.body;

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
    const verifyLink = `http://10.40.5.240:5000/auth/verify/${verificationToken}`;

    // Tạo user object (chưa lưu)
    const user = new User({
      user_id: crypto.randomBytes(16).toString('hex'),
      username,
      SDT,
      email,
      password,
      passwordHash,
      verificationToken,
      verificationLink: "http://localhost:5000/auth/verify/" + verificationToken,
      verified: false
    });

   
    
    
    // Production: gửi mail xác thực
    await transporter.sendMail({
      from: `"Hệ thống Quiz" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Xác nhận đăng ký tài khoản của bạn',
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f7f9fc; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <h2 style="text-align: center; color: #4e73df;">Chào mừng ${username}!</h2>
          <p style="font-size: 16px; color: #333;">
            Cảm ơn bạn đã đăng ký tài khoản tại <b>Hệ thống Quiz</b>.  
            Vui lòng xác nhận địa chỉ email của bạn bằng cách nhấn nút bên dưới:
          </p>
    
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" 
              style="background-color: #4e73df; color: white; padding: 12px 25px; 
                     text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
              Xác nhận tài khoản
            </a>
          </div>
    
          <p style="color: #666; font-size: 14px;">
            Nếu bạn không đăng ký tài khoản này, hãy bỏ qua email này.<br>
            Liên kết xác nhận chỉ có hiệu lực trong 24 giờ.
          </p>
    
          <hr style="margin: 20px 0;">
          <p style="font-size: 12px; text-align: center; color: #999;">
            © ${new Date().getFullYear()} Hệ thống Quiz. Mọi quyền được bảo lưu.
          </p>
        </div>
      </div>
      `
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
    if (!user) return res.sendFile(path.join(__dirname, '../utils/verifythatbai.html'));

    user.verified = true;
    user.verificationToken = null;
    await user.save();

    res.sendFile(path.join(__dirname, '../utils/verifythanhcong.html'));

  } catch (err) {
    console.error('💥 Lỗi xác nhận email:', err);
    res.status(500).send('Lỗi xác nhận tài khoản.');
  }
});

module.exports = router;
