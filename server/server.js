// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối DB
connectDB();

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/auth', require('./routes/auth'));

app.use('/quizzes', require('./routes/quizzes'));

// Test route
app.get('/', (req, res) => {
  res.send('Quiz API đang chạy...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server chạy trên cổng ${PORT}`));
