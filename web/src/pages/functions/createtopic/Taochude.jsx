import React, { useEffect, useState ,useCallback} from "react";
import { useNavigate } from "react-router-dom";
import api from "../../token/check";
import jwt_decode from "jwt-decode";
import "./Taochude.css"
function CreateTopic() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tenChude, setTenChude] = useState("");
  const [loaiChude, setLoaiChude] = useState("");
  const [nganh, setNganh] = useState("");// ngành học
  const [cauHoi, setCauHoi] = useState([ {
    
    noidung: "",
     dapan_a: "",
     dapan_b: "",
     dapan_c: "",
     dapan_d: "",
     dapandung: "A",
     mucdo: "easy" },]); // Mảng câu hỏi



  // ✅ Kiểm tra token (dùng useCallback để không tạo lại mỗi render)
  const Checktoken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Không có token trong localStorage");
      setUser(null);
      return;
    }

    try {
      const decoded = jwt_decode(token);
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        console.log("Token hết hạn, đăng xuất...");
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
      } else {
        console.log("Token hợp lệ():", decoded);
        setUser(decoded);
      }
    } catch (err) {
      console.log("Lỗi decode token:", err);
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [navigate]);

  
  // Thêm câu hỏi mới
  const handleAddQuestion = () => {
    setCauHoi([
      ...cauHoi,
      { noidung: "",
         dapan_a: "",
          dapan_b: "",
           dapan_c: "", 
           dapan_d: "",
            dapandung: "",
             mucdo: "",
             diem: "" 
            }
    ]);
  };
  // Xóa câu hỏi
  const handleRemoveQuestion = (index) => {
    const newCauHoi = [...cauHoi];
    newCauHoi.splice(index, 1);
    setCauHoi(newCauHoi);
  };

   // Thay đổi nội dung câu hỏi hoặc đáp án
  const handleChangeQuestion = (index, field, value) => {
    const newCauHoi = [...cauHoi];
    newCauHoi[index][field] = value;
    setCauHoi(newCauHoi);
  };
  const handleRemoveAllQuestions = () => {
    if (window.confirm("Bạn có chắc muốn xóa tất cả câu hỏi không?")) {
      setCauHoi([]);
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập!");
      navigate("/login");
      return;
    }

    try {
        console.log("handleSubmit chạy"); 
      // Tạo chủ đề
      const chudeRes = await api.post("/topic/chude", {
        tenchude: tenChude,
        loaichude: loaiChude,
        nganh: nganh, 
        user_id: user.id
      });
      const newChude = chudeRes.data;

      // Tạo câu hỏi cho chủ đề
      for (let q of cauHoi) {
        if (q.noidung.trim() !== "") {
          await api.post("/topic/cauhoi", {
            id_chude: newChude._id,
            noidung: q.noidung,
            dapan_a: q.dapan_a,
            dapan_b: q.dapan_b,
            dapan_c: q.dapan_c,
            dapan_d: q.dapan_d,
            dapandung: q.dapandung,
            mucdo: q.mucdo,
            diem : q.diem
          });
        }
      }

      alert("Tạo chủ đề và câu hỏi thành công!");
      navigate(`/homeuser/${user._id}`); // Quay lại trang Home
    } catch (err) {
      console.error("Lỗi tạo chủ đề/câu hỏi:", err);
      alert("Không thể tạo chủ đề/câu hỏi!");
    }
  };


  // ✅ useEffect chỉ chạy 1 lần
  useEffect(() => {
    Checktoken();
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [Checktoken]); // ✅ thêm dependency hợp lệ

  return (
    <div className="create-topic-container">
      <h2>Tạo chủ đề và câu hỏi mới</h2>

      <div className="topic-info">
        <label>Tên chủ đề:</label>
        <input value={tenChude} onChange={(e) => setTenChude(e.target.value)} />

        <label>Loại chủ đề:</label>
            <select  value={loaiChude} onChange={e => setLoaiChude(e.target.value)}>
                <option value=""></option>
                <option value="ôn tập">Ôn tập</option>
                <option value="thi đấu">Thi đấu</option>
            </select>
        <label>Ngành:</label>
            <select value={nganh} onChange={(e) => setNganh(e.target.value)}>
                <option value="">--Chọn ngành--</option>
                <option value="Kinh doanh quốc tế">Kinh doanh quốc tế</option>
                <option value="Quản trị kinh doanh">Quản trị  kinh doanh</option>
                <option value="Quản trị kinh doanh – VLVH">Quản trị kinh doanh – VLVH</option>
                <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                <option value="Quản trị dịch vụ du lịch và lữ hành">Quản trị dịch vụ du lịch và lữ hành</option>
                <option value="Quản trị nhân lực">Quản trị nhân lực</option>
                <option value="Quản lý hoạt động bay">Quản lý hoạt động bay</option>
                <option value="Quản lý hoạt động bay – VLVH">Quản lý hoạt động bay – VLVH</option>
                <option value="Kinh tế vận tải">Kinh tế vận tải</option>
                <option value="Kỹ thuật hàng không">Kỹ thuật hàng không</option>
                <option value="Công nghệ kỹ thuật điều khiển và tự động hóa">Công nghệ kỹ thuật điều khiển và tự động hóa</option>
                <option value="Công nghệ kỹ thuật điện tử – viễn thông">Công nghệ kỹ thuật điện tử – viễn thông</option>
                <option value="Công nghệ kỹ thuật công trình xây dựng">Công nghệ kỹ thuật công trình xây dựng</option>
                <option value="Ngôn ngữ Anh">Ngôn ngữ Anh</option>
            </select>
      </div>

      <h3>Câu hỏi</h3>
      <div className="questions-grid">
      {cauHoi.map((q, index) => (
        <div className="question-card" key={index}>
          <label>Câu hỏi {index + 1}:</label>
          <input
            placeholder="Nội dung câu hỏi"
            value={q.noidung}
            onChange={(e) => handleChangeQuestion(index, "noidung", e.target.value)}
          />

          <div className="answers">
            <input
              placeholder="Đáp án A"
              value={q.dapan_a}
              onChange={(e) => handleChangeQuestion(index, "dapan_a", e.target.value)}
            />
            <input
              placeholder="Đáp án B"
              value={q.dapan_b}
              onChange={(e) => handleChangeQuestion(index, "dapan_b", e.target.value)}
            />
            <input
              placeholder="Đáp án C"
              value={q.dapan_c}
              onChange={(e) => handleChangeQuestion(index, "dapan_c", e.target.value)}
            />
            <input
              placeholder="Đáp án D"
              value={q.dapan_d}
              onChange={(e) => handleChangeQuestion(index, "dapan_d", e.target.value)}
            />
          </div>

          <div className="question-meta">
            <label>Đáp án đúng:</label>
            <select value={q.dapandung} onChange={(e) => handleChangeQuestion(index, "dapandung", e.target.value)}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>

            <label>Mức độ:</label>
            <select value={q.mucdo} onChange={(e) => handleChangeQuestion(index, "mucdo", e.target.value)}>
              <option value="easy">Dễ</option>
              <option value="average">Trung bình</option>
              <option value="hard">Khó</option>
            </select>
          </div>

          <button className="btn-remove" onClick={() => handleRemoveQuestion(index)}>Xóa câu hỏi</button>
        </div>
      ))}
    </div>
      <button className="btn-add" onClick={handleAddQuestion}>Thêm câu hỏi</button>
      <button className="btn-remove-all" onClick={handleRemoveAllQuestions}>Xóa tất cả</button>
      <button className="btn-submit" onClick={handleSubmit}>Tạo chủ đề</button>
    </div>
  );
}

export default CreateTopic;