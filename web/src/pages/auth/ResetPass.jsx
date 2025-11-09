import React, { useState } from "react";
import api from "../token/check";
import "./Auth.css";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("reset_email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("❌ Mật khẩu không khớp!");
      return;
    }

    try {
      const res = await api.post("/auth/reset-password", { email, password });
      setMessage("✅ " + res.data.message);

      // Xoá email reset khỏi localStorage và quay lại login
      localStorage.removeItem("reset_email");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Không thể đặt lại mật khẩu"));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-right">
        <div className="auth-card">
          <h2>🔁 Đặt lại mật khẩu</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <button type="submit">Cập nhật mật khẩu</button>
          </form>
          {message && <p className="msg">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
