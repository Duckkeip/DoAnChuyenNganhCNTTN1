import React, { useEffect, useState  ,useCallback } from "react";
import api from "../token/check";
import { useNavigate} from "react-router-dom";
import "./Homeuser.css";
import jwt_decode from "jwt-decode";
function Homepage() {
  const [user, setUser] = useState(null);
  const [chudes, setChudes] = useState([]);
  const navigate = useNavigate();// chuyển hướng
  
  const [currentPage, setCurrentPage] = useState(1);//phân trang
  const [, setRoom] = useState(null);// tạo phòng 
  const [selectedChude, setSelectedChude] = useState(null);//chọn chủ đề 
  const [showModal, setShowModal] = useState(false);//hộp thoại chi tiết 
  const [searchTerm, setSearchTerm] = useState("");//tìm kiếm  

  const [pinInput, setPinInput] = useState("");//mã PIN

  
  const itemsPerPage = 20; // ✅ Số chủ đề mỗi trang
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const filteredChudes = chudes.filter(chude =>
  chude.tenchude.toLowerCase().includes(searchTerm.toLowerCase())
);

  const currentChudes = filteredChudes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(chudes.length / itemsPerPage);
  
       
    
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
        }
      };
    const handleDetail = (chude) => {
      setSelectedChude(chude);
      setShowModal(true);
    };
    const closeModal = () => {
      setShowModal(false);
      setSelectedChude(null);
    };

  const Checktoken = useCallback(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("Không có token trong localStorage");
        setUser(null);
        return;
      }
  
      try {
        const decoded = jwt_decode(token);
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
          console.log("Token hết hạn, đăng xuất...");
          localStorage.removeItem("token");
          setUser(null);
          navigate("/login");
        } else {
          console.log("Token hợp lệ():", decoded);
          setUser(decoded);
        }
      } catch (err) {
        console.log("Lỗi decode token:", err);
        localStorage.removeItem("token");
        setUser(null);
      }
    }, [navigate]);
  
    // ✅ useEffect chỉ chạy 1 lần
    useEffect(() => {
      Checktoken();
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }, [Checktoken]); // ✅ thêm dependency hợp lệ


  useEffect(() => {
    api.get("/topic/chude")
      .then((res) => setChudes(res.data))
      .catch((err) => {
        console.error("Lỗi lấy chủ đề:", err);
        setChudes([]);
      });

  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    console.log("Đã đăng xuất!");
    navigate("/home");
  };

  const handleStartQuiz = async (chude) => {
  if (!user) {
    alert("Vui lòng đăng nhập để chơi quiz!");
    navigate("/login");
    return;
  }

  const payload = {
    id_room: Date.now().toString(),      // bắt buộc
    id_host: user.id,        // tuỳ bạn lưu gì
    id_chude: chude._id,
    tenroom: `Phòng - ${chude.tenchude}`
  };

  console.log("Payload tạo phòng:", payload);

  try {
    const roomRes = await api.post("/topic/room", payload);
    const newRoom = roomRes.data;
    setRoom(newRoom);
    console.log("Phòng mới:", newRoom);

    const questionRes = await api.get(`/topic/cauhoi/${chude._id}`);
    const cauhoi = questionRes.data;
    console.log(`Câu hỏi của chủ đề ${chude.tenchude}:`, cauhoi);

    alert(`Phòng đã tạo cho chủ đề "${chude.tenchude}" với ${cauhoi.length} câu hỏi`);
      navigate("/room/createroom", { state: { room: newRoom, chude, user, cauhoi } });
  } catch (err) {
    console.error("Lỗi tạo phòng hoặc lấy câu hỏi:", err);
    alert("Không thể tạo phòng hoặc lấy câu hỏi cho chủ đề này!");
  }
};


  // Thêm function kiểm tra PIN
const handleJoinWithPin = async () => {
  if (!pinInput.trim()) {
    alert("Vui lòng nhập mã PIN!");
    return;
  }

  if (!user || !user.id) {
    alert("Vui lòng đăng nhập để tham gia phòng!");
    navigate("/login");
    return;
  }

  try {
    const pin = pinInput.trim();

    // 🧩 Gọi API JOIN để thêm người chơi vào participants
    const joinRes = await api.post(`/topic/room/join/${pin}`, { userId: user.id });
    const roomData = joinRes.data;

    if (!roomData) {
      alert("PIN không hợp lệ hoặc phòng đã kết thúc!");
      return;
    }

    // 🧩 Kiểm tra id_chude có tồn tại không
    if (!roomData.id_chude || !roomData.id_chude._id) {
      console.error("Không thể lấy ID chủ đề từ roomData:", roomData.id_chude);
      alert("Lỗi dữ liệu phòng, vui lòng thử lại!");
      return;
    }

    const chudeId = roomData.id_chude._id;

    // 🧩 Lấy chủ đề
    const chudeRes = await api.get(`/topic/chude/${chudeId}`);
    const chudeData = chudeRes.data;

    if (!chudeData) {
      alert("Không thể lấy thông tin chủ đề!");
      return;
    }

    // 🧩 Lấy câu hỏi theo chủ đề
    const questionRes = await api.get(`/topic/cauhoi/${chudeId}`);
    const cauhoi = questionRes.data || [];

    // 🧩 Đặt tên phòng hiển thị nếu chưa có
    roomData.tenroom = roomData.tenroom || `Phòng - ${chudeData.tenchude}`;

    console.log("Người chơi tham gia phòng:", { roomData, chudeData, cauhoi });

    // 🧩 Điều hướng sang trang tạo phòng (CreateRoom)
    navigate("/room/createroom", {
      state: {
        room: roomData,
        chude: chudeData,
        user,
        cauhoi,
      },
    });
  } catch (err) {
    console.error("Lỗi khi tham gia phòng bằng PIN:", err);
    alert("Không thể tham gia phòng, vui lòng thử lại!");
  }
};


  return (
    <div className="homeuser-container">
      <header>
        <div className="logo">
           <span className="logo-icon">🧠</span>
          <span>Quizz Game</span>
        </div>
       
  <div className="user-section">
    {user ? (
      <>
      {/* Icon người dùng */}
      <span
        className="user-icon"
        onClick={() => navigate(`/homeuser/${user.id}`)} // đổi /profile thành route bạn muốn
        style={{ cursor: "pointer", marginRight: "8px" }}
        title="Xem thông tin cá nhân"
      >
        👤
      </span>

      <span className="user-greeting">
        Xin chào, {user?.tenhienthi || user?.username}!
      </span>

      <button className="btn btn-danger" onClick={handleLogout}>
        Đăng xuất
      </button>
    </>
    ) : (
      <>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/login")}
        >
          Đăng nhập
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/register")}
        >
          Đăng ký
        </button>
      </>
    )}
  </div>
</header>

      <section className="quiz-list">
          <h2>🔥 Chủ đề nổi bật</h2>
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
        <div className="join-pin-container">
          <input
            type="text"
            placeholder="Nhập mã PIN phòng..."
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
          />
          <button className="btn btn-success" onClick={handleJoinWithPin}>
            Tham gia phòng
          </button>
        </div>
          <div className="quiz-grid">
                {currentChudes.length > 0 ? (
                currentChudes.map((chude) => {
                  const isMatched =
                    searchTerm &&
                    chude.tenchude.toLowerCase().includes(searchTerm.toLowerCase());

                  return (
                    <div
                      className={`quiz-card ${isMatched ? "highlight" : ""}`}
                      key={chude._id}
                    >
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
                          onClick={() => handleDetail(chude)}
                        >
                          Xem Thông tin
                        </button>
                        <div className="quiz-meta">
                          <span>
                            Người tạo: {chude.user_id?.username || "Unknown"}
                          </span>
                          <span>Trạng thái: {chude.tinhtrang}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
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
      
      {/* ---------- FOOTER ---------- */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-logo">🧠 Quizz Game</span>
            <p>
              Học mà chơi, chơi mà học — cùng khám phá kiến thức mỗi ngày!
            </p>
          </div>

          <div className="footer-right">
            <a
              href="https://github.com/Duckkeip"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.facebook.com/man.huy.18062"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
            <a href="mailto:support@quizzgame.com">Liên hệ</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Quizz Game. All rights reserved.</p>
        </div>
      </footer>

      {showModal && selectedChude && (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>{selectedChude.tenchude}</h2>
          <p><strong>Loại:</strong> {selectedChude.loaichude}</p>
          <p><strong>Người tạo:</strong> {selectedChude.user_id?.username || "Không xác định"}</p>
          <p><strong>Ngày tạo:</strong> {new Date(selectedChude.ngaytao).toLocaleDateString()}</p>
          <p><strong>Trạng thái:</strong> {selectedChude.tinhtrang}</p>

          <div className="modal-buttons">
            <button className="btn btn-primary" onClick={() => navigate("/login")}>
              Bắt đầu
            </button>
            <button className="btn btn-secondary" onClick={closeModal}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

export default Homepage;
