// src/pages/function/room/CreateRoom.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./createroom.css";

export default function CreateRoom() {
  const navigate = useNavigate();
  const location = useLocation();

  const { room, chude, user, cauhoi } = location.state || {};

  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (!room || !chude || !user) return;

    // Thêm user hiện tại vào participants nếu chưa có
    if (!room.participants.some((p) => p._id === user.id)) {
      setParticipants([user, ...room.participants]);
    } else {
      setParticipants(room.participants);
    }
  }, [room, user]);

  if (!room || !chude || !user) {
    return <p>Không có dữ liệu phòng, vui lòng tạo lại từ Homepage.</p>;
  }

  const handleStart = () => {
    navigate("/play", { state: { room, chude, user, cauhoi } });
  };

  return (
    <div className="container">
      <div className="create-room">
        {/* Header */}
        <div className="room-header">
          <h2>Phòng thi: {chude.tenchude}</h2>
          <div className="pin-box">
            <span>Mã PIN:</span>
            <strong>{room.pin}</strong>
          </div>
        </div>

        {/* Room info */}
        <div className="room-info">
          <p><b>Tên phòng:</b> {room.tenroom}</p>
          <p><b>Trạng thái:</b> {room.status}</p>
        </div>

        {/* Participants */}
        <div className="participants">
          <h3>Người tham gia</h3>
          <ul>
            <li key="host"><b>Host:</b> {room.id_host?.username || "Unknown"}</li>
            {participants.length > 0 ? (
              participants
                .filter((p) => p.id !== room.id_host?._id) // bỏ host ra
                .map((p, index) => <li key={index}>{p.username || p.tenhienthi}</li>)
            ) : (
              <li>Chưa có ai tham gia.</li>
            )}
          </ul>
        </div>

        {/* Start button */}
        <button className="btn-start" onClick={handleStart}>
          Bắt đầu chơi
        </button>
      </div>
    </div>
  );
}
