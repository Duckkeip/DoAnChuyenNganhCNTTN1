import React, { useEffect, useState ,useCallback} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Homeuser.css";  
import jwt_decode from "jwt-decode";
import { Outlet } from "react-router-dom";

function Homeuser() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); 
  
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

  // ✅ useEffect chỉ chạy 1 lần
  useEffect(() => {
    Checktoken();
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [Checktoken]); // ✅ thêm dependency hợp lệ

  const handleLogoClick = () => navigate(user ? `/home/${user.id}` : "/home");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    console.log("Đã đăng xuất!");
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



         {/* ---------- MENU ---------- */}
      <section className="menu-section">
      <button
  className={`btn btn-menu ${location.pathname === `/home/${user?.id}` ? "active" : ""}`}
  onClick={() => {
    if (!user?.id) return console.warn("User chưa sẵn sàng!");
    setTimeout(() => {
    navigate(`/home/${user.id}`);
    },200)
  }}
>
  Trang chủ
</button>

        <button
          className={`btn btn-menu ${location.pathname.includes("profile") ? "active" : ""}`}
          onClick={() => 
            setTimeout(() => {
            navigate(`/home/${user?.id}/profile`);
            },200)}
        >
          Hồ sơ của tôi
        </button>

        <button
          className={`btn btn-menu ${location.pathname.includes("history") ? "active" : ""}`}
          onClick={() => 
            setTimeout(() => {
            navigate(`/home/${user?._id}/history`)
            },200)
        }
        >
          Lịch sử chơi
        </button>
      </section>

      {/* ✅ Vùng Outlet để hiển thị Profile/History/HomeContent */}
      <Outlet />



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

export default Homeuser;
