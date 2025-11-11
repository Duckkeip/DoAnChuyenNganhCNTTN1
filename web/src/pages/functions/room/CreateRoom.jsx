import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./createroom.css";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function CreateRoom() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1️⃣ Lấy state từ location hoặc localStorage
  const storedState = JSON.parse(localStorage.getItem("currentRoom") || "null");
  const locationState = location.state || storedState;

  // 2️⃣ Nếu không có dữ liệu, render thông báo
  if (!locationState) {
    return <p>Không có dữ liệu phòng, vui lòng tạo lại từ Homepage.</p>;
  }

  const { room, chude, user, cauhoi } = locationState;
  const isHost = user.id === room.id_host?._id;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [participants, setParticipants] = useState(room.participants || []);

  // 3️⃣ useEffect top-level, không dependency là participants
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    // Lưu vào localStorage để Back/Forward
    localStorage.setItem("currentRoom", JSON.stringify(locationState));

    // Thêm user nếu chưa có
    if (!participants.some(p => p?._id?.toString() === user.id)) {
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
  }, [room.pin, user.id, locationState, navigate]);

  // 4️⃣ Host bắt đầu game
  const handleStart = () => {
    socket.emit("startGame", room.pin); // gửi tới server
    navigate("/play", { state: locationState }); // cũng navigate chính host
  };

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
              .filter(p => p && p._id !== room.id_host?._id)
              .map((p, i) => <li key={i}>{p.username || p.tenhienthi}</li>)
            }
          </ul>
        </div>

        {isHost ? (
          <button className="btn-start" onClick={handleStart}>Bắt đầu chơi</button>
        ) : (
          <p>⏳ Chờ host bắt đầu...</p>
        )}
      </div>
    </div>
  );
}
