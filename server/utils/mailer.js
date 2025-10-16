const nodemailer = require("nodemailer");
// Tạo transporter sử dụng Gmail SMTP nên cần phải có user và pass (App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "doggygerman@gmail.com",
    pass:   "znjs wvpy iczr ebdj" 
  },
      
  tls: {
    rejectUnauthorized: false           // bỏ qua self-signed certificate
  }
  
});

module.exports = transporter;
