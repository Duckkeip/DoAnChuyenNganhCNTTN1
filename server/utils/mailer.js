const nodemailer = require("nodemailer");
// Tạo transporter sử dụng Gmail SMTP nên cần phải có user và pass (App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user:process.env.EMAIL_USER ,
    pass: process.env.EMAIL_PASS , 
  },
      
  tls: {
    rejectUnauthorized: false           // bỏ qua self-signed certificate
  }
  
});

module.exports = transporter;
