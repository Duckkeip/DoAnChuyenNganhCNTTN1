// convert_cauhoi.js
import fs from "fs";

const INPUT_FILE = "./quantriduan_chuong6.json";
const OUTPUT_FILE = "./cauhoi_ready.json";
const ID_CHUDE = "68f24d30148d553489322ae0";

const data = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));

const answerMap = ["A", "B", "C", "D"];

const output = data.map((item, index) => ({
  id_cauhoi: `QTDA006_Q${index + 1}`,
  id_chude: { $oid: ID_CHUDE },
  noidung: item.question,
  dapan_a: item.options[0] || "",
  dapan_b: item.options[1] || "",
  dapan_c: item.options[2] || "",
  dapan_d: item.options[3] || "",
  dapandung: answerMap[item.answer] || "A",
  mucdo: "easy",
  diem: 5
}));

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf8");

console.log(`✅ Đã tạo file ${OUTPUT_FILE} với ${output.length} câu hỏi.`);
