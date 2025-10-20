import mongoose from "mongoose";
//phòng chơi

const QuizzUserSchema = new mongoose.Schema({
  id_room: { type: String, required: true },
  tenroom: { type: String, required: true },
  id_host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  id_chude: { type: mongoose.Schema.Types.ObjectId, ref: "Chude", required: true },
  status: { 
    type: String, 
    enum: ["dangcho", "dangchoi", "ketthuc"], 
    default: "dangcho" 
  },
  ngaytao: { type: Date, default: Date.now }
});

export default mongoose.model("QuizzUser", QuizzUserSchema,"quizzuser");
