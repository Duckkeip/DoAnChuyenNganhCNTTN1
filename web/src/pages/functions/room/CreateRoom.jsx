import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./createroom.css";
import { io } from "socket.io-client";
import api from "../../token/check";


const socket = io("http://localhost:5000");



// 🔀 Hàm xáo trộn mảng (để đảm bảo câu hỏi được chọn ngẫu nhiên)
function shuffleArray(array) {
  return array
    .map(a => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map(a => a.value);
}

export default function CreateRoom() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1️⃣ Lấy state từ location hoặc localStorage
  let storedState = JSON.parse(localStorage.getItem("currentRoom") || "null");
  let locationState = location.state || storedState;

  const [participants, setParticipants] = useState(locationState?.room?.participants || []);

  // Bỏ logic return trước, để hook luôn ở top-level
  const hasRoomData = !!locationState;
  const room = locationState?.room;
  const chude = locationState?.chude;
  const user = locationState?.user;
  const fullCauhoi = locationState?.cauhoi || []; // Toàn bộ câu hỏi của chủ đề
  const isMockTest = locationState?.isMockTest || false; // Cờ Thi thử

  const userId = user?._id || user?.id;
  const hostId = room?.id_host?._id || room?.id_host?.id;
  const isHost = userId && hostId && userId === hostId;

  // 2️⃣ State cho giới hạn câu hỏi (chỉ dùng cho Thi thử)
  const [questionLimit, setQuestionLimit] = useState(fullCauhoi.length);
  const maxQuestions = fullCauhoi.length;

  useEffect(() => {
    if (!hasRoomData) return; 
    // Lưu phòng vào localStorage chỉ khi status là dangcho
    if (room.status === "dangcho") {
      localStorage.setItem("currentRoom", JSON.stringify(locationState));
    }

    // Thêm user nếu chưa có
    if (!participants.some(p => (p._id || p.id) === userId)) {
      setParticipants(prev => [user, ...prev]);
    }

    // Join room socket
    socket.emit("joinRoom", room.pin);

    // Lắng nghe server update participants
    socket.on("updateParticipants", setParticipants);

    // Lắng nghe host bắt đầu chơi
    socket.on("gameStarted", () => {
      navigate("/play", { state: locationState });
    });

     return () => {
      socket.off("updateParticipants");
      socket.off("gameStarted");
    };
  }, [room, user, participants, locationState, navigate, hasRoomData, userId]);

  const handleStart = async () => {
    if (!room || !chude) return;

    // 3️⃣ Xử lý câu hỏi trước khi bắt đầu
    let cauhoiToPlay = []

    if (isMockTest) {
        // Thi thử: Xáo trộn và cắt bớt theo giới hạn host đặt
        const shuffledQuestions = shuffleArray(fullCauhoi);
        cauhoiToPlay = shuffledQuestions.slice(0, questionLimit);
        
        if (cauhoiToPlay.length === 0) {
            alert("Không có câu hỏi nào để chơi. Vui lòng chọn số lượng câu hỏi.");
            return;
        }
        
        console.log(`✅ Thi thử: Chọn ${cauhoiToPlay.length} câu hỏi sau khi xáo trộn.`);

    } else {
        // Phòng Ôn tập: Lấy toàn bộ câu hỏi đã có, xáo trộn cho công bằng
        cauhoiToPlay = shuffleArray(fullCauhoi);
        console.log(`✅ Ôn tập: Dùng toàn bộ ${cauhoiToPlay.length} câu hỏi sau khi xáo trộn.`);
    }

    // 4️⃣ Gửi lệnh bắt đầu chơi đến server/socket
    // Trong môi trường phòng nhiều người chơi, bạn nên cập nhật trạng thái phòng
    // và gửi câu hỏi đã chọn qua socket
    try {
        // Cập nhật trạng thái phòng trên server (tùy thuộc vào API của bạn)
        // await api.put(`/topic/room/start/${room.pin}`, { status: "dangchoi" });

        room.status = "dangchoi"; // Cập nhật local status

        socket.emit("startGame", { pin: room.pin, cauhoi: cauhoiToPlay });
        localStorage.removeItem("currentRoom");
        
        // Điều hướng host đến trang chơi
        navigate("/play", { 
            state: { 
                ...locationState, 
                cauhoi: cauhoiToPlay,
                room: room // Truyền lại room đã cập nhật status
            } 
        });
    } catch (error) {
        console.error("Lỗi khi bắt đầu trò chơi:", error);
        alert("Không thể bắt đầu trò chơi. Vui lòng thử lại!");
    }
  };

  if (!hasRoomData) {
    return <p>Không có dữ liệu phòng, vui lòng tạo lại từ Homepage.</p>;
  }


 return (
    <div className="container">
      <div className="create-room">
        <div className="room-header">
          <h2>Phòng {isMockTest ? "Thi thử" : "Ôn tập"}: {chude.tenchude}</h2>
          <div className="pin-box">
            <span>Mã PIN:</span>
            <strong>{room.pin}</strong>
          </div>
        </div>

        <div className="room-info">
          <p><b>Tên phòng:</b> {room.tenroom}</p>
          <p><b>Tổng câu hỏi có sẵn:</b> {maxQuestions} câu</p>
          <p><b>Trạng thái:</b> {room.status}</p>
        </div>
        
        {/* 5️⃣ Giao diện setting số lượng câu hỏi */}
        {isHost && isMockTest && maxQuestions > 0 && (
            <div className="settings-section">
                <h3>Cài đặt bài Thi thử</h3>
                <label htmlFor="limit">Số lượng câu hỏi:</label>
                <input
                    id="limit"
                    type="number"
                    min="1"
                    max={maxQuestions}
                    value={questionLimit}
                    onChange={(e) => {
                        const val = Math.min(Math.max(1, parseInt(e.target.value) || 1), maxQuestions);
                        setQuestionLimit(val);
                    }}
                />
                <p style={{marginTop: '5px', fontSize: 'small'}}>Tối đa: {maxQuestions} câu</p>
            </div>
        )}

        <div className="participants">
          <h3>Người tham gia</h3>
          <ul>
            <li key="host"><b>Host:</b> {room.id_host?.username || "Unknown"}</li>
            {participants
              .filter(p => p && (p._id || p.id) !== hostId)
              .map((p, i) => <li key={i}>{p.username || p.tenhienthi}</li>)
            }
          </ul>
        </div>

        {isHost ? (
          room.status === "dangcho" ? (
            <button 
                className="btn-start" 
                onClick={handleStart}
                disabled={isMockTest && questionLimit === 0}
            >
                Bắt đầu chơi
            </button>
          ) : (
            <p>⏳ Phòng đang chơi...</p>
          )
        ) : (
          <p>⏳ Chờ host bắt đầu...</p>
        )}
      </div>
    </div>
  );
}
