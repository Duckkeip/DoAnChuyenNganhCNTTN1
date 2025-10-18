# Database hiện tại gồm 6 collections

<img width="138" height="170" alt="image" src="https://github.com/user-attachments/assets/4130105c-06a9-4192-b850-21918f804b8b" />


- **cauhoi**
- **chude**
- **ketqua**
- **quizzuser**
- **users**
- **xephang**

---
##  Model `cauhoi` trong backend

```js
const CauhoiSchema = new mongoose.Schema({
  id_cauhoi: { type: String, required: true },
  id_chude: { type: mongoose.Schema.Types.ObjectId, ref: "Chude", required: true },
  noidung: { type: String, required: true },
  dapan_a: { type: String, required: true },
  dapan_b: { type: String, required: true },
  dapan_c: { type: String, required: true },
  dapan_d: { type: String, required: true },
  dapandung: { type: String, enum: ["A", "B", "C", "D"], required: true },
  mucdo: { type: String, enum: ["easy", "average", "hard"], default: "easy" },
  diem: {
    type: Number,
    default: function () {
      if (this.mucdo === "easy") return 5;
      if (this.mucdo === "average") return 7;
      return 10;
    }
  }
});
export default mongoose.model("Cauhoi", CauhoiSchema,"cauhoi");

```
---

##  Model `chude` trong backend

```js
const chudeSchema = new mongoose.Schema({
  idchude: { type: String, required: true, unique: true },
  tenchude: { type: String, required: true },
  loaichude: { 
    type: String, 
    enum: ['ôn tập', 'thi thử', 'đố vui', 'thi đấu'], 
    required: true 
  },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ngaytao: { type: Date, default: Date.now },
  tinhtrang: { type: String, default: 'active' }
});

// Virtual populate đến các câu hỏi trong chủ đề
chudeSchema.virtual("cauhoi", {
  ref: "Cauhoi", // ← đổi từ "Ketqua" thành "Cauhoi"
  localField: "_id",
  foreignField: "id_chude"
});

chudeSchema.set("toObject", { virtuals: true });
chudeSchema.set("toJSON", { virtuals: true }); 

module.exports = mongoose.model("Chude", chudeSchema,"chude");

```

##  Model `ketqua` trong backend

```js
const KetquaSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  id_ketqua: { type: String, required: true, unique: true },
  id_chude: { type: mongoose.Schema.Types.ObjectId, ref: "Chude", required: true },
  tong_cau: { type: Number, required: true },
  cau_dung: { type: Number, required: true },
  cau_sai: { type: Number, required: true },
  tong_diem: { type: Number, required: true },
  dapAnDaChon: [
    {
      id_cauhoi: { type: mongoose.Schema.Types.ObjectId, ref: "Cauhoi", required: true },
      dapan_chon: { type: String, enum: ["A", "B", "C", "D"], required: true },
      dung: { type: Boolean, required: true }
    }
  ],
  thoigian_lam: { type: String },
  ngay_lam: { type: Date, default: Date.now }
});

export default mongoose.model("Ketqua", KetquaSchema);

```
##  Model `quizzuser` trong backend

```js
const QuizzUserSchema = new mongoose.Schema({
  id_room: { type: String, required: true, unique: true },
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

export default mongoose.model("QuizzUser", QuizzUserSchema);

```

##  Model `users` trong backend

```js
const userSchema = new mongoose.Schema({
  user_id: { type: String},
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  passwordHash: { type: String, required: true },// Mật khẩu đã được hash
  email: { type: String, required: true, unique: true },
  avatar: { type: String, default: '' },
  ngaytaotk: { type: Date, default: Date.now },
  verificationLink: { type: String } , // link xac thuc email
  tinhtrang: { 
    type: String, 
    enum: ['active', 'blocked'], 
    default: 'active' 
  },

  verified: { type: Boolean, default: false },         // gui email xac thuc
  verificationToken: { type: String } 
});

module.exports = mongoose.model('User', userSchema);

```
##  Model `xephang` trong backend

```js
const XephangSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  diem: { type: Number, required: true },
  ngaychoi: { type: Date, default: Date.now },
  id_chude: { type: mongoose.Schema.Types.ObjectId, ref: "Chude", required: true }
});

export default mongoose.model("Xephang", XephangSchema);


```































































