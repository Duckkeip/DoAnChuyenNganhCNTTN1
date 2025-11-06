// server/config/db.js
const mongoose = require('mongoose');
const dbname = "quizz"
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/quizz");
    console.log(`✅ MongoDB  connected name ${dbname}`);
  } catch (err) {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
