require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const getWifiIP = require("./config/getIP");

const app = express();
const server = http.createServer(app);

// Lấy IP LAN hiện tại
const LAN_IP = getWifiIP() || 'localhost';
console.log('📡 LAN IP:', LAN_IP);  

// --- CORS ---
const allowedOrigins = [
  'http://localhost:3000',
  `http://${LAN_IP}:3000`
];

app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

app.use(express.json());

// Kết nối DB
connectDB();

// Middleware
app.use(express.static(path.join(__dirname, "utils")));
app.use("/uploads", express.static("uploads"));

//=============ROUTES====================
app.use("/api/user", require("./routes/users"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/topic", require("./routes/chude"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/rank", require("./routes/rank"));
app.use("/api/result", require("./routes/ketqua"));

// Test route
app.get("/", (req, res) => res.send("Quiz API đang chạy..."));

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: { origin: allowedOrigins }
});

  app.set("io", io);

  io.on("connection", (socket) => {
  console.log("⚡️ Client connected:", socket.id);


  // Join room theo PIN
  socket.on("joinRoom", (roomPin) => {
    socket.join(roomPin);
    console.log(`Socket ${socket.id} joined room ${roomPin}`);
  });
  // Update participants (client emit)
  socket.on("updateParticipants", ({ pin, participants }) => {
    io.to(pin).emit("updateParticipants", participants);
  });

  // Host bắt đầu chơi
  socket.on("startGame", (pin) => {
    console.log(`Game started in room ${pin}`);
    io.to(pin).emit("gameStarted"); // gửi event cho tất cả client
  });
  
  socket.on("disconnect", () => {
    console.log("⚡️ Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => 
  console.log(`✅ Server chạy trên cổng 0.0.0.0:${PORT}`)
);
