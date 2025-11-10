const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const transporter = require('../utils/mailer');
const path = require('path')
const getWifiIP = require('../config/getIP')
// ----- Cấu hình chế độ dev/prod -----
//const DEV_MODE = false; 
// true = dev: không gửi mail
// false = production: gửi mail xác thực tài khoản




// ===== ĐĂNG KÝ =====
router.post('/register', async (req, res) => {
  
  try {
   
    const { username, email, password, SDT } = req.body;
    const role = "user";
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
    const ip = getWifiIP();
    
    const verifyLink = `http://${ip}:5000/api/auth/verify/${verificationToken}`;
    // Tạo user object (chưa lưu)
    const user = new User({ 
      user_id: crypto.randomBytes(16).toString('hex'),
      username,
      SDT,
      email,
      password,
      passwordHash,
      role,
      verificationToken,
      verificationLink: verifyLink,
      verified: false
    });
    // Lưu user sau khi gửi mail thành công
    await user.save();
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
    if (user.tinhtrang === 'blocked') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa.' });
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
        avatar: user.avatar,
        role: user.role 
      }
    });
  } catch (err) {
    console.error('💥 Lỗi đăng nhập:', err);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
  }
});

// ===== XÁC NHẬN EMAIL =====
router.get('/verify/:token', async (req, res) => {
  console.log("👉 Nhận yêu cầu verify:", req.params.token);
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    console.log("✅ Tìm thấy user:", user ? user.email : "Không có");

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
//===============OTP quên nk ================

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Không tìm thấy email." });

    const otp = Math.floor(100000 + Math.random() * 900000);
    user.resetToken = otp;
    user.resetTokenExpireDate = Date.now() + 10 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from:`Hệ thống Quizz ${process.env.EMAIL_USER}`,
      to: email,
      subject: "Mã xác thực đặt lại mật khẩu",
       html: `
  <div style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding: 20px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
      
      <div style="background:#007bff; color:#fff; padding:15px 20px; text-align:center;">
        <h2>Hệ thống Quizz</h2>
      </div>
      
      <div style="padding:20px; color:#333;">
        <p>Xin chào,</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Dưới đây là mã xác thực (OTP) của bạn:</p>

        <div style="text-align:center; margin: 30px 0;">
          <span style="display:inline-block; background:#007bff; color:#fff; padding:15px 30px; border-radius:8px; font-size:24px; font-weight:bold; letter-spacing:3px;">
            ${otp}
          </span>
        </div>

        <p>Mã này có hiệu lực trong <b style="font-size:bold">10 phút</b> kể từ lúc được gửi đi. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>

        <p style="margin-top:30px;">Trân trọng,<br><b>Đội ngũ Hệ thống Quizz</b></p>
      </div>

      <div style="background:#f0f0f0; padding:10px 20px; text-align:center; font-size:12px; color:#777;">
        © ${new Date().getFullYear()} Hệ thống Quizz. Mọi quyền được bảo lưu.
      </div>
    </div>
  </div>
  `
});

    res.json({ message: "✅ Đã gửi mã xác thực đến email của bạn." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

//========Xác thực OTP===========
// Xác thực OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    if (!user.resetToken || !user.resetTokenExpireDate)
      return res.status(400).json({ message: "Không có yêu cầu đặt lại mật khẩu nào" });
    if (Date.now() > user.resetTokenExpireDate)
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });

    console.log("OTP client:", otp);
    console.log("OTP server:", user.resetToken);

    if (user.resetToken != otp)
      return res.status(400).json({ message: "Mã OTP sai" });

    user.resetToken = null;
    user.resetTokenExpireDate = null;
    await user.save();

    res.json({ message: "Xác thực thành công! Bạn có thể đặt lại mật khẩu mới." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

//===============Đặt lại mật khẩu mới ==============
router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng." });

    const hashed = await bcrypt.hash(password, 10);
    user.password = password;
    user.passwordHash= hashed;
    user.resetToken = undefined;
    user.resetTokenExpireDate = undefined;

    await user.save();

    res.json({ message: "✅ Đặt lại mật khẩu thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
