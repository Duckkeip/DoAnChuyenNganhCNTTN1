import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import api from "../../api/checktoken";
import "./Homeuser.css";

function Homepage() {
  const [user, setUser] = useState(null);
  const [chudes, setChudes] = useState([]);
  const [, setRoom] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // ✅ Số chủ đề mỗi trang
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Kiểm tra token người dùng
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt_decode(token);
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
          console.log("Token đã hết hạn, đăng xuất...");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setUser(decoded);
        }
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      }
    } else {
      setUser(null);
    }

    // ✅ Lấy danh sách chủ đề
    api
      .get("/chude")
      .then((res) => {
        console.log("Dữ liệu chủ đề nhận từ backend:", res.data);
        setChudes(res.data);
        setCurrentPage(1); // reset về trang đầu
      })
      .catch((err) => {
        console.error("Lỗi lấy chủ đề:", err);
        setChudes([]);
      });
  }, [navigate]);

  // ✅ Hàm tạo phòng và lấy câu hỏi
  const handleStartQuiz = async (chude) => {
    if (!user) {
      alert("Vui lòng đăng nhập để chơi quiz!");
      navigate("/login");
      return;
    }

    try {
      const roomRes = await api.post("/quizzes", {
        id_host: user._id,
        id_chude: chude._id,
        tenroom: `Phòng - ${chude.tenchude}`,
      });
      const newRoom = roomRes.data;
      setRoom(newRoom);
      console.log("Phòng mới:", newRoom);

      const questionRes = await api.get(`/cauhoi/${chude._id}`);
      const cauhoi = questionRes.data;
      console.log(`Câu hỏi của chủ đề ${chude.tenchude}:`, cauhoi);

      alert(`Phòng đã tạo cho chủ đề "${chude.tenchude}" với ${cauhoi.length} câu hỏi`);
      // navigate(`/room/${newRoom._id}`, { state: { room: newRoom, cauhoi } });
    } catch (err) {
      console.error("Lỗi tạo phòng hoặc lấy câu hỏi:", err);
      alert("Không thể tạo phòng hoặc lấy câu hỏi cho chủ đề này!");
    }
  };

  // ✅ Phân trang
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentChudes = chudes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(chudes.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleLogoClick = () => {
    if (user) {
      navigate(`/home/${user.id}`);
    } else {
      navigate("/home");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setTimeout(() => console.log("Người dùng đã đăng xuất sau 3 giây"), 3000);
    navigate("/home");
  };

  return (
    <div className="homeuser-container">
      {/* ---------- HEADER ---------- */}
      <header>
        <div className="logo" onClick={handleLogoClick}>
          <span className="logo-icon">🧠</span>
          <span>Quizz Game</span>
        </div>

        <div className="user-section">
          {user ? (
            <>
              <span className="user-greeting">
                Xin chào, {user?.tenhienthi || user?.username}!
              </span>
              <button className="btn btn-danger" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/register")}
              >
                Đăng ký
              </button>
            </>
          )}
        </div>
      </header>

      {/* ---------- MAIN CONTENT ---------- */}
      <section className="quiz-list">
        <h2 className="section-title">
          <span className="section-icon"></span> Danh sách chủ đề
        </h2>

        <div className="quiz-grid">
          {currentChudes.length > 0 ? (
            currentChudes.map((chude) => (
              <div className="quiz-card" key={chude._id}>
                <div className="quiz-content">
                  <h3 className="quiz-title">{chude.tenchude}</h3>
                  <p className="quiz-description">Loại: {chude.loaichude}</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleStartQuiz(chude)}
                  >
                    Bắt đầu
                  </button>
                  <div className="quiz-meta">
                    <span>
                      Người tạo: {chude.user_id?.username || "Unknown"}
                    </span>
                    <span>Trạng thái: {chude.tinhtrang}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Không có chủ đề nào để hiển thị.</p>
          )}
        </div>

        {/* ---------- PAGINATION ---------- */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Trước
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={currentPage === index + 1 ? "active" : ""}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau →
            </button>
          </div>
        )}
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-logo">🧠 Quizz Game</span>
            <p>
              Học mà chơi, chơi mà học — cùng khám phá kiến thức mỗi ngày!
            </p>
          </div>

          <div className="footer-right">
            <a
              href="https://github.com/Duckkeip"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.facebook.com/man.huy.18062"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
            <a href="mailto:support@quizzgame.com">Liên hệ</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Quizz Game. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;
