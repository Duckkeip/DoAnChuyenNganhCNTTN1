import React, { useEffect, useState } from "react";
import api from "../token/check"; // axios instance
import "./Admin.css";

function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    topics: 0,
  });

  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats"); // API trả về { users: xx, topics: xx }
        setStats(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy thống kê", error);
      }
    };

    const fetchTopics = async () => {
      try {
        const res = await api.get("/topic/chude"); // API trả về danh sách chủ đề
        setTopics(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy chủ đề", error);
      }
    };

    fetchStats();
    fetchTopics();
  }, []);

  // Các hàm thao tác chủ đề
  const handleApprove = (id) => {
    alert("Duyệt chủ đề: " + id);
    // TODO: Gọi API để duyệt
  };

  const handleCancel = (id) => {
    alert("Huỷ chủ đề: " + id);
    // TODO: Gọi API để huỷ
  };

  const handleViewQuestions = (id) => {
    alert("Xem câu hỏi chủ đề: " + id);
    // TODO: Chuyển sang trang danh sách câu hỏi theo chủ đề
  };

  const handleEdit = (id) => {
    alert("Sửa chủ đề: " + id);
    // TODO: Chuyển sang trang sửa chủ đề
  };
  const handleDetail = (id) => {
    alert("Xem chi tiết " + id);
    // TODO: Chuyển sang trang sửa chủ đề
  };
  return (
    <div className="dashboard-container">
      <h2>📊 Thống kê tổng quan</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>👥 Người dùng</h3>
          <p>{stats.users}</p>
        </div>
        <div className="stat-card">
          <h3>📚 Chủ đề</h3>
          <p>{stats.topics}</p>
        </div>
      </div>

      <section style={{ marginTop: "30px" }}>
        <h2>📝 Quản lý Chủ đề</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên chủ đề</th>
              <th>Loại</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic, idx) => (
              <tr key={topic._id}>
                <td>{idx + 1}</td>
                <td>{topic.tenchude}</td>
                <td>{topic.loaichude}</td>
                <td>{new Date(topic.ngaytao).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleApprove(topic._id)}>Duyệt</button>{" "}
                  <button onClick={() => handleCancel(topic._id)}>Huỷ</button>{" "}
                  <button onClick={() => handleViewQuestions(topic._id)}>Xem câu hỏi</button>{" "}
                  <button onClick={() => handleEdit(topic._id)}>Sửa</button>
                  <button onClick={() => handleDetail(topic._id)}>Xem chi tiết</button>
                  
                </td>
              </tr>
            ))}
            {topics.length === 0 && (
              <tr>
                <td colSpan="5">Không có chủ đề nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Dashboard;
