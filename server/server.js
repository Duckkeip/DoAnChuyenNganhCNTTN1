// server/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const app = express();
app.use(cors());
app.use(express.json());

// Kết nối DB
connectDB();

// Middleware
app.use(express.static(path.join(__dirname, "utils")));
app.use("/uploads", express.static("uploads"));//avatar


//=============ROUTES====================

app.use("/api/user",require("./routes/users"))//User routes
app.use("/api/auth", require("./routes/auth")); // Auth routes
app.use("/api/topic",require("./routes/chude")); // Chude routes


// Test route
app.get("/", (req, res) => {
  res.send("Quiz API đang chạy...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0",() => 
{
  console.log(`✅ Server chạy trên cổng 0.0.0.0:${PORT}`)
});


  // http://localhost:5000