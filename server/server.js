// server/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối DB
connectDB();

// Test server

//``````
app.use("/uploads", express.static("uploads"));//avatar

app.use("/api/user",require("./routes/users"))//User routes
app.use("/api/auth", require("./routes/auth")); // Auth routes
app.use("/api/topic",require("./routes/chude")); // Chude routes
// Test route
app.get("/", (req, res) => {
  res.send("Quiz API đang chạy...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server chạy trên cổng ${PORT}`));
// http://localhost:5000