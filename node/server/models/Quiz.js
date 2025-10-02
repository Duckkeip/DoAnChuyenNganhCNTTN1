const mongoose = require('mongoose');
//reference User, Category lien ket toi cac bang khac
const quizSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  questions: [
    {
      content: String,
      answers: [String],
      correctAnswer: Number
    }
  ],
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
