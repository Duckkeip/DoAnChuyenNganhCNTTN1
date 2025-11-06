import React, { useState } from "react";

import api from "./token/check"
import "./Auth.css";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [message, setMessage] = useState("");
 
  const navigate = useNavigate();

 
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };// Cập nhật trạng thái form khi người dùng nhập liệu

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      
      const res = await api.post("/auth/login", form);
      const { token, user } = res.data;
      localStorage.setItem("token", res.data.token);// Lưu token vào localStorage

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      console.log("Đăng nhập thành công:", user);
       setTimeout(() => {
        navigate(`/home/${user.id}`);
         //chuyển hướng sau khi đăng ký thành công
      }, 1000); //chờ 1 giây trước khi chuyển hướng
      setMessage("✅ " + res.data.message);
    } catch (err) {
      
      setMessage("❌ " + (err.response?.data?.message || "Đăng nhập thất bại"));
    }
  };// Xử lý khi người dùng submit form
  const handleLogoClick = () => {
    setTimeout(() => {
      navigate('/home'); //chuyển hướng sau khi đăng ký thành công
    }, 1000); //chờ 1 giây trước khi chuyển hướng
  }
  return (
    <div className="auth-container">
      {/* Cột trái: Logo */}
      <div className="auth-left">
        <img src="./logoa.png" alt="Logo Website"  onClick={handleLogoClick}/>
        <h1>Quizz Game</h1>
      </div>
      {/* Cột phải: Form đăng nhập */}
      <div className="auth-right">
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
    </div>
  );
}

export default Login;
