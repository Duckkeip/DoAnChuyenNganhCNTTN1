import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../token/check";


export default function Ranking() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { id_chude } = location.state || {}; // truyền id_chude từ Play.jsx

  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id_chude) return;
    const fetchRankings = async () => {
      try {
        const res = await api.get(`/ketqua`);
        // Lọc theo chủ đề và sắp xếp giảm dần
        const filtered = res.data
          .filter((kq) => kq.id_chude?._id === id_chude)
          .sort((a, b) => b.diem - a.diem);
        setRankings(filtered);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi tải bảng xếp hạng:", err);
        setLoading(false);
      }
    };
    fetchRankings();
  }, [id_chude]);

  if (loading) return <p>⏳ Đang tải bảng xếp hạng...</p>;
  if (!rankings.length) return <p>❌ Chưa có ai thi chủ đề này!</p>;

  return (
    <div className="ranking">
      <h2>Bảng xếp hạng</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Hạng</th>
            <th>Người chơi</th>
            <th>Điểm</th>
            <th>Đúng</th>
            <th>Tổng câu hỏi</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((r, idx) => (
            <tr key={r._id}>
              <td>{idx + 1}</td>
              <td>{r.user_id?.username || "Unknown"}</td>
              <td>{r.diem}</td>
              <td>{r.socaudung}</td>
              <td>{r.tongcauhoi}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        style={{ marginTop: "20px" }}
        onClick={() => navigate(`home/${user.id}`)}
      >
        ⬅️ Về trang chủ
      </button>
    </div>
  );
}
