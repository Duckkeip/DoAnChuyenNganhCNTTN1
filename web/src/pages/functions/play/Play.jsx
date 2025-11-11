import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../token/check";
import "./play.css";

export default function Play() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1️⃣ Load state: location.state > localStorage
  const saved = JSON.parse(localStorage.getItem("currentQuiz") || "null");
  const initialState = location.state || saved;

  const { room, user } = initialState || {};

  const [questions, setQuestions] = useState(saved?.questions || []);
  const [current, setCurrent] = useState(saved?.current || 0);
  const [answers, setAnswers] = useState(saved?.answers || {});
  const [score, setScore] = useState(saved?.score || null);
  const [finished, setFinished] = useState(saved?.finished || false);
  const [isSubmitted, setIsSubmitted] = useState(saved?.isSubmitted || false);

  const [timeLeft, setTimeLeft] = useState(saved?.timeLeft || 600); // 10 phút
  const timerRef = useRef(null);

  // 2️⃣ Lấy câu hỏi
  useEffect(() => {
    if (!room) return;
    const fetchQuestions = async () => {
      try {
        const chudeId = room.id_chude._id || room.id_chude;
        const res = await api.get(`/topic/cauhoi/${chudeId}`);
        setQuestions(res.data);
      } catch (err) {
        console.error("Lỗi tải câu hỏi:", err);
      }
    };
    if (!questions.length) fetchQuestions();
  }, [room, questions.length]);

  // 3️⃣ Timer
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

  // 4️⃣ Lưu trạng thái vào localStorage để Back/Forward không mất
  useEffect(() => {
    if (!room) return;
    localStorage.setItem(
      "currentQuiz",
      JSON.stringify({ room, user, questions, current, answers, score, finished, isSubmitted, timeLeft })
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

  const handleFinish = (auto = false) => {
    if (isSubmitted) return;
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

    if (!auto) navigate("/ranking", { state: { id_chude: room.id_chude } });
    else alert("⏰ Hết thời gian! Hệ thống tự động nộp bài.");
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

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
            localStorage.removeItem("currentQuiz");
            navigate("/");
          }}
        >
          🏠 Về trang chủ
        </button>
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
