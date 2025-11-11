import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../token/check";
import "./play.css";

export default function Play() {
  const location = useLocation();
  const navigate = useNavigate();
  const { room, user } = location.state || {};
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [finished, setFinished] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // ✅ khóa khi nộp

  const [timeLeft, setTimeLeft] = useState(600); // 10 phút
  const timerRef = useRef(null);

  // 🧠 Lấy câu hỏi
  useEffect(() => {
    if (!room) return;
    const fetchQuestions = async () => {
      try {
        const res = await api.get(`/topic/cauhoi/${room.id_chude}`);
        setQuestions(res.data);
      } catch (err) {
        console.error("Lỗi tải câu hỏi:", err);
      }
    };
    fetchQuestions();
  }, [room]);

  // 🕒 Đếm ngược thời gian
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
  }, [finished]);

  if (!room) return <p>❌ Không có thông tin phòng!</p>;
  if (!questions.length) return <p>⏳ Đang tải câu hỏi...</p>;

  const question = questions[current];

  // ✅ Chọn đáp án
  const handleAnswer = (option) => {
    if (isSubmitted) return; // 🔒 khóa khi nộp
    setAnswers((prev) => ({ ...prev, [question._id]: option }));
  };

  // ⏭️ Câu tiếp theo
  const handleNext = () => {
    if (isSubmitted) return; // 🔒 khóa
    if (current < questions.length - 1) setCurrent(current + 1);
  };

  // ⏮️ Câu trước
  const handlePrev = () => {
    if (isSubmitted) return; // 🔒 khóa
    if (current > 0) setCurrent(current - 1);
  };

  // 🧾 Nộp bài
  const handleFinish = (auto = false) => {
    if (isSubmitted) return; // 🔒 tránh double submit
    clearInterval(timerRef.current);
    setIsSubmitted(true);

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q._id] === q.dapandung) correct++;
    });

    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setFinished(true);

    if (user) {
      api
        .post("/ketqua", {
          user_id: user._id,
          id_chude: room.id_chude,
          diem: finalScore,
          tongcauhoi: questions.length,
          socaudung: correct,
        })
        .then(() => console.log("✅ Đã lưu kết quả"))
        .catch((err) => console.error("❌ Lỗi khi lưu kết quả:", err));
    }

    if (!auto)
      navigate("/ranking", { state: { id_chude: room.id_chude } });
    else
      alert("⏰ Hết thời gian! Hệ thống tự động nộp bài.");
  };

  // 🕓 Định dạng thời gian
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // 🏁 Hiển thị kết quả
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
        <button onClick={() => navigate("/")}>🏠 Về trang chủ</button>
      </div>
    );
  }

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

      {/* 🔹 Thanh đánh dấu câu hỏi */}
      <div className="question-map">
        {questions.map((q, i) => (
          <button
            key={q._id}
            onClick={() => !isSubmitted && setCurrent(i)}
            className={`map-btn ${current === i ? "current" : ""} ${
              answers[q._id] ? "answered" : ""
            }`}
            disabled={isSubmitted} // 🔒 khóa map
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* 🔹 Câu hỏi */}
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
              style={{ pointerEvents: isSubmitted ? "none" : "auto" }} // 🔒 khóa click
            >
              {opt.toUpperCase()}. {question[`dapan_${opt}`]}
            </li>
          ))}
        </ul>
      </div>

      {/* 🔹 Nút điều hướng */}
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
