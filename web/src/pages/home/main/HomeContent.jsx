import React, { useEffect, useCallback ,useState } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import jwt_decode from "jwt-decode";
import api from "../../token/check"
import "./HomeContent.css";  
function HomeContent(){
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation(); 
    
    const [chudes, setChudes] = useState([]);
    const [, setRoom] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20; // ✅ Số chủ đề mỗi trang
    const [searchTerm, setSearchTerm] = useState("");//tìm kiếm  
    
    const indexOfLast = currentPage * itemsPerPage;
     const indexOfFirst = indexOfLast - itemsPerPage;
    const filteredChudes = chudes.filter(chude =>
      chude.tenchude.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentChudes = filteredChudes.slice(indexOfFirst, indexOfLast);
     const totalPages = Math.ceil(chudes.length / itemsPerPage);

     
      // ✅ Phân trang
     
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
        }
      };
    
     // ✅ Check token với useCallback
  const Checktoken = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt_decode(token);
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
          console.log("Token đã hết hạn, đăng xuất...");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          console.log("Token hợp lệ, user:", decoded);
          setUser(decoded);
        }
      } catch (err) {
        console.log("Lỗi decode token:", err);
        localStorage.removeItem("token");
        setUser(null);
      }
    } else {
      console.log("Không có token trong localStorage");
      setUser(null);
    }
  }, [navigate]); // ✅ vì navigate là dependency

  // ✅ Lấy danh sách chủ đề với useCallback
  const fetchChude = useCallback(async () => {
    try {
      if (!user) return;
      const res = await api.get(`/topic/chude/${user._id || user.id}`);
      
      setChudes(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Lỗi lấy chủ đề:", err);
      setChudes([]);
    }
  }, [user]); // ✅ phụ thuộc vào user
    // ✅ useEffect đầu tiên: chỉ check token
  useEffect(() => {
    Checktoken();
  }, [Checktoken]);

  // ✅ useEffect thứ hai: chỉ gọi fetchChude khi user đã có
  useEffect(() => {
    if (user) {
      fetchChude();
    }
  }, [user, fetchChude]);  
  
  // ✅ Xóa 1 chủ đề cụ thể
  const handleDelete = async (chude) => {
    try {
      if (!user) return;
      if (!window.confirm(`Bạn có chắc muốn xoá chủ đề "${chude.tenchude}" không?`)) return;
      
      const res = await api.delete(`/topic/chude/${chude._id}`);
      
      if (res.status === 200) {
        alert("Đã xoá chủ đề thành công!");
        fetchChude(); // hoặc cập nhật lại danh sách nếu có hàm này
      }
    } catch (err) {
      console.error("Lỗi xoá chủ đề:", err);
      alert("Lỗi khi xoá chủ đề.");
    }
  };
  const handleStartQuiz = async (chude) => {
    if (!user) {
      alert("Vui lòng đăng nhập để chơi quiz!");
      navigate("/login");
      return;
    }

    try {
      const roomRes = await api.post("/topic/room", {
        id_host: user._id,
        id_chude: chude._id,
        tenroom: `Phòng - ${chude.tenchude}`,
      });
      const newRoom = roomRes.data;
      setRoom(newRoom);
      console.log("Phòng mới:", newRoom);

      const questionRes = await api.get(`/topic/cauhoi/${chude._id}`);
      const cauhoi = questionRes.data;
      console.log(`Câu hỏi của chủ đề ${chude.tenchude}:`, cauhoi);

      alert(`Phòng đã tạo cho chủ đề "${chude.tenchude}" với ${cauhoi.length} câu hỏi`);
      // navigate(`/room/${newRoom._id}`, { state: { room: newRoom, cauhoi } });
    } catch (err) {
      console.error("Lỗi tạo phòng hoặc lấy câu hỏi:", err);
      alert("Không thể tạo phòng hoặc lấy câu hỏi cho chủ đề này!");
    }
  };


    return (    
        <div>
            {/* ---------- MAIN CONTENT ---------- */}
            <section className="quiz-list">
            <h2 className="section-title">
                  <span className="section-icon"></span> Danh sách chủ đề của bạn :
                  <span>
                    <div className="create-topic">
                      <button
                        className={`btn btn-primary ${location.pathname.includes("create-topic") ? "active" : ""}`}
                        onClick={() => 
                          setTimeout(() => {
                          navigate(`/homeuser/${user?.id}/create-topic`);
                          },200)}
                      >
                        Tạo chủ đề và câu hỏi
                      </button>
                    </div>
                   </span>
          </h2>
            <div className="search-container">
              <input
                type="text"
                placeholder="🔍 Tìm kiếm chủ đề..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // reset về trang đầu khi tìm
                }}
                className="search-input"
              />
            </div>
            <div className="quiz-grid">
                {currentChudes.length > 0 ? (
                currentChudes.map((chude) => (
                    <div className="quiz-card" key={chude._id}>
                    <div className="quiz-content">
                        <h3 className="quiz-title">{chude.tenchude}</h3>
                        <p className="quiz-description">Loại: {chude.loaichude}</p>
                        <button
                        className="btn btn-primary"
                        onClick={() => handleStartQuiz(chude)}
                        >
                        Bắt đầu
                        </button>
                        <button
                        className="btn btn-primary"
                        onClick={() => handleDelete(chude)}
                        >
                        Xóa
                        </button>
                        <div className="quiz-meta">
                        <span>
                            Người tạo: {chude.user_id?.username || "Unknown"}
                        </span>
                        <span>Trạng thái: {chude.tinhtrang}</span>
                        </div>
                    </div>
                    </div>
                ))
                ) : (
                <p>Không có chủ đề nào để hiển thị.</p>
                )}
            </div>

            {/* ---------- Phân trang ---------- */}
            {totalPages > 1 && (
                <div className="pagination">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    ← Trước
                </button>

                {[...Array(totalPages)].map((_, index) => (
                    <button
                    key={index}
                    className={currentPage === index + 1 ? "active" : ""}
                    onClick={() => handlePageChange(index + 1)}
                    >
                    {index + 1}
                    </button>
                ))}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Sau →
                </button>
                </div>
            )}
            </section>
    </div>
    )
}

export default HomeContent;