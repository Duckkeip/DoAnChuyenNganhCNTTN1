# Database hiện tại gồm 6 collections

![Database collections](./images/database.png)

- **cauhoi**
- **chude**
- **ketqua**
- **quizzuser**
- **users**
- **xephang**

---
## 🧠 Model `cauhoi` trong backend

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
