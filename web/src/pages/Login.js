import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
       setTimeout(() => {
        navigate("/"); //chuyển hướng sau khi đăng ký thành công
      }, 1000); //chờ 1 giây trước khi chuyển hướng
      setMessage("✅ " + res.data.message);
    } catch (err) {
        
      setMessage("❌ " + (err.response?.data?.message || "Đăng nhập thất bại"));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🔐 Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="identifier" placeholder="Email hoặc username" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} required />
          <button type="submit">Đăng nhập</button>
        </form>
        <p className="switch">
          Chưa có tài khoản? <a href="/register">Đăng ký</a>
        </p>
        {message && <p className="msg">{message}</p>}
      </div>
    </div>
  );
}

export default Login;
