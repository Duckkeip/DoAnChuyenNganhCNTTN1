const mongoose =require ("mongoose");
//phòng chơi

const QuizzUserSchema = new mongoose.Schema({
  id_room: { type: String, required: true },
  tenroom: { type: String, required: true },
  id_host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  id_chude: { type: mongoose.Schema.Types.ObjectId, ref: "Chude", required: true },
  participants: [{ 
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        submitted: { type: Boolean, default: false } // 👈 Trường mới để theo dõi
    }],
  pin: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ["dangcho", "dangchoi", "ketthuc"], 
    default: "dangcho" 
  },
  ngaytao: { type: Date, default: Date.now }
});

// Hàm để tạo mã PIN ngẫu nhiên
function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 100000 - 999999
}

// Tạo mã PIN duy nhất trước khi lưu
QuizzUserSchema.pre("validate", async function (next) {
  if (!this.pin) {
    let newPin;
    let existing;
  do {
    newPin = generatePin();
    existing = await mongoose.models.QuizzUser.findOne({
      pin: newPin,
      status: { $ne: "ketthuc" }
    });
      } while (existing);
    this.pin = newPin;
  }
  next();
});

module.exports = mongoose.model("QuizzUser", QuizzUserSchema,"quizzuser");
