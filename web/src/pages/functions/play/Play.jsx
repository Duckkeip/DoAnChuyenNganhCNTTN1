import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../token/check";
import "./play.css";
import jwt_decode from "jwt-decode";

export default function Play() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1️⃣ Load state từ location.state hoặc localStorage
  const saved = JSON.parse(localStorage.getItem("currentQuiz") || "null");
  const initialState = location.state || saved;
  const { room } = initialState || {};

  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState(saved?.questions || []);
  const [current, setCurrent] = useState(saved?.current || 0);
  const [answers, setAnswers] = useState(saved?.answers || {});
  const [score, setScore] = useState(saved?.score || null);
  const [finished, setFinished] = useState(saved?.finished || false);
  const [isSubmitted, setIsSubmitted] = useState(saved?.isSubmitted || false);
  const [timeLeft, setTimeLeft] = useState(saved?.timeLeft || 600); // 10 phút

  const timerRef = useRef(null);

  // 2️⃣ Kiểm tra token và load user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwt_decode(token);
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const normalizedUser = {
        _id: decoded._id || decoded.id,
        username: decoded.username,
        email: decoded.email
      };
      setUser(normalizedUser);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  // 3️⃣ Lấy câu hỏi từ API
  useEffect(() => {
    if (!room) return;
    if (questions.length > 0) return;

    const fetchQuestions = async () => {
      try {
        const chudeId = room.id_chude._id || room.id_chude;
        const res = await api.get(`/topic/cauhoi/${chudeId}`);
        setQuestions(res.data);
      } catch (err) {
        console.error("Lỗi tải câu hỏi:", err);
      }
    };

    fetchQuestions();
  }, [room, questions.length]);

  // 4️⃣ Hàm format thời gian
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // 5️⃣ Hàm submit kết quả & rank
  // 5️⃣ Hàm submit kết quả & rank
const handleFinish = useCallback(
  (auto = false) => {
    if (isSubmitted) return;

    clearInterval(timerRef.current);
    setIsSubmitted(true);

    // Tính số câu đúng
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q._id] === q.dapandung) correct++;
    });

    const totalQuestions = questions.length;
    const finalScore = Math.round((correct / totalQuestions) * 100);
    setScore(finalScore);
    setFinished(true);

    if (user) {
      console.log("🔵 Bắt đầu gửi dữ liệu xếp hạng & kết quả...");

      // Payload cho bảng Xephang
      const rankPayload = {
        user_id: user._id,
        id_chude: room.id_chude._id || room.id_chude,
        diem: finalScore,          // điểm %
        tongcauhoi: totalQuestions,
        socaudung: correct
      };

      // Payload cho bảng Ketqua (schema mới, required: true)
      const ketquaPayload = {
        user_id: user._id,
        id_chude: room.id_chude._id || room.id_chude,
        tong_cau: totalQuestions,
        cau_dung: correct,
        cau_sai: totalQuestions - correct,
        tong_diem: finalScore,
        thoigian_lam: formatTime(600 - timeLeft), // hoặc thời gian thực
        dapAnDaChon: questions.map((q) => ({
          id_cauhoi: q._id,
          dapan_chon: answers[q._id] || null, // không để null, mặc định "A"
          dung: answers[q._id] === q.dapandung
        }))
      };

      console.log("📤 rankPayload:", rankPayload);
      console.log("📤 ketquaPayload:", ketquaPayload);

      Promise.all([
        api.post("/rank/xephang", rankPayload),
        api.post("/result/ketqua", ketquaPayload)
      ])
        .then(([rankRes, ketquaRes]) => {
          console.log("🟢 Lưu dữ liệu thành công!");
          console.log("✔ Rank:", rankRes.data);
          console.log("✔ Ketqua:", ketquaRes.data);
        })
        .catch((err) => {
          console.error("❌ Lỗi khi lưu:", err.response?.data || err);
        });
    }

    if (auto) alert("⏰ Hết thời gian! Hệ thống tự động nộp bài.");
  },
  [isSubmitted, questions, answers, user, room, timeLeft]
);


  // 6️⃣ Timer countdown
  useEffect(() => {
    if (finished) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinish(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [finished, handleFinish]);

  // 7️⃣ Lưu trạng thái vào localStorage
  useEffect(() => {
    if (!room) return;
    localStorage.setItem(
      "currentQuiz",
      JSON.stringify({
        room,
        user,
        questions,
        current,
        answers,
        score,
        finished,
        isSubmitted,
        timeLeft
      })
    );
  }, [room, user, questions, current, answers, score, finished, isSubmitted, timeLeft]);

  if (!room) return <p>❌ Không có thông tin phòng!</p>;
  if (!questions.length) return <p>⏳ Đang tải câu hỏi...</p>;

  const question = questions[current];

  const handleAnswer = (option) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [question._id]: option }));
  };

  const handleNext = () => {
    if (isSubmitted) return;
    if (current < questions.length - 1) setCurrent(current + 1);
  };

  const handlePrev = () => {
    if (isSubmitted) return;
    if (current > 0) setCurrent(current - 1);
  };

  // 8️⃣ Render kết quả
  if (finished) {
    return (
      <div className="result">
        <h2>Kết quả quiz</h2>
        <p>Điểm: {score} / 100</p>
        <p>
          Đúng{" "}
          {Object.values(answers).filter(
            (ans, i) => ans === questions[i]?.dapandung
          ).length}{" "}
          / {questions.length} câu
        </p>

        <button
          onClick={() => {
            navigate("/ranking", { state: { id_chude: room.id_chude } });
          }}
          className="btnxephang"
        >
          📊 Xem bảng xếp hạng
        </button>
       <button
        onClick={() => {
          // Lấy user hiện tại từ state hoặc localStorage
          const currentUser =
            user || JSON.parse(localStorage.getItem("user") || "null");

          if (!currentUser?._id) {
            alert("Vui lòng đăng nhập!");
            navigate("/login");
            return;
          }

          console.log("👉 user khi về trang chủ:", currentUser);
          localStorage.removeItem("currentQuiz");
          navigate(`/home/${currentUser._id}`);
        }}
        className="btnhome"
      >
        🏠 Về trang chủ
      </button>

      </div>
    );
  }

  // 9️⃣ Render quiz
  return (
    <div className={`play-screen ${isSubmitted ? "disabled" : ""}`}>
      <div className="header">
        <h2>{room.tenroom}</h2>
        <div className="info-bar">
          <p>
            ⏱️ Thời gian còn lại:{" "}
            <b style={{ color: timeLeft < 60 ? "red" : "#007bff" }}>
              {formatTime(timeLeft)}
            </b>
          </p>
          <p>
            Mã PIN: <b>{room.pin}</b>
          </p>
        </div>
      </div>

      <div className="question-map">
        {questions.map((q, i) => (
          <button
            key={q._id}
            onClick={() => !isSubmitted && setCurrent(i)}
            className={`map-btn ${current === i ? "current" : ""} ${
              answers[q._id] ? "answered" : ""
            }`}
            disabled={isSubmitted}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="question-box">
        <p>
          <b>Câu {current + 1}:</b> {question.noidung}
        </p>
        <ul>
          {["a", "b", "c", "d"].map((opt) => (
            <li
              key={opt}
              onClick={() => handleAnswer(opt.toUpperCase())}
              className={`option ${
                answers[question._id] === opt.toUpperCase() ? "selected" : ""
              }`}
              style={{ pointerEvents: isSubmitted ? "none" : "auto" }}
            >
              {opt.toUpperCase()}. {question[`dapan_${opt}`]}
            </li>
          ))}
        </ul>
      </div>

      <div className="nav-buttons">
        <button onClick={handlePrev} disabled={current === 0 || isSubmitted}>
          ⬅️ Trước đó
        </button>
        {!isSubmitted ? (
          current < questions.length - 1 ? (
            <button onClick={handleNext}>Câu tiếp theo ➡️</button>
          ) : (
            <button onClick={() => handleFinish(false)}>Hoàn thành ✅</button>
          )
        ) : (
          <button disabled>Đã nộp</button>
        )}
      </div>
    </div>
  );
}
