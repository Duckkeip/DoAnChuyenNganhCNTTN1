import React, { useEffect, useState ,useCallback} from "react";
import { useNavigate,useParams } from "react-router-dom";
import jwt_decode from "jwt-decode";
import api from "../../token/check"; // axios instance đã setup token
import "./history.css";

export default function History() {
    const [user, setUser] = useState(null);
    const { id } = useParams(); // id user từ route giống Profile
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();// chuyển hướng
    const [selectedDetail, setSelectedDetail] = useState(null); // id ketqua được chọn


   
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
           _id: decoded.id,
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
    if (!id) return;

    const fetchHistory = async () => {
      try {
        const res = await api.get(`/result/${id}`); // backend lấy ketqua theo user_id
        if (res.data.success) {
          setHistory(res.data.results);
        }
      } catch (err) {
        console.error("Lỗi lấy lịch sử:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  if (loading) return <p>⏳ Đang tải lịch sử...</p>;
  if (!history.length) return <p>❌ Chưa có kết quả nào.</p>;

  
   return (
    <div className="history-container">
      <h2>Lịch sử chơi của bạn</h2>
      <table className="history-table">
        <thead>
          <tr>
            <th>Chủ đề</th>
            <th>Điểm</th>
            <th>Đúng/Sai</th>
            <th>Ngày làm</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <tr key={item._id}>
              <td>{item.id_chude?.tenchude || "Không xác định"}</td>
              <td>{item.tong_diem}</td>
              <td>{item.cau_dung} / {item.tong_cau}</td>
              <td>{new Date(item.ngay_lam).toLocaleString("vi-VN")}</td>
              <td>
                <button onClick={() => setSelectedDetail(item)}>Xem chi tiết</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal chi tiết */}
      {selectedDetail && (
        <div className="modal-overlay" onClick={() => setSelectedDetail(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Chi tiết câu trả lời</h3>
            <button className="modal-close" onClick={() => setSelectedDetail(null)}>✖</button>
            <table className="detail-table">
              <thead>
                <tr>

                  <th>Nội dung câu hỏi</th>
                  <th>Đáp án chọn</th>
                  <th>Đúng/Sai</th>
                </tr>
              </thead>
              <tbody>
                {selectedDetail.dapAnDaChon.map((d, i) => (
                  <tr key={i}>
                    
                    <td>{d.noidung}</td>
                    <td>{d.dapan_chon || "Chưa chọn"}</td>
                    <td>{d.dung ? "✅" : "❌"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}