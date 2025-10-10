const nodemailer = require("nodemailer");
// Tạo transporter sử dụng Gmail SMTP nên cần phải có user và pass (App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dienvaodaygmail@gmail.com",        // Gmail của bạn
    pass: "huyenthiendayapp"        // Ứng dụng tạo mật khẩu
  },
  tls: {
    rejectUnauthorized: false           // bỏ qua self-signed certificate
  }
});

module.exports = transporter;
