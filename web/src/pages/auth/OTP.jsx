import React, { useState } from "react";
import api from "../token/check";
import "./Auth.css";
import { useNavigate } from "react-router-dom";

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("reset_email");

  const handleSubmit = async (e) => {
    e.preventDefault();
     //console.log("Gửi xác thực OTP:", { email, otp }); // ✅ debug
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      setMessage("✅ " + res.data.message);
      setTimeout(() => navigate("/reset-password"), 1500);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Mã OTP không hợp lệ"));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-right">
        <div className="auth-card">
          <h2>🔒 Xác nhận mã OTP</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nhập mã OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="submit">Xác nhận</button>
          </form>
          {message && <p className="msg">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
