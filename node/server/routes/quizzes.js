const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const auth = require('../middleware/auth');

// Lấy danh sách quiz
router.get('/', async (req,res)=>{
  const quizzes = await Quiz.find({approved:true});
  res.json(quizzes);
});

// Tạo quiz mới (user)
router.post('/', auth(), async (req,res)=>{
  const {title, description, categoryId, questions} = req.body;
  const newQuiz = new Quiz({
    ownerId: req.user.id,
    title, description, categoryId, questions
  });
  await newQuiz.save();
  res.json({message:'Quiz tạo thành công', quiz:newQuiz});
});

module.exports = router;
