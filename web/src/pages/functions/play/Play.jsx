import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../token/check";
import "./play.css";
import { io } from "socket.io-client";
import jwt_decode from "jwt-decode";

const socket = io("http://localhost:5000"); 

export default function Play() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1️⃣ Load state từ location.state hoặc localStorage
  const saved = JSON.parse(localStorage.getItem("currentQuiz") || "null");
  const initialState = location.state || saved;
  const { room, user: userFromState, cauhoi: initialQuestions } = initialState || {};

  // 2️⃣ CẬP NHẬT: Dùng câu hỏi đã được xử lý (xáo trộn/cắt bớt) từ state
  // Nếu không có trong state, dùng cái đã lưu, nếu không có thì là mảng rỗng.
  const [questions, setQuestions] = useState(initialQuestions || saved?.questions || []);

  const [user, setUser] = useState(null);
 const startingTimeLimit = room?.timeLimit || saved?.startingTimeLimit || 600;

  const [current, setCurrent] = useState(saved?.current || 0);
  const [answers, setAnswers] = useState(saved?.answers || {});
  const [score, setScore] = useState(saved?.score || null);
  const [finished, setFinished] = useState(saved?.finished || false);
  const [isSubmitted, setIsSubmitted] = useState(saved?.isSubmitted || false);
  const [timeLeft, setTimeLeft] = useState(saved?.timeLeft || startingTimeLimit); // 10 phút
  
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
 
   useEffect(() => {
    if (!room || !room.pin) return;

    // 1. Tham gia phòng
    socket.emit("joinRoom", room.pin);
    console.log(`📡 Tham gia phòng socket: ${room.pin}`);

    // 2. Lắng nghe lệnh bắt đầu Quiz từ Host
    // Sự kiện này được gửi khi host nhấn "Bắt đầu Quiz" trong CreateRoom
    socket.on("startQuiz", (data) => {
        console.log("🔥 Quiz bắt đầu! Nhận dữ liệu câu hỏi và thời gian.");
        
        // Cập nhật state với câu hỏi và thời gian mới nhận
        setQuestions(data.questions); 
        setTimeLeft(data.timeLimit); // Cập nhật thời gian giới hạn mới
        
        // Lưu trạng thái mới vào localStorage để duy trì
        localStorage.setItem("currentQuiz", JSON.stringify({
            room,
            user: user || userFromState,
            questions: data.questions, // Lưu câu hỏi mới
            current: 0,
            answers: {},
            score: null,
            finished: false,
            isSubmitted: false,
            timeLeft: data.timeLimit, // Lưu thời gian mới
            startingTimeLimit: data.timeLimit
        }));
    });

    return () => {
        // Dọn dẹp listener khi component unmount
        socket.off("startQuiz");
    };
  }, [room, user, userFromState]); // Thêm dependencies cần thiết

  // 4️⃣ Hàm format thời gian
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };


  // 5️⃣ Hàm submit kết quả & rank
const handleFinish = useCallback(
  (auto = false) => {
    if (isSubmitted) return;
    
    if (!auto) {
      const nopbai = window.confirm("Bạn có chắc muốn nộp bài không?");
      if (!nopbai) return;  
    }

    // ✅ Thêm mảng ánh xạ để chuyển đổi index số (0-3) sang ký tự chữ cái ("A"-"D")
    const ANSWER_KEYS = ["A", "B", "C", "D"];

    clearInterval(timerRef.current);
    setIsSubmitted(true);

    // Tính số câu đúng
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q._id] === q.correct)
        correct++;
    });

    const totalQuestions = questions.length;
    const finalScore = Math.round((correct / totalQuestions) * 100);
    setScore(finalScore);
    setFinished(true);

    if (user) {
      console.log("🔵 Bắt đầu gửi dữ liệu xếp hạng & kết quả...");
      
      if (room && room.pin && user._id) {
          socket.emit("playerFinished", { 
              pin: room.pin, 
              userId: user._id,
              score: finalScore 
          });
          console.log(`📤 Gửi sự kiện 'playerFinished' cho phòng ${room.pin}`);
      }
      // Payload cho bảng Xephang
      const rankPayload = {
        user_id: user._id,
        id_chude: room.id_chude._id || room.id_chude,
        diem: finalScore,          // điểm %
        tongcauhoi: totalQuestions,
        socaudung: correct
      };

      // Payload cho bảng Ketqua 
      const ketquaPayload = {
        user_id: user._id,
        id_chude: room.id_chude._id || room.id_chude,
        tong_cau: totalQuestions,
        cau_dung: correct,
        cau_sai: totalQuestions - correct,
        tong_diem: finalScore,
        thoigian_lam: formatTime(startingTimeLimit  - timeLeft), // hoặc thời gian thực
        dapAnDaChon: questions.map((q) => {
          const selectedIndex = answers[q._id];
          let dapan_chon_key;

          if (selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex <= 3) {
            // ✅ Chuyển index số (0-3) sang ký tự chữ cái ("A"-"D")
            dapan_chon_key = ANSWER_KEYS[selectedIndex]; 
          } else {
            // ✅ Nếu không chọn (undefined), gán giá trị mặc định là "A" (một giá trị hợp lệ trong enum)
            // Hoặc bạn có thể cân nhắc gán một giá trị đặc biệt như "N/A" và sửa Schema để chấp nhận nó.
            // Theo yêu cầu của Schema hiện tại, "A" là giải pháp an toàn nhất.
            dapan_chon_key = "A"; 
          }
              
          return {
            id_cauhoi: q._id,
            noidung: q.noidung,
            dapan_chon: dapan_chon_key, 
            dung: answers[q._id] === q.correct
          };
        })
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
  [isSubmitted, questions, answers, user, room, timeLeft,startingTimeLimit ]
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
        user: user || userFromState,
        questions,
        current,
        answers,
        score,
        finished,
        isSubmitted,
        timeLeft,
        startingTimeLimit: startingTimeLimit 
      })
    );
  }, [room, user, userFromState, questions, current, answers, score, finished, isSubmitted, timeLeft, startingTimeLimit]);


  useEffect(() => {
    if (!room || !room.pin || !navigate) return;

    // Lắng nghe sự kiện Server gửi về khi tất cả người chơi nộp bài
    socket.on("gameEndedByAllSubmission", (data) => {
        console.log(`🎉 Phòng ${room.pin} đã kết thúc do tất cả người chơi nộp bài!`);
        
        // Điều hướng đến màn hình xếp hạng (tương tự như nút "Xem bảng xếp hạng" đã có)
        localStorage.removeItem("currentQuiz"); 
        navigate("/ranking", { state: { id_chude: room.id_chude } }); 
    });

    return () => {
        socket.off("gameEndedByAllSubmission");
    };
  }, [room, navigate]); // navigate là dependency quan trọng

  if (!room) return <p>❌ Không có thông tin phòng!</p>;
  if (!questions.length) return <p>⏳ Đang tải câu hỏi...</p>;

  const question = questions[current];
  
  if (!question) {
    console.warn(`⚠ current index (${current}) is out of bounds. Resetting to 0.`);
    setCurrent(0); // Reset current index về 0
    // Trả về sớm để component render lại với current = 0
    return <p>⏳ Đang đồng bộ lại câu hỏi...</p>; 
  }


  const handleAnswer = (index) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [question._id]: index }));
};

  const handleNext = () => {
    if (isSubmitted) return;
    if (current < questions.length - 1) setCurrent(current + 1);
  };

  const handlePrev = () => {
    if (isSubmitted) return;
    if (current > 0) setCurrent(current - 1);
  };

// 9️⃣ Render kết quả (Đã sửa logic tính correctCount)
  if (finished) {
    // ✅ Tính lại số câu đúng ở đây
    const correctCount = questions.filter(q => answers[q._id] === q.correct).length;

    return (
      <div className="result">
        <h2>Kết quả quiz</h2>
        <p>Điểm: {score} / 100</p>
        <p>
          {/* ✅ Sử dụng biến đã tính */}
          Đúng {correctCount} / {questions.length} câu
        </p>

        <button
          onClick={() => {
            // Xóa quiz khỏi localStorage
            localStorage.removeItem("currentQuiz"); 
            navigate("/ranking", { state: { id_chude: room.id_chude } });
          }}
          className="btnxephang"
        >
          📊 Xem bảng xếp hạng
        </button>
        <button
          onClick={() => {
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

  const qid = String(question._id);
  // 🔟 Render quiz (Giữ nguyên)
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
              answers[String(q._id)] !== undefined ? "answered" : ""
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
          {question.options?.map((opt, index) => {
            let cls = "option";

            if (isSubmitted) {
              if (index === question.correct) cls += " correct"; // đáp án đúng
              else if (answers[qid] === index) cls += " wrong"; // đáp án sai đã chọn
            } else if (answers[qid] === index) {
              cls += " selected"; // đang chọn nhưng chưa nộp
            }

            return (
              <li
                key={index}
                onClick={() => handleAnswer(index)}
                className={cls}
                style={{ pointerEvents: isSubmitted ? "none" : "auto" }}
              >
                {["A", "B", "C", "D"][index]}. {opt.text}
              </li>
            );
          })}
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