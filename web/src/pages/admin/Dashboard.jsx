import React, { useEffect, useState } from "react";
import api from "../token/check"; // axios instance
import "./Admin.css";
function Dashboard() {
  const [stats, setStats] = useState({ users: 0, topics: 0 });
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]); // câu hỏi của chủ đề hiện tại

  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const [currentTopic, setCurrentTopic] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState({ 
    noidung: "",
     dapan_a: "", 
     dapan_b: "",
      dapan_c: "",
       dapan_d: "",
        dapandung: "",
        mucdo:""
     });

  
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
        console.log(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy chủ đề", error);
      }
    };

    fetchStats();
    fetchTopics();
  }, []);

  // Các hàm thao tác chủ đề
  const handleApprove = (id) => {alert("Duyệt chủ đề: " + id);};// TODO: Gọi API để duyệt 
  const handleCancel = (id) => {alert("Huỷ chủ đề: " + id);}; // TODO: Gọi API để huỷ
  
  const handleDetail = async (topic) => {
    try {
      const res = await api.get(`/admin/questions/${topic._id}`); // API lấy câu hỏi theo chủ đề
      setQuestions(res.data);
      setCurrentTopic(topic);
      setShowDetailModal(true);
      
    } catch (err) {
      console.error("Lỗi khi lấy câu hỏi", err);
    }
  };

  const handleEdit = (question) => {
    console.log("Sửa câu hỏi:", question);
    
    const correctLetters = ['A', 'B', 'C', 'D'];
    const correctLetter = correctLetters[question.correct] || 'A'; 
    
    setEditedQuestion({
        _id: question._id || "",
        noidung: question.noidung || "",
      
        dapan_a: question.options?.[0]?.text || "", 
        dapan_b: question.options?.[1]?.text || "", 
        dapan_c: question.options?.[2]?.text || "", 
        dapan_d: question.options?.[3]?.text || "", 
        dapandung: correctLetter, // Sử dụng giá trị đã chuyển đổi
        mucdo: question.mucdo || "easy"
      });
    };

  const saveEditedQuestion = async () => {
    if (!editedQuestion?._id) return;
  
    try {
      const res = await api.put(`/topic/cauhoi/${editedQuestion._id}`, editedQuestion);
      alert(res.data.message || "Cập nhật thành công!");
  
      // Cập nhật trong state local
      setQuestions((prev) =>
        prev.map((q) => (q._id === editedQuestion._id ? { ...q, ...editedQuestion } : q))
      );
  
      // Ẩn form sửa
      setEditedQuestion(null);
  
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại!");
    }
  };
  // 🆕 Thêm hàm xử lý xóa câu hỏi
  const handleDelete = async (questionId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
      return;
    }

    try {
      // 🛑 SỬA TẠI ĐÂY: Thay đổi đường dẫn thành '/admin/questions/:id'
      const res = await api.delete(`/admin/questions/${questionId}`); 
      alert(res.data.message || "Xóa câu hỏi thành công!");

      // Cập nhật state local: lọc bỏ câu hỏi đã xóa
      setQuestions((prev) => prev.filter((q) => q._id !== questionId));

      // Đóng form sửa nếu câu hỏi đang được sửa
      if (editedQuestion?._id === questionId) {
        setEditedQuestion(null);
      }
    } catch (err) {
      console.error("Lỗi khi xóa câu hỏi:", err);
      alert("Xóa câu hỏi thất bại!");
    }
  };
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setQuestions([]);
    setCurrentTopic(null);
    setEditedQuestion(null); // reset form sửa luôn
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
                  <button onClick={() => handleApprove(topic)}></button>{" "}
                  <button onClick={() => handleCancel(topic)}>Xoá</button>{" "}
                   <button onClick={() => handleDetail(topic)}>Xem chi tiết</button>
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
{/* Modal hiển thị câu hỏi */}
{showDetailModal && currentTopic && (
  <div className="modal-overlay">
    <div className="modal-content modal-detail">
      <div className="modal-header">
        <h3>Câu hỏi của chủ đề: {currentTopic?.tenchude}</h3>
        <button className="close-btn" onClick={closeDetailModal}>✖</button>
      </div>

      <div className="modal-body">
        {questions.length > 0 ? (
          <table className="question-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Nội dung</th>
                <th>A</th>
                <th>B</th>
                <th>C</th>
                <th>D</th>
                <th>Đáp án đúng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
                {questions.map((q, idx) => (
                    <tr key={q._id}>
                    <td>{idx + 1}</td>
                    <td>{q.noidung}</td>
                    <td>{q.dapan_a}</td>
                    <td>{q.dapan_b}</td>
                    <td>{q.dapan_c}</td>
                    <td>{q.dapan_d}</td>
                    <td>{q.dapandung}</td>
                    <td>
                        <button onClick={() => handleEdit(q)}>✏ Sửa</button>
                        <button 
                            onClick={() => handleDelete(q._id)} 
                            style={{ marginLeft: '5px', backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            🗑 Xoá
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
          </table>
        ) : (
          <p>Chưa có câu hỏi nào.</p>
        )}
          </div>
        </div>
            {/* 🟩 Modal con cho sửa câu hỏi */}
        {editedQuestion && (
          <div className="modal-overlay inner-modal">
            <div className="modal-content edit-modal">
              <div className="modal-header">
                <h4>✏ Sửa câu hỏi</h4>
                <button className="close-btn" onClick={() => setEditedQuestion(null)}>✖</button>
              </div>

              <div className="modal-body">
                {["noidung", "dapan_a", "dapan_b", "dapan_c", "dapan_d"].map((field) => (
                  <div className="form-group" key={field}>
                    <label>
                      {field === "noidung" ? "Nội dung" : `Đáp án ${field.slice(-1).toUpperCase()}`}:
                    </label>
                    <input
                      type="text"
                      value={editedQuestion[field]}
                      onChange={(e) =>
                        setEditedQuestion({ ...editedQuestion, [field]: e.target.value })
                      }
                    />
                  </div>
                ))}

                <div className="form-group">
                  <label>Đáp án đúng:</label>
                  <select
                    value={editedQuestion.dapandung}
                    onChange={(e) =>
                      setEditedQuestion({ ...editedQuestion, dapandung: e.target.value })
                    }
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer" style={{ textAlign: "right" }}>
                <button className="save-btn" onClick={saveEditedQuestion}>💾 Lưu</button>{" "}
                <button className="cancel-btn" onClick={() => setEditedQuestion(null)}>❌ Huỷ</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )}

    </div>
  );
}

export default Dashboard;
