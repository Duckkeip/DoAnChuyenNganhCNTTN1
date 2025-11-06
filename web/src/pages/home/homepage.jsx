import React, { useEffect, useState, useRef  } from "react";
import api from "../token/check";
import { useNavigate } from "react-router-dom";
import "./Homeuser.css";

function Homepage() {
  const [chudes, setChudes] = useState([]);
  const navigate = useNavigate();
  const scrollRef = useRef(null);// tham chiếu đến thanh cuộn ngang

  useEffect(() => {
    const el = scrollRef.current;

    api.get("/chude")
      .then((res) => setChudes(res.data))
      .catch((err) => {
        console.error("Lỗi lấy chủ đề:", err);
        setChudes([]);
      });

    const handleWheel = (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY; // lăn dọc -> cuộn ngang
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);  
      
  }, []);

  return (
    <div className="homeuser-container">
      <header>
        <div className="logo" onClick={() => navigate("/")}>
           <span className="logo-icon">🧠</span>
          <span>Quizz Game</span>
        </div>
        <div className="user-section">
          <button className="btn btn-secondary" onClick={() => navigate("/login")}>Đăng nhập</button>
          <button className="btn btn-primary" onClick={() => navigate("/register")}>Đăng ký</button>
        </div>
      </header>

      <section className="quiz-list">
         <h2>🔥 Chủ đề nổi bật</h2>
            <div className="chude-scroll" ref={scrollRef} >
                    {chudes.slice(0, 5).map((chude) => (
                    <div className="chude-card" key={chude._id}>
                    <h3>{chude.tenchude}</h3>
                    <p>Loại: {chude.loaichude}</p>
                    <button className="btn btn-primary" onClick={() => navigate("/login")}>Khám phá</button>
                </div>
            ))}
            </div>
      </section>
    </div>
  );
}

export default Homepage;
