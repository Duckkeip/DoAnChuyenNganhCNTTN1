import React, { useState } from "react";
import api from "./token/check"
import "./Auth.css";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", tenhienthi: "" });// 
  // trạng thái form đăng ký
  const [message, setMessage] = useState("");// thông báo lỗi hoặc thành công
  const [loading, setLoading] = useState(false);// trạng thái đang xử lý
  const navigate = useNavigate();//chuyển hướng sau khi đăng ký thành công  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };// Cập nhật trạng thái form khi người dùng nhập dữ liệu

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  setMessage("⏳ Đang xử lý...");
    try {
      const res = await api.post("auth/register", form);
      setMessage("✅ " + res.data.message);
      setTimeout(() => {
        navigate('/login'); //chuyển hướng sau khi đăng ký thành công
      }, 700); //chờ 1 giây trước khi chuyển hướng 
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Lỗi khi đăng ký"));
    }finally {
      setLoading(false);
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
          <img src="./logoa.png" alt="Logo Website"  onClick={handleLogoClick} />
          <h1>Quizz Game</h1>
        </div>
        {/* Cột phải: Form đăng nhập */}
        <div className="auth-right">
        <div className="auth-card">
          <h2>📝 Đăng ký</h2>
          <form onSubmit={handleSubmit}>
            <input name="username" placeholder="Tên đăng nhập" onChange={handleChange} required />
            <input name="SDT" placeholder="Số điện thoại" onChange={handleChange} />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} required />
            <button type="submit" disabled={loading} >{loading ? "⏳ Đang đăng ký..." : "Tạo tài khoản"} </button>
          </form>
          <p className="switch">
            Đã có tài khoản? <a href="/login">Đăng nhập</a>
          </p>
          {message && <p className="msg">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default Register;
