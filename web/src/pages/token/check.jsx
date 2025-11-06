import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // backend base URL
});

// 🧠 Tự động thêm token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚨 Kiểm tra token hết hạn hoặc không hợp lệ
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token hết hạn hoặc không hợp lệ, đang đăng xuất...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login"; // chuyển về trang đăng nhập
    }
    return Promise.reject(error);
  }
);
  
export default api;
