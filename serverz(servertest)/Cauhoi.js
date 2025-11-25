const mongoose = require("mongoose");

const CauhoiSchema = new mongoose.Schema({
  id_chude: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Chude", 
    required: true 
  },

  // Nội dung câu hỏi
  question: { 
    type: String, 
    required: true 
  },

  // Danh sách 4 đáp án
  answers: [
    {
      text: { type: String, required: true },   // nội dung đáp án
      correct: { type: Boolean, required: true } // đúng/sai
    }
  ],

  // Mức độ
  mucdo: { 
    type: String, 
    enum: ["easy", "average", "hard"], 
    default: "easy" 
  },

  // Điểm tùy theo mức độ
  diem: { 
    type: Number,
    default: function () {
      if (this.mucdo === "easy") return 5;
      if (this.mucdo === "average") return 7;
      return 10;
    }
  }
});

module.exports = mongoose.model("Cauhoi", CauhoiSchema, "cauhoi");
