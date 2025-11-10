  // server/server.js
  require("dotenv").config();
  const express = require("express");
  const cors = require("cors");
  const connectDB = require("./config/db");
  const path = require("path");
  const app = express();
  const getWifiIP = require("./config/getIP");
    // Lấy IP LAN hiện tại
  const LAN_IP = getWifiIP() || 'localhost';
  console.log('📡 LAN IP:', LAN_IP);

  //nếu điện thoại không xác thực đc thì có lẽ là do băng tần 
  //laptop 2.4hz và điện thoại 5.0hz thì khó thưc hiện đc 
  //trừ khi laptop vào control panel -> window defender firewall 
  //->cột trái ->Turn Window Defender Firewall turn or off ->rồi tắt tạm thơi private 
  //thì vào đc 


  // --- CORS ---
const allowedOrigins = [
  'http://localhost:3000',
  `http://${LAN_IP}:3000`
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // Postman hoặc direct request
    if(allowedOrigins.indexOf(origin) !== -1){
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));
  app.use(express.json());

  // Kết nối DB
  connectDB();

  // Middleware
  app.use(express.static(path.join(__dirname, "utils")));
  app.use("/uploads", express.static("uploads"));//avatar


  //=============ROUTES====================

  app.use("/api/user",require("./routes/users"))//User routes
  app.use("/api/auth", require("./routes/auth")); // Auth routes
  app.use("/api/topic",require("./routes/chude")); // Chude routes (chỉ lấy chủ đề , tất cả hoặc cụ thể chủ đề )
  app.use("/api/topic/question",require("./routes/chude")); // Cauhoi routes(lấy tất cả hoặc cụ thể câu hỏi)
  app.use("/api/admin",require("./routes/admin")); // Admin
  

  // Test route
  app.get("/", (req, res) => {
    res.send("Quiz API đang chạy...");
  });


  const PORT = process.env.PORT ;
  app.listen(PORT, "0.0.0.0",() => 
  {
    console.log(`✅ Server chạy trên cổng 0.0.0.0:${PORT}`)
  });


    