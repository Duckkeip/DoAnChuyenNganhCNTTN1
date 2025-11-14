import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../token/check";
import jwt_decode from "jwt-decode";
import "./rank.css"
export default function Ranking() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { id_chude } = location.state || {};
  const idChudeString = typeof id_chude === "object" ? id_chude._id : id_chude;
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

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
      // Chuẩn hóa user
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
  if (!id_chude) return;

  const fetchRankings = async () => {
    try {
      const res = await api.get(`/rank/xephang`);

      // Lọc theo chủ đề
      const filtered = res.data.filter(
        (x) => String(x.id_chude?._id) === idChudeString
      );

      // Sắp xếp theo điểm giảm dần
      filtered.sort((a, b) => b.diem - a.diem);

      // Loại trùng user, chỉ giữ bản ghi cao nhất
      const uniqueByUser = Object.values(
        filtered.reduce((acc, curr) => {
          const userId = curr.user_id?._id;
          if (!acc[userId] || curr.diem > acc[userId].diem) {
            acc[userId] = curr;
          }
          return acc;
        }, {})
      );

      setRankings(uniqueByUser);
      setLoading(false);

      console.log("📥 id_chude trong state:", id_chude);
      console.log("📊 Dữ liệu rank nhận được:", res.data);
      console.log("✅ Bảng xếp hạng sau khi loại trùng:", uniqueByUser);
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
      <h2>Bảng xếp hạng người chơi chủ đề này </h2>
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
        onClick={() => navigate(`/home/${user._id}`)}
      >
        ⬅️ Về trang chủ
      </button>
    </div>
  );
}
