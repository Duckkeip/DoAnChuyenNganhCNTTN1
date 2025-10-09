const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChuDe', required: true },
  questions: [
    {
      content: { type: String, required: true },
      answers: [{ type: String, required: true }],
      correctAnswer: { type: Number, required: true } // 0,1,2,3
    }
  ],
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
