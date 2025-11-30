import React, { useEffect, useState  } from "react";
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


  const [showSetting, setShowSetting] = useState(false);//hiện setting
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");//chủ đề sáng/tối
  
  
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
useEffect(() => {
    const token = localStorage.getItem("token");
   
    if (!token) {
        navigate("/login");
        return;
    }
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
        role: decoded.role,
        email: decoded.email
      };
      setUser(normalizedUser);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      console.log("Người dùng đã đăng nhập:", normalizedUser);  
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    api.get("/topic/chude")
      .then((res) => setChudes(res.data))
      .catch((err) => {
        console.error("Lỗi lấy chủ đề:", err);
        setChudes([]);
      });

  }, [user]);
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
  
  // ✅ Xóa localStorage phòng cũ
  localStorage.removeItem("currentRoom");
  localStorage.removeItem("currentQuiz");

  const payload = {
    id_room: Date.now().toString(),      // bắt buộc
    id_host: user._id,        // tuỳ bạn lưu gì
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

// 2️⃣ Xử lý Thi thử / Tạo phòng cài đặt
  const thithu = async (chude) => {
    try {
      if (!user || !user._id) {
        alert("Vui lòng đăng nhập để tham gia thi thử!");
        navigate("/login");
        return;
      }

      // Tạo phòng tạm thời trên server
      const payload = {
        id_room: Date.now().toString(),
        id_host: user._id,
        id_chude: chude._id,
        tenroom: `Phòng Thi thử - ${chude.tenchude}`, // Tên phòng đặc biệt
        // Có thể thêm cờ isMockTest: true vào payload nếu cần phân biệt trên server
      };

      console.log("Payload tạo phòng Thi thử:", payload);

      const roomRes = await api.post("/topic/room", payload);
      const newRoom = roomRes.data;
      setRoom(newRoom);
      console.log("Phòng Thi thử mới:", newRoom);
      
      // Lấy TẤT CẢ câu hỏi của chủ đề
      const questionRes = await api.get(`/topic/cauhoi/${chude._id}`);
      const cauhoi = questionRes.data || [];

      if (cauhoi.length === 0) {
        alert("Chủ đề này chưa có câu hỏi để thi thử!");
        return;
      }

      console.log(`Câu hỏi của chủ đề ${chude.tenchude}:`, cauhoi);

      // Điều hướng đến trang phòng, nơi host có thể cài đặt số lượng câu
      navigate("/room/createroom", { 
        state: { 
          room: newRoom, 
          chude, 
          user, 
          cauhoi,
          isMockTest: true // ✅ Cờ để trang createroom biết đây là Thi Thử
        } 
      }); 
    }
    catch (error) {
      console.error("Lỗi khi tham gia thi thử:", error);
      alert("Không thể tham gia thi thử, vui lòng thử lại!");
    }
  };
  // Thêm function kiểm tra PIN
const handleJoinWithPin = async () => {
  if (!pinInput.trim()) {
    alert("Vui lòng nhập mã PIN!");
    return;
  }

  if (!user || !user._id) {
    alert("Vui lòng đăng nhập để tham gia phòng!");
    navigate("/login");
    return;
  }

  try {
    const pin = pinInput.trim();
    // 1. Gọi API JOIN để lấy thông tin phòng
    // Server phải trả về room.questions và room.timeLimit
    const joinRes = await api.post(`/topic/room/join/${pin}`, { userId: user._id });
    const roomData = joinRes.data;

    if (!roomData) {
      alert("PIN không hợp lệ hoặc phòng đã kết thúc!");
      return;
    }
    
    // Kiểm tra và lấy thông tin chủ đề
    const chudeId = roomData.id_chude?._id || roomData.id_chude;
    let chudeData = roomData.id_chude; // Giả định server đã populate

    // Fallback: Nếu chủ đề chưa được populate, fetch thủ công
    if (!chudeData || !chudeData.tenchude) {
        const chudeRes = await api.get(`/topic/chude/${chudeId}`);
        chudeData = chudeRes.data;
    }

    // 2. Kiểm tra trạng thái phòng
    if (roomData.status === 'dangchoi' && roomData.questions?.length > 0) {
        
        // 🛑 PHÒNG ĐANG CHƠI: Chuyển thẳng đến trang Play
        
        const newLocationState = {
            room: roomData,
            user: user,
            chude: chudeData, // Thông tin chủ đề
            cauhoi: roomData.questions, // ✅ DÙNG DANH SÁCH CÂU HỎI ĐÃ CẮT/XÁO TRỘN TỪ SERVER
            startingTimeLimit: roomData.timeLimit // Giới hạn thời gian
        };

        localStorage.setItem("currentQuiz", JSON.stringify(newLocationState));
        navigate("/play", { state: newLocationState });
        
    } else {
        
        // 🔔 PHÒNG CHỜ/CHƯA BẮT ĐẦU: Chuyển đến Lobby (CreateRoom)
        
        // Đặt tên phòng hiển thị nếu chưa có
        roomData.tenroom = roomData.tenroom || `Phòng - ${chudeData.tenchude}`;

        const newLocationState = {
            room: roomData,
            chude: chudeData,
            user,
            cauhoi: roomData.questions || [], // Sẽ là mảng rỗng nếu chưa bắt đầu
        };

        // Điều hướng sang trang tạo phòng (CreateRoom) - Lobby
        navigate("/room/createroom", { state: newLocationState });
    }

  } catch (err) {
    console.error("Lỗi khi tham gia phòng bằng PIN:", err);
    alert(`Không thể tham gia phòng! ${err.response?.data?.message || err.message}`);
  }
};

// 🆕 NEW FUNCTION: Điều hướng đến trang cài đặt Multi-Topic
const handleGoToMultiTopicSetup = () => {
    if (!user || !user._id) {
      alert("Vui lòng đăng nhập để tạo phòng!");
      navigate("/login");
      return;
    }
    // Điều hướng với cờ isMultiTopicSetup để createroom biết cần hiển thị Modal cài đặt
    navigate("/room/createroom", { 
      state: { 
        user, 
        isMultiTopicSetup: true // Cờ mới
      } 
 });
};


  useEffect(() => {
      document.body.classList.toggle("dark-mode", theme === "dark");
    }, [theme]);
    
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };
  const availableTopics = chudes.filter(c => c.tinhtrang === "public");
  const maxQuestions = availableTopics.reduce((sum, chude) => sum + (chude.socaudung || 0), 0);
  return (
    
    <div className="homeuser-container">
     <div className="sidebar-wrapper">
        <div className="sidebar-trigger" />
        <div 
          className="sidebar"
          
          onMouseLeave={() => {
            document.querySelector(".sidebar").classList.remove("sidebar-active");
        
            document.querySelector(".sidebar-trigger-icon").classList.remove("icon-hidden");
          }}
        > 
          <ul>
            <li onClick={() => navigate(`/homeuser/${user?._id}`)}>🏠 Home</li>
            <li onClick={() => navigate(`/homeuser/${user?._id}/profile`)}>👤 Profile</li>
            <li onClick={() => navigate(`/homeuser/${user?._id}/history`)}>📜 History</li>
            <li onClick={() => setShowSetting(true)}>⚙️ Setting</li>
          </ul>
        </div>
        <div 
          className="sidebar-trigger-icon"
          // Khi chuột lia vào ICON (30px x 30px) thì mở sidebar
          onMouseEnter={() => {
            document.querySelector(".sidebar").classList.add("sidebar-active");
            // Khi mở sidebar, icon phải thụt vào
            document.querySelector(".sidebar-trigger-icon").classList.add("icon-hidden");
          }}
        >
          ☰
        </div>
      </div>
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
        onClick={() => navigate(`/homeuser/${user._id}`)} // đổi /profile thành route bạn muốn
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
          <button className="btn-join" onClick={handleJoinWithPin}>
            Tham gia phòng
          </button>
         
          <button className="btn-create"  onClick={handleGoToMultiTopicSetup}> 
           Tạo phòng 
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
                        <p className="quiz-description"></p>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleStartQuiz(chude)}
                        >
                          Ôn tập
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => thithu(chude)}
                        >
                          Thi thử
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

      {showModal && selectedChude  && (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>{selectedChude.tenchude}</h2>
          <p><strong>Loại:</strong> {selectedChude.loaichude}</p>
          <p><strong>Người tạo:</strong> {selectedChude.user_id?.username || "Không xác định"}</p>
          <p><strong>Ngày tạo:</strong> {new Date(selectedChude.ngaytao).toLocaleDateString()}</p>
          <p><strong>Trạng thái:</strong> {selectedChude.tinhtrang}</p>
          <p><strong>Ngành:</strong> {selectedChude.nganh}</p>
          <div className="modal-buttons">
          <button className="btn btn-primary" onClick={() => handleStartQuiz(selectedChude)}>
              Ôn tập
            </button>
            <button className="btn btn-primary" onClick={() => thithu(selectedChude)}>
              Thi thử
            </button>
            <button className="btn btn-secondary" onClick={closeModal}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    )}
        
            {showSetting && (
        <div className="modal-overlay" onClick={() => setShowSetting(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>⚙️ Cài đặt</h2>

            <div className="setting-item">
              <label>Giao diện:</label>
              <button className="btn btn-primary" onClick={toggleTheme}>
                Đổi sang {theme === "light" ? "Dark Mode 🌙" : "Light Mode ☀️"}
              </button>
            </div>

            <div className="setting-item">
              <label>Cỡ chữ:</label>
              <button className="btn btn-secondary">Nhỏ</button>
              <button className="btn btn-secondary">Vừa</button>
              <button className="btn btn-secondary">Lớn</button>
            </div>

            <div className="setting-item">
              <label>Thông báo:</label>
              <input type="checkbox" /> Bật thông báo
            </div>

            <button className="btn btn-danger" onClick={() => setShowSetting(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    
    </div>
  );
}

export default Homepage;
