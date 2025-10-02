
<img width="792" height="242" alt="image" src="https://github.com/user-attachments/assets/9a9eaaf8-9081-4137-a93e-f7b8c964cbba" />

</br>

# Hệ thống Quiz Game hỗ trợ ôn tập trực tuyến trên Web và Mobile

**ĐỒ ÁN CHUYÊN NGÀNH - KHÓA 2023 - NHÓM LỚP 03 - NHÓM 01**

## Mô tả ngắn

Hệ thống Quiz Game là một ứng dụng web và mobile giúp người dùng ôn tập thông qua các bài kiểm tra (quiz). Người dùng có thể tạo tài khoản, làm bài quiz theo chủ đề, xem kết quả, lưu lịch sử làm bài và quản lý câu hỏi (dành cho quản trị viên).

## Tính năng chính

* Đăng ký / đăng nhập (email + mật khẩu)
* Quên mật khẩu
* Chọn chủ đề và làm quiz ngẫu nhiên
* Tính điểm tự động và hiển thị kết quả
* Lưu lịch sử làm bài
* Quản trị viên: thêm/sửa/xóa câu hỏi, chủ đề
* Hỗ trợ Web (React) và Mobile (React Native hoặc Flutter)

## Kiến trúc & Công nghệ

* Frontend Web: React (hoặc Next.js)
* Frontend Mobile: React Native (hoặc Flutter)
* Backend: Node.js + Express
* CSDL: MongoDB (Mongoose)
* Xác thực: JWT + bcrypt
* Lưu trữ tĩnh / media: (ví dụ) Cloudinary / S3

## Cài đặt (Local)

### Yêu cầu

* Node.js >= 14
* MongoDB
* npm hoặc yarn

### Backend

```bash
# vào thư mục server
cd server
# cài dependencies
npm install
# sao chép file env mẫu
cp .env.example .env
# chỉnh .env theo môi trường của bạn
# chạy server
npm run dev
```

**Ví dụ `.env`**

```.env
PORT=5000
MONGO_URI=mongodb://localhost:27017/quizz
JWT_SECRET=verysecretkey
```

### Frontend Web

```bash
cd web
npm install
npm start
```

### Frontend Mobile (React Native)

```bash
cd mobile
npm install
# chạy trên thiết bị/emulator
npx react-native run-android
# hoặc
npx react-native run-ios
```

## Cấu trúc dự án 

```
/DoAnChuyenNganhCNTTN1
├─ server/          # Backend (Express, routes, controllers, models)
├─ web/             # Frontend web (React)
├─ mobile/          # Frontend mobile (React Native)
├─ docs/            # Tài liệu, wireframes, ERD
└─ README.md
```

## API cơ bản

* `POST /api/auth/register` — đăng ký
* `POST /api/auth/login` — đăng nhập
* `GET /api/quizzes` — lấy danh sách quiz
* `POST /api/quizzes/:id/submit` — nộp bài và nhận điểm
* `GET /api/users/:id/history` — lịch sử làm bài của user



## Triển khai (Deployment)

* Backend: hosting trên Heroku / Render / Vercel (serverless) hoặc VPS
* Database: MongoDB Compass
* Frontend: Vercel / Netlify

## Hướng dẫn đóng gói để nộp đồ án

(HERE)

## Contributes

* Thêm chức năng thi theo thời gian thực (real-time leaderboard)
* Hỗ trợ import/export câu hỏi theo CSV
* Thêm multi-language (i18n)

## License

MIT

## Liên hệ

* Nhóm: Nhóm 01 - Lớp 03
* Email liên hệ: doggygerman@gmail.com

























































