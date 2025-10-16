import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

import "./Homepage.css";

function Homepage() {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const staticQuizzes = [
      { title: "Thủ đô các nước", description: "Kiểm tra kiến thức địa lý...", questions: 15, difficulty: "medium" },
      { title: "Khoa học & Công nghệ", description: "Khám phá thế giới khoa học...", questions: 20, difficulty: "hard" },
      { title: "Điện ảnh", description: "Bạn hiểu biết thế nào về điện ảnh?", questions: 12, difficulty: "easy" },
      { title: "Sự kiện lịch sử", description: "Hành trình xuyên thời gian...", questions: 18, difficulty: "medium" },
    ];

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

    // Lấy danh sách quiz từ backend, fallback về staticQuizzes nếu lỗi
    axios.get("http://localhost:5000/api/quizzes")
      .then(res => setQuizzes(res.data))
      .catch(() => setQuizzes(staticQuizzes));
  }, []);

  const handleStartQuiz = (quizTitle) => {
    if (!user) {
      alert("Vui lòng đăng nhập để chơi quiz!");
      navigate("/login");
      return;
    }
    alert(`Bắt đầu quiz: ${quizTitle}`);
    // navigate(`/quiz/${quizId}`) nếu có page riêng cho quiz
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setTimeout(() => {
        console.log("Người dùng đã đăng xuất sau 3 giây");
      }, 3000);
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
          <span className="section-icon">🚀</span> Danh sách thử thách
        </h2>

        <div className="quiz-grid">
          {quizzes.map((quiz, index) => (
            <div className="quiz-card" key={index}>
              <div className="quiz-content">
                <h3 className="quiz-title">{quiz.title}</h3>
                <p className="quiz-description">{quiz.description}</p>
                <button className="btn btn-primary" onClick={() => handleStartQuiz(quiz.title)}>Bắt đầu ngay</button>
                <div className="quiz-meta">
                  <span>{quiz.questions} câu hỏi</span>
                  <span className={`quiz-difficulty difficulty-${quiz.difficulty}`}>
                    {quiz.difficulty === "easy" ? "Dễ" : quiz.difficulty === "medium" ? "Trung bình" : "Khó"}
                  </span>
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
