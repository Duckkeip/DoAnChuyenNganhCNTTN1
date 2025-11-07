import axios from "axios";

let host = window.location.hostname;

// Chuyển 127.0.0.1 → localhost
if (host === "127.0.0.1") host = "localhost"; 

// Nếu chạy production như Vercel thì dùng API online
const baseURL =
  host === "localhost" || host.startsWith("192.168.")
    ? `http://${host}:5000/api`                //  Dev + LAN
    : "https://your-production-domain.com/api";//  Khi deploy

const api = axios.create({ baseURL });

// 🧠 Tự động thêm token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚨 Token hết hạn → logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token hết hạn hoặc không hợp lệ, đang đăng xuất...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
