// server/config/db.js
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;
const connectDB = async () => {

  try {
  mongoose.connection.once("open", () => {
    console.log("✅ MongoDB connected to:", mongoose.connection.name);
  });
    await mongoose.connect(uri)  
  } catch (err) {
    console.error('❌ Lỗi kết nối MongoDB Atlas:', err.message);
    process.exit(1);
  }
};
module.exports = connectDB;
