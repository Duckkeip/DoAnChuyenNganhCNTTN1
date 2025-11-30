import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./createroom.css";
import { io } from "socket.io-client";
import api from "../../token/check";


const socket = io("http://localhost:5000");

const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
};
// 🔀 Hàm xáo trộn mảng (để đảm bảo câu hỏi được chọn ngẫu nhiên)
function shuffleArray(array) {
  return array
    .map(a => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map(a => a.value);
}
// 🔀 Hàm xáo trộn options bên trong câu hỏi
function shuffleOptions(options) {
    if (!options || options.length === 0) return [];
    return shuffleArray(options);
}

export default function CreateRoom() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1️⃣ Lấy state từ location hoặc localStorage
  let storedState = JSON.parse(localStorage.getItem("currentRoom") || "null");
  let locationState = location.state || storedState;

  const [participants, setParticipants] = useState(locationState?.room?.participants || []);

  // Khai báo các biến với Optional Chaining
  const room = locationState?.room;
  const chude = locationState?.chude;
  const user = locationState?.user;
  const fullCauhoi = locationState?.cauhoi || []; 
  
  // Cờ cho các loại phòng
  const isMockTest = locationState?.isMockTest || false; 
  const isMultiTopicSetup = locationState?.isMultiTopicSetup || false; // Cờ từ Homepage
  const isMultiTopic = locationState?.isMultiTopic || false; // Cờ cho phòng Multi-Topic đã tạo

  const userId = user?._id || user?.id;
  const hostId = room?.id_host?._id || room?.id_host?.id;
  const isHost = userId && hostId && userId === hostId;

  // 2️⃣ State cho giới hạn câu hỏi (chỉ dùng cho Thi thử/Multi-Topic)
  const [questionLimit, setQuestionLimit] = useState(fullCauhoi.length);
  const maxQuestions = fullCauhoi.length;
  
  // 🆕 NEW STATES FOR MULTI-TOPIC
  const [allTopics, setAllTopics] = useState([]); // Danh sách tất cả chủ đề để chọn
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);
  const [totalQuestionLimit, setTotalQuestionLimit] = useState(30); 
  const [isSetupLoading, setIsSetupLoading] = useState(false); // Loading state cho việc tạo phòng/fetch data

  const [gameTimeLimit, setGameTimeLimit] = useState(locationState?.room?.timeLimit || 600); // Default 10 minutes (600 seconds) 


  const isSetupInitialized = React.useRef(false); // Ngăn tạo phòng Multi-Topic trùng lặp
  const lastJoinedPin = React.useRef(null); // Ngăn joinRoom Socket trùng lặp
  // 3️⃣ Logic TẠO PHÒNG và Fetch Chủ đề nếu là Multi-Topic Setup ban đầu
  useEffect(() => {
      // Nếu là setup Multi-Topic lần đầu và chưa có dữ liệu phòng (chưa tạo)
      if (isMultiTopicSetup && !room && user && !isSetupInitialized.current) {
          isSetupInitialized.current = true; // x Đặt cờ 
          setIsSetupLoading(true);

          setIsSetupLoading(true);

          // 1. Fetch danh sách chủ đề
          api.get("/topic/chude")
              .then((res) => {
                  const publicTopics = res.data.filter(c => c.tinhtrang === "active");
                  
                  // FIX: Kiểm tra nếu không có chủ đề công khai nào
                  if (publicTopics.length === 0) {
                      setIsSetupLoading(false);
                      alert("Không có chủ đề công khai nào để tạo phòng Multi-Topic. Vui lòng tạo chủ đề trước.");
                      navigate(`/home/${userId}`);
                      return Promise.reject("No public topics available."); 
                  }


                  setAllTopics(publicTopics);

                  // Tính max questions ban đầu
                  const maxQ = publicTopics.reduce((sum, c) => sum + (c.socaudung || 0), 0);
                  setTotalQuestionLimit(Math.min(30, maxQ > 0 ? maxQ : 30));


                  // 2. Tạo phòng tạm thời trên server
                  // FIX: Đảm bảo luôn sử dụng một ObjectId hợp lệ (chủ đề đầu tiên)
                  const tempChudeId = publicTopics[0]._id; 
                  const payload = {
                      id_room: Date.now().toString(),
                      id_host: user._id,
                      id_chude: tempChudeId, 
                      tenroom: `Phòng Multi-Topic Setup`, 
                      status: "dangcho" 
                  };

                  return api.post("/topic/room", payload);
              })
              .then(roomRes => {
                  const newRoom = roomRes.data;
                  // 3. Cập nhật state và điều hướng (replace) để component re-render với dữ liệu phòng
                  const newLocationState = {
                      ...locationState,
                      room: newRoom,
                      user,
                      chude: { tenchude: "Multi-Topic Setup", _id: newRoom.id_chude },
                      isMultiTopic: true,
                      isMultiTopicSetup: false, // Tắt cờ setup ban đầu
                      cauhoi: [] 
                  };
                  localStorage.setItem("currentRoom", JSON.stringify(newLocationState));
                  
                  setIsSetupLoading(false);
                  navigate(location.pathname, { state: newLocationState, replace: true });

              })
              .catch(err => {
                 // Bắt lỗi khi Promise.reject("No public topics available.") được gọi
                 if (err !== "No public topics available.") { 
                    console.error("Lỗi tạo phòng Multi-Topic:", err);
                    alert("Không thể tạo phòng hoặc tải chủ đề. Vui lòng thử lại!");
                    setIsSetupLoading(false);
                    navigate(`/home/${userId}`);
                 }
              });
      } else if (isMultiTopic && room && !isSetupLoading && allTopics.length === 0) {
        // Trường hợp đã có phòng Multi-Topic (sau replace:true) nhưng chưa fetch topics
         api.get("/topic/chude")
            .then((res) => {
                const publicTopics = res.data.filter(c => c.tinhtrang === "public");
                setAllTopics(publicTopics);
            })
            .catch((err) => {
                console.error("Lỗi lấy tất cả chủ đề:", err);
            });
    }
  }, [isMultiTopicSetup, room, user, locationState, navigate, userId, isMultiTopic, isSetupLoading, allTopics.length]);


  useEffect(() => {
    // Socket logic chỉ chạy khi room tồn tại và không đang ở chế độ setup loading
    if (!room || isSetupLoading) return; 
    
    // Lưu phòng vào localStorage chỉ khi status là dangcho
    if (room.status === "dangcho") {
      localStorage.setItem("currentRoom", JSON.stringify(locationState));
    }

    // Thêm user nếu chưa có
    if (user && !participants.some(p => (p._id || p.id) === userId)) {
      setParticipants(prev => [user, ...prev]);
    }

    // Join room socket
    if (room.pin && lastJoinedPin.current !== room.pin) {
      socket.emit("joinRoom", room.pin);
      lastJoinedPin.current = room.pin; // 👈 Cập nhật PIN đã join
      console.log(`[Client] Joined room ${room.pin}`);
    }
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
  }, [room, user, participants, locationState, navigate, userId, isSetupLoading]);


// 🆕 FUNCTION: Xử lý chọn/bỏ chọn chủ đề
const handleTopicSelection = (chudeId) => {
  setSelectedTopicIds(prev =>
    prev.includes(chudeId)
      ? prev.filter(id => id !== chudeId)
      : [...prev, chudeId]
  );
};

// 🆕 FUNCTION: Xử lý KÍCH HOẠT phòng Multi-Topic sau khi chọn xong
const handleActivateMultiTopicRoom = async () => {
    if (!room || !user || !user._id) return;
    if (selectedTopicIds.length === 0) {
      alert("Vui lòng chọn ít nhất một chủ đề!");
      return;
    }
    const limit = parseInt(totalQuestionLimit);
    if (isNaN(limit) || limit <= 0) {
      alert("Số lượng câu hỏi không hợp lệ!");
      return;
    }
    // 🆕 Kiểm tra thời gian
    if (gameTimeLimit <= 0) {
        alert("Thời gian làm bài phải lớn hơn 0!");
        return;
    }
    setIsSetupLoading(true);

    // 1. Fetch tất cả câu hỏi từ các chủ đề đã chọn
    const chudePromises = selectedTopicIds.map(id => 
      api.get(`/topic/cauhoi/${id}`)
    );

    try {
      const results = await Promise.all(chudePromises);
      
      let questionsToSelect = [];
      let totalAvailableQuestions = 0;
      const questionsByTopic = {};

      // 2. Tổng hợp câu hỏi có sẵn
      results.forEach((res, index) => {
        const qList = (res.data || []).filter(q => q && q.noidung);
        questionsByTopic[selectedTopicIds[index]] = qList;
        totalAvailableQuestions += qList.length;
      });

      if (totalAvailableQuestions === 0) {
        alert("Không có câu hỏi nào trong các chủ đề đã chọn.");
        setIsSetupLoading(false);
        return;
      }

      const finalLimit = Math.min(limit, totalAvailableQuestions);
      
      // 3. Implement random selection (chia đều và xáo trộn)
      const numTopics = selectedTopicIds.length;
      const basePerTopic = Math.floor(finalLimit / numTopics);
      let remainder = finalLimit % numTopics;
      
      for (const id of selectedTopicIds) {
        const topicQ = questionsByTopic[id];
        
        let takeCount = basePerTopic;
        if (remainder > 0) {
          takeCount++; 
          remainder--;
        }
        
        if (topicQ.length > 0) {
          const shuffledTopicQ = shuffleArray(topicQ); 
          questionsToSelect.push(...shuffledTopicQ.slice(0, takeCount));
        }
      }
      
      const finalQuestions = shuffleArray(questionsToSelect);

      // 4. Update room details and prepare for Start
      const numTopicsFinal = selectedTopicIds.length; 
      
      // 5. Điều hướng host đến trang chờ với câu hỏi đã chọn
      room.status = "dangcho"; // Giữ nguyên dangcho cho đến khi host ấn Start

      const newLocationState = {
          ...locationState,
          room: { // Cập nhật tên phòng tạm thời
                ...room, 
                tenroom: `Phòng Multi-Topic (${numTopicsFinal} CD)`,
                timeLimit: gameTimeLimit // 🆕 Lưu thời gian tùy chỉnh
            },
          chude: { tenchude: `Multi-Topic (${numTopicsFinal} CD)`, _id: selectedTopicIds[0] },
          cauhoi: finalQuestions,
          isMultiTopic: true 
      };
      
      localStorage.setItem("currentRoom", JSON.stringify(newLocationState));
      setIsSetupLoading(false);

      // Điều hướng host đến trang chơi/chờ
      navigate(location.pathname, { 
          state: newLocationState,
          replace: true
      });

    } catch (err) {
        console.error("Lỗi khi kích hoạt phòng Multi-Topic:", err);
        alert("Không thể lấy câu hỏi và kích hoạt phòng. Vui lòng thử lại!");
        setIsSetupLoading(false);
    }
};


  const handleStart = async () => {
    if (!room || !chude) return; 

     // 🆕 Kiểm tra thời gian
    if (gameTimeLimit <= 0) {
        alert("Thời gian làm bài phải lớn hơn 0!");
        return;
    }

    let cauhoiToPlay = []

    // Thi thử hoặc Multi-Topic (đã có câu hỏi)
    if (isMockTest || (isMultiTopic && fullCauhoi.length > 0)) {
        const limit = isMockTest ? questionLimit : fullCauhoi.length;
        
        // Nếu là MockTest, cần xáo trộn và cắt theo questionLimit
        if (isMockTest) {
          const shuffledQuestions = shuffleArray(fullCauhoi);
          cauhoiToPlay = shuffledQuestions.slice(0, limit);
        } else { // isMultiTopic
          // Nếu là Multi-Topic, fullCauhoi đã là danh sách cuối cùng, chỉ cần xáo trộn
          cauhoiToPlay = shuffleArray(fullCauhoi);
        }
        
        if (cauhoiToPlay.length === 0) {
            alert("Không có câu hỏi nào để chơi.");
            return;
        }
        
        console.log(`✅ ${isMultiTopic ? 'Multi-Topic' : 'Thi thử'}: Chọn ${cauhoiToPlay.length} câu hỏi sau khi xáo trộn.`);

    } else {
        // Phòng Ôn tập: Lấy toàn bộ câu hỏi đã có, xáo trộn
        cauhoiToPlay = shuffleArray(fullCauhoi);
        console.log(`✅ Ôn tập: Dùng toàn bộ ${cauhoiToPlay.length} câu hỏi sau khi xáo trộn.`);
    }

    try {
        room.status = "dangchoi"; 

        socket.emit("startGame", { pin: room.pin, cauhoi: cauhoiToPlay , timeLimit: gameTimeLimit });
        localStorage.removeItem("currentRoom");
        
        navigate("/play", { 
            state: { 
                ...locationState, 
                cauhoi: cauhoiToPlay,
                room: {
                    ...room,
                    timeLimit: gameTimeLimit // 🆕 Truyền timeLimit vào state
                }
            } 
        });
    } catch (error) {
        console.error("Lỗi khi bắt đầu trò chơi:", error);
        alert("Không thể bắt đầu trò chơi. Vui lòng thử lại!");
    }
  };

  // Trường hợp Loading, hoặc chưa có phòng, hoặc thiếu dữ liệu Host
  if (!room || !chude || isSetupLoading || (isMultiTopicSetup && !user)) {
     if (isSetupLoading) {
        return <p style={{textAlign: 'center', padding: '50px'}}>Đang tạo phòng và tải danh sách chủ đề...</p>;
     }
     if (isMultiTopicSetup && !user) {
         return <p style={{textAlign: 'center', padding: '50px'}}>Vui lòng đăng nhập để tạo phòng Multi-Topic.</p>
     }
     // Dùng cho trường hợp lỗi data hoặc người dùng truy cập trực tiếp
     if (!isMultiTopicSetup && !room) {
        return <p style={{textAlign: 'center', padding: '50px'}}>Không có dữ liệu phòng hợp lệ, vui lòng tạo lại phòng từ Homepage.</p>;
     }
     return <p style={{textAlign: 'center', padding: '50px'}}>Đang chờ dữ liệu phòng...</p>
  }


  // 🆕 Kiểm tra trạng thái cần Setup Multi-Topic
  const isPendingMultiTopicSetup = isMultiTopic && fullCauhoi.length === 0;


  // 🆕 Giao diện Setup Multi-Topic tích hợp vào màn hình phòng chờ (Chỉ Host thấy)
  if (isHost && isPendingMultiTopicSetup && room.status === "dangcho") {
      const minutesLimit = Math.ceil(gameTimeLimit / 60);
      const totalAvailableQuestions = allTopics.reduce((sum, c) => sum + (c.socaudung || 0), 0);

      return (
          <div className="container">
              <div className="create-room multi-topic-setup-panel">
                  <div className="room-header">
                      <h2>Phòng Multi-Topic Setup: {room.tenroom}</h2>
                      <div className="pin-box">
                          <span>Mã PIN:</span>
                          <strong>{room.pin}</strong>
                      </div>
                  </div>
                   <p style={{marginBottom: '20px'}}>Bạn đang ở giao diện cài đặt phòng Multi-Topic. Vui lòng chọn chủ đề và số lượng câu hỏi trước khi bắt đầu.</p>
                  
                  <div className="settings-section">
                      <h3> Cài đặt </h3>
                         {/* 🆕 Time Limit Input for Multi-Topic */}
                        <div className="setting-control" style={{ marginBottom: '15px' }}>
                            <label htmlFor="timeLimitMT">Thời gian làm bài (phút):</label>
                            <input
                                id="timeLimitMT"
                                type="number"
                                min="1"
                                value={minutesLimit}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1;
                                    const seconds = Math.max(60, val * 60); // Min 1 minute (60s)
                                    setGameTimeLimit(seconds);
                                }}
                                className="input-limit"
                            />
                            <p style={{ marginTop: '5px', fontSize: 'small' }}>Khoảng {formatTime(gameTimeLimit)}</p>
                        </div>
                      <div className="setting-control" style={{marginBottom: '15px'}}>
                          <label htmlFor="limit">Số lượng câu hỏi (tối đa):</label>
                          <input
                              id="limit"
                              type="number"
                              min="1"
                              max={totalAvailableQuestions > 0 ? totalAvailableQuestions : 9999}
                              value={totalQuestionLimit}
                              onChange={(e) => {
                                  const maxQ = totalAvailableQuestions;
                                  const val = Math.min(Math.max(1, parseInt(e.target.value) || 1), maxQ > 0 ? maxQ : 9999);
                                  setTotalQuestionLimit(val);
                              }}
                              className="input-limit"
                          />
                      </div>
                      {/* FIX: Chỉ hiển thị cảnh báo khi đã tải xong danh sách chủ đề nhưng tổng số câu hỏi bằng 0. */}
                      {(allTopics.length > 0 && totalAvailableQuestions === 0) && (
                          <p style={{color: 'red'}}></p>
                      )}
                  </div>

                  <div className="topic-selection-list">
                      <h3>2. Chọn Chủ đề ({selectedTopicIds.length} đã chọn)</h3>
                      <div className="topic-grid">
                      {allTopics.length > 0 ? (
                          allTopics.map(chudeItem => (
                              <div
                                  key={chudeItem._id}
                                  className={`topic-item ${selectedTopicIds.includes(chudeItem._id) ? 'selected' : ''}`}
                                  onClick={() => handleTopicSelection(chudeItem._id)}
                              >
                                  {chudeItem.tenchude} 
                                  <span className="topic-count"></span>
                              </div>
                          ))
                      ) : (
                          <p>Đang tải danh sách chủ đề công khai...</p>
                      )}
                      </div>
                  </div>

                  <div className="action-buttons">
                      <button 
                          className="btn-start" 
                          onClick={handleActivateMultiTopicRoom}
                          disabled={selectedTopicIds.length === 0 || parseInt(totalQuestionLimit) <=  0 || gameTimeLimit <= 0}
                      >
                          Kích hoạt phòng ({totalQuestionLimit} câu)
                      </button>
                      {/* Nút Hủy */}
                      <button 
                         className="btn-secondary" 
                         onClick={() => navigate(`/home/${userId}`)}
                         style={{marginTop: '10px'}}
                     >
                         Hủy và Quay lại
                     </button>
                  </div>
              </div>
          </div>
      );
  }


 // Giao diện phòng chờ thông thường (Ôn tập, Thi thử, hoặc Multi-Topic đã thiết lập)
 return (
    <div className="container">
      <div className="create-room">
        <div className="room-header">
          <h2>
            Phòng {isMockTest ? "Thi thử" : isMultiTopic ? "Multi-Topic" : "Ôn tập"}: 
            {chude.tenchude}
          </h2>
          <div className="pin-box">
            <span>Mã PIN:</span>
            <strong>{room.pin}</strong>
          </div>
        </div>

        <div className="room-info">
          <p><b>Tên phòng:</b> {room.tenroom}</p>
          <p><b>Tổng câu hỏi đã chọn:</b> {maxQuestions} câu</p>
          <p><b>Trạng thái:</b> {room.status}</p>
        </div>
        
        {/* Giao diện setting số lượng câu hỏi (chỉ cho Thi thử) */}
        {isHost && isMockTest && maxQuestions > 0 && (
            <div className="settings-section">
                <h3>Cài đặt bài Thi thử</h3>
                <label htmlFor="limit">Số lượng câu hỏi:</label>
                <input
                    id="limit"
                    type="number"
                    min="1"
                    max={maxQuestions}
                    value={questionLimit}
                    onChange={(e) => {
                        const val = Math.min(Math.max(1, parseInt(e.target.value) || 1), maxQuestions);
                        setQuestionLimit(val);
                    }}
                />
                <p style={{marginTop: '5px', fontSize: 'small'}}>Tối đa: {maxQuestions} câu</p>
            </div>
        )}

        <div className="participants">
          <h3>Người tham gia</h3>
          <ul>
            <li key="host"><b>Host:</b> {room.id_host?.username || "Unknown"}</li>
            {participants
              .filter(p => p && (p._id || p.id) !== hostId) 
              .map((p, i) => <li key={i}>{p.username || p.tenhienthi}</li>)
            }
          </ul>
        </div>

        {isHost ? (
          room.status === "dangcho" ? (
            <button 
                className="btn-start" 
                onClick={handleStart}
                disabled={isMockTest && questionLimit === 0}
            >
                Bắt đầu chơi
            </button>
          ) : (
            <p>⏳ Phòng đang chơi...</p>
          )
        ) : (
          <p>⏳ Chờ host bắt đầu...</p>
        )}
      </div>
    </div>
  );
}