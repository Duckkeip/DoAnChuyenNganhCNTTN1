import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

import "./Homepage.css";

function Homepage() {
  const [user, setUser] = useState(null);
  const [chudes, setChudes] = useState([]);
  const [room, setRoom] = useState(null); // phòng vừa tạo
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra token user
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt_decode(token);
        setUser(decoded);
      } catch {
        localStorage.removeItem("token");
      }
    }

    // Lấy danh sách chủ đề từ backend
    axios.get("http://localhost:5000/api/chude")
      .then(res => setChudes(res.data))
      .catch(err => {
        console.error("Lỗi lấy chủ đề:", err);
        setChudes([]);
      });
  }, []);

  const handleStartQuiz = async (chude) => {
    if (!user) {
      alert("Vui lòng đăng nhập để chơi quiz!");
      navigate("/login");
      return;
    }

    try {
      // 1️⃣ Tạo phòng mới với chủ đề
      const roomRes = await axios.post("http://localhost:5000/api/room", {
        id_host: user._id,
        id_chude: chude._id,
        tenroom: `Phòng - ${chude.tenchude}`
      });
      const newRoom = roomRes.data;
      setRoom(newRoom);
      console.log("Phòng mới:", newRoom);

      // 2️⃣ Lấy câu hỏi của chủ đề
      const questionRes = await axios.get(`http://localhost:5000/api/ketqua/${chude._id}`);
      const cauhoi = questionRes.data;
      console.log(`Câu hỏi của chủ đề ${chude.tenchude}:`, cauhoi);

      // 3️⃣ Chuyển đến trang chơi (tạo QuizPage sau)
      // navigate(`/room/${newRoom._id}`, { state: { room: newRoom, cauhoi } });
      alert(`Phòng đã tạo cho chủ đề "${chude.tenchude}" với ${cauhoi.length} câu hỏi`);
    } catch (err) {
      console.error("Lỗi tạo phòng hoặc lấy câu hỏi:", err);
      alert("Không thể tạo phòng hoặc lấy câu hỏi cho chủ đề này!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setTimeout(() => console.log("Người dùng đã đăng xuất sau 3 giây"), 3000);
  };

  return (
    <div className="homepage-container">
      <header>
        <div className="logo">
          <span className="logo-icon">🧠</span>
          <span>Quizz Game</span>
        </div>

        <div className="user-section">
          {user ? (
            <>
              <span className="user-greeting">Xin chào, {user?.tenhienthi || user?.username}!</span>
              <button className="btn btn-danger" onClick={handleLogout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => navigate("/login")}>Đăng nhập</button>
              <button className="btn btn-primary" onClick={() => navigate("/register")}>Đăng ký</button>
            </>
          )}
        </div>
      </header>

      <section className="quiz-list">
        <h2 className="section-title">
          <span className="section-icon">🚀</span> Danh sách chủ đề
        </h2>

        <div className="quiz-grid">
          {chudes.map((chude) => (
            <div className="quiz-card" key={chude._id}>
              <div className="quiz-content">
                <h3 className="quiz-title">{chude.tenchude}</h3>
                <p className="quiz-description">Loại: {chude.loaichude}</p>
                <button className="btn btn-primary" onClick={() => handleStartQuiz(chude)}>
                  Bắt đầu
                </button>
                <div className="quiz-meta">
                  <span>Người tạo: {chude.user_id?.username || "Unknown"}</span>
                  <span>Trạng thái: {chude.tinhtrang}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Homepage;
