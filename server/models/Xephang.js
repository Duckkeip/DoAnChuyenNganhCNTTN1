import mongoose from "mongoose";

const XephangSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  diem: { type: Number, required: true },
  ngaychoi: { type: Date, default: Date.now },
  id_chude: { type: mongoose.Schema.Types.ObjectId, ref: "Chude", required: true }
});

export default mongoose.model("Xephang", XephangSchema,"xephang");
  