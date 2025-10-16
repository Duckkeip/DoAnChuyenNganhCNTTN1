import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", tenhienthi: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();//chuyển hướng sau khi đăng ký thành công  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", form);
      setMessage("✅ " + res.data.message);
      setTimeout(() => {
        navigate('/login'); //chuyển hướng sau khi đăng ký thành công
      }, 2000); //chờ 2 giây trước khi chuyển hướng 
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Lỗi khi đăng ký"));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>📝 Đăng ký</h2>
        <form onSubmit={handleSubmit}>
          <input name="username" placeholder="Tên đăng nhập" onChange={handleChange} required />
          <input name="tenhienthi" placeholder="Tên hiển thị" onChange={handleChange} />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} required />
          <button type="submit">Tạo tài khoản</button>
        </form>
        <p className="switch">
          Đã có tài khoản? <a href="/login">Đăng nhập</a>
        </p>
        {message && <p className="msg">{message}</p>}
      </div>
    </div>
  );
}

export default Register;
