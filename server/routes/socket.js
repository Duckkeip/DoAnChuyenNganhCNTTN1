const Quizzuser = require("../models/Quizzuser");   
// ================= SOCKET.IO =================

module.exports = (io) => {
  io.on("connection", (socket) => {
  console.log("⚡️ Client connected:", socket.id);


  // Join room theo PIN
  socket.on("joinRoom", (roomPin) => {
    socket.join(roomPin);
    console.log(`Socket ${socket.id} joined room ${roomPin}`);
  });
  // Update participants (client emit)
  socket.on("updateParticipants", ({ pin, participants }) => {
    io.to(pin).emit("updateParticipants", participants);
  });

  // 🛑 FIX LỖI START GAME (Nhận object data & Cập nhật DB)
  socket.on("startQuiz", async (data) => { 
    const { pin, questions, timeLimit } = data; // 🆕 Lấy các trường từ object data
    
    // Log đúng PIN
    console.log(`Game started in room ${pin}`); 
    
    try {
        // 1. Cập nhật trạng thái, câu hỏi, và giới hạn thời gian vào database
        await Quizzuser.findOneAndUpdate(
            { pin: pin }, 
            { 
                status: "dangchoi", 
                questions: questions,     // 👈 Lưu danh sách câu hỏi đã chọn/xáo trộn
                timeLimit: timeLimit,  // 👈 Lưu giới hạn thời gian
                // 🆕 Đảm bảo tất cả người chơi có submitted: false khi game bắt đầu
                // (Chỉ cần thiết nếu bạn có logic thêm người chơi sau khi phòng đã chơi,
                // nhưng tốt nhất là thiết lập submitted: false ngay từ đầu khi người chơi join)
            }
        );
        
        // 2. Thông báo cho tất cả người chơi trong phòng
        io.to(pin).emit("startQuiz", { questions: questions, timeLimit: timeLimit });
    } catch (error) {
        console.error(`Lỗi khi bắt đầu trò chơi phòng ${pin}:`, error);
    }
  });
  
  // ✅ Xử lý khi người chơi nộp bài (Giữ nguyên logic của bạn)
  socket.on("playerFinished", async ({ pin, userId }) => {
        try {
            // 1. Tìm và cập nhật trạng thái 'submitted: true' cho người chơi này
            const updatedRoom = await Quizzuser.findOneAndUpdate(
                { pin: pin, "participants.user_id": userId },
                { $set: { "participants.$.submitted": true } },
                { new: true }
            );

            if (updatedRoom) {
                // 2. Kiểm tra điều kiện Kết thúc
                const totalParticipants = updatedRoom.participants.length;
                const submittedCount = updatedRoom.participants.filter(p => p.submitted).length;

                console.log(`Phòng ${pin}: ${submittedCount}/${totalParticipants} đã nộp bài.`);

                if (submittedCount === totalParticipants) {
                    // 3. TẤT CẢ đã nộp bài => Cập nhật trạng thái phòng thành "ketthuc"
                    updatedRoom.status = "ketthuc";
                    await updatedRoom.save();

                    console.log(`Phòng ${pin} đã kết thúc do tất cả nộp bài.`);
                    
                    // 4. Phát sự kiện kết thúc đến tất cả người chơi trong phòng
                    io.to(pin).emit("gameEndedByAllSubmission"); 
                }
            }
        } catch (error) {
            console.error("Lỗi xử lý playerFinished:", error);
        }
    });  
  
  socket.on("disconnect", () => {
    console.log("⚡️ Client disconnected:", socket.id);
  });
});
};