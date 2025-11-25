import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./createroom.css";
import { io } from "socket.io-client";
import api from "../../token/check";


const socket = io("http://localhost:5000");

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
  const cauhoi = locationState?.cauhoi;

  const userId = user?._id || user?.id;
  const hostId = room?.id_host?._id || room?.id_host?.id;
  const isHost = userId && hostId && userId === hostId;

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
    if (!room) return;


    // Lấy câu hỏi mới từ server với shuffle
    const questionRes = await api.get(`/topic/cauhoi/${chude._id}`);
    const cauhoiRandom = questionRes.data;

    room.status = "dangchoi";
    localStorage.removeItem("currentRoom");
    socket.emit("startGame", { pin: room.pin, cauhoi: cauhoiRandom });
    navigate("/play", { state: { ...locationState, cauhoi: cauhoiRandom } });
};

  if (!hasRoomData) {
    return <p>Không có dữ liệu phòng, vui lòng tạo lại từ Homepage.</p>;
  }


  return (
    <div className="container">
      <div className="create-room">
        <div className="room-header">
          <h2>Phòng thi: {chude.tenchude}</h2>
          <div className="pin-box">
            <span>Mã PIN:</span>
            <strong>{room.pin}</strong>
          </div>
        </div>

        <div className="room-info">
          <p><b>Tên phòng:</b> {room.tenroom}</p>
          <p><b>Trạng thái:</b> {room.status}</p>
        </div>

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
            <button className="btn-start" onClick={handleStart}>Bắt đầu chơi</button>
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
