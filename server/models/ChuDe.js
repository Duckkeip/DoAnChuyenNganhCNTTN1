const mongoose = require("mongoose");

const chudeSchema = new mongoose.Schema({
  tenchude: { type: String, required: true },
  loaichude: { 
    type: String, 
    enum: ['ôn tập','thi đấu'], 
    required: true 
  },
  user_id: { type: String , ref: "User", default: null},
  ngaytao: { type: Date, default: Date.now },
  tinhtrang: { type: String, default: 'active' },
  nganh: {
  type: String,
  enum: [
    'Kinh doanh quốc tế',
    'Quản trị kinh doanh',
    'Quản trị kinh doanh – VLVH',
    'Công nghệ thông tin',
    'Quản trị dịch vụ du lịch và lữ hành',
    'Quản trị nhân lực',
    'Quản lý hoạt động bay',
    'Quản lý hoạt động bay – VLVH',
    'Kinh tế vận tải',
    'Kỹ thuật hàng không',
    'Công nghệ kỹ thuật điều khiển và tự động hóa',
    'Công nghệ kỹ thuật điện tử – viễn thông',
    'Công nghệ kỹ thuật công trình xây dựng',
    'Ngôn ngữ Anh'
  ],
   default: null
},

});

// Virtual populate đến các câu hỏi trong chủ đề
chudeSchema.virtual("cauhoi", {
  ref: "Cauhoi", // Cauhoi
  localField: "_id",
  foreignField: "id_chude"
});

chudeSchema.set("toObject", { virtuals: true });
chudeSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Chude", chudeSchema,"chude");
