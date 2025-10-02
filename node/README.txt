khi clone rep về máy thì trong node/server/ tạo 1 file .env nhập như sau 

------------
MONGO_URI=mongodb://127.0.0.1:27017/quizz
PORT=5000
JWT_SECRET=177013
-----------------

*quizz là tên database tạo trong monggodb
*port có thể tuỳ chỉnh nhưng nếu mỗi người mỗi cổng thì mỗi lần push lên đây lại đổi nên giữ mặc định nhé ae
*JWT_SECRET để client gửi token để xác thực người dùng
