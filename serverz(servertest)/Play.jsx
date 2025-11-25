import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../token/check";
import "./play.css";
import jwt_decode from "jwt-decode";

export default function Play() {
  const location = useLocation();
  const navigate = useNavigate();

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
  const [timeLeft, setTimeLeft] = useState(saved?.timeLeft || 600);

  const timerRef = useRef(null);

  // MUST để letter trên đầu để handleFinish dùng được
  const letter = ["A", "B", "C", "D"];

  // Load user từ token
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
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  // Load câu hỏi
  useEffect(() => {
    if (!room) return;
    if (questions.length > 0) return;

    const fetchQuestions = async () => {
      try {
        const chudeId = room.id_chude._id || room.id_chude;
        const res = await api.get(`/topic/cauhoi/${chudeId}`);
        setQuestions(res.data || []);
      } catch (err) {
        console.error("Lỗi tải câu hỏi:", err);
      }
    };

    fetchQuestions();
  }, [room, questions.length]);

  // Format time
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Nộp bài
  const handleFinish = useCallback(
    async (auto = false) => {
      if (isSubmitted) return;

      clearInterval(timerRef.current);
      setIsSubmitted(true);

      let correct = 0;

      questions.forEach((q) => {
        const idx = answers[q._id];
        if (idx !== undefined && q.answers[idx]?.correct) {
          correct++;
        }
      });

      const totalQuestions = questions.length;
      const finalScore = Math.round((correct / totalQuestions) * 100);

      setScore(finalScore);
      setFinished(true);

      if (user) {
        const rankPayload = {
          user_id: user._id,
          id_chude: room.id_chude._id || room.id_chude,
          diem: finalScore,
          tongcauhoi: totalQuestions,
          socaudung: correct
        };

        const ketquaPayload = {
          user_id: user._id,
          id_chude: room.id_chude._id || room.id_chude,
          tong_cau: totalQuestions,
          cau_dung: correct,
          cau_sai: totalQuestions - correct,
          tong_diem: finalScore,
          thoigian_lam: formatTime(600 - timeLeft),
          dapAnDaChon: questions.map((q) => {
            const idx = answers[q._id];
            return {
              id_cauhoi: q._id,
              dapan_chon: idx !== undefined ? letter[idx] : null,  
              dung: idx !== undefined ? q.answers[idx].correct : false
            };
          })
        };

        try {
          await Promise.all([
            api.post("/rank/xephang", rankPayload),
            api.post("/result/ketqua", ketquaPayload)
          ]);
        } catch (e) {
          console.error("Lỗi lưu kết quả:", e);
        }
      }

      // CHUYỂN TRANG NGAY LẬP TỨC — KHÔNG ĐỂ TREO
      navigate("/ketqua", {
        state: {
          score: finalScore,
          correct,
          total: totalQuestions,
        },
      });

      if (auto) alert("⏰ Hết thời gian! Hệ thống tự động nộp bài.");
    },
    [isSubmitted, questions, answers, user, room, timeLeft, navigate]
  );

  // Timer
  useEffect(() => {
    if (finished) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleFinish(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [finished, handleFinish]);

  // Lưu localStorage
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

  if (!room) return <p>Không có thông tin phòng!</p>;
  if (!questions.length) return <p>Đang tải câu hỏi...</p>;

  const question = questions[current];

  const handleAnswer = (index) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [question._id]: index }));
  };

  return (
    <div className={`play-screen ${isSubmitted ? "disabled" : ""}`}>
      <div className="header">
        <h2>{room.tenroom}</h2>
        <div className="info-bar">
          <p>
            ⏱️ Thời gian:{" "}
            <b style={{ color: timeLeft < 60 ? "red" : "#007bff" }}>
              {formatTime(timeLeft)}
            </b>
          </p>
          <p>Mã PIN: <b>{room.pin}</b></p>
        </div>
      </div>

      <div className="question-map">
        {questions.map((q, i) => (
          <button
            key={q._id}
            onClick={() => setCurrent(i)}
            className={`map-btn ${current === i ? "current" : ""} ${
              answers[q._id] !== undefined ? "answered" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="question-box">
        <p>
          <b>Câu {current + 1}:</b> {question.question}
        </p>

        <ul>
          {question.answers.map((ans, idx) => (
            <li
              key={idx}
              className={`option ${
                answers[question._id] === idx ? "selected" : ""
              }`}
              onClick={() => handleAnswer(idx)}
            >
              {letter[idx]}. {ans.text}
            </li>
          ))}
        </ul>
      </div>

      <div className="nav-buttons">
        <button onClick={() => setCurrent((c) => c - 1)} disabled={current === 0}>
          ⬅️ Trước
        </button>

        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent((c) => c + 1)}>
            Tiếp ➡️
          </button>
        ) : (
          <button onClick={() => handleFinish(false)}>Hoàn thành ✅</button>
        )}
      </div>
    </div>
  );
}
