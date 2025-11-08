// server/config/db.js
const mongoose = require('mongoose');
const dbname = "quizz"
const uri = process.env.MONGO_URI;


mongoose.connection.once("open", () => {
  console.log("✅ MongoDB connected to:", mongoose.connection.name);
});



const connectDB = async () => {

  try {
    await mongoose.connect(uri)  
    console.log(`✅ MongoDB Atlas connected: ${dbname}`);
  } catch (err) {
    console.error('❌ Lỗi kết nối MongoDB Atlas:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
