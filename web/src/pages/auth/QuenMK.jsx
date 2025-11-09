import React, { useState } from "react";
import api from "../token/check";
import "./Auth.css";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage("✅ " + res.data.message);

      // Lưu email vào localStorage để chuyển sang bước nhập OTP
      localStorage.setItem("reset_email", email);
      setTimeout(() => navigate("/verify-otp"), 1000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Email sai hoặc không tồn tại"));
    }
  };



  return (
    <div className="auth-container">
      <div className="auth-right">
        <div className="auth-card">
          <h2>🔑 Quên mật khẩu</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Gửi mã xác thực</button>
          </form>
          {message && <p className="msg">{message}</p>}
          <p className="switch">
            <a href="/login">⬅ Quay lại đăng nhập</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
