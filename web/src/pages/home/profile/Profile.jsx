import React, { useEffect, useState } from "react";
import api from "../../token/check"
import { useParams, useNavigate } from "react-router-dom";
import "./Profile.css";
//import jwt_decode from "jwt-decode";
const Profile = () => {
  const { id } = useParams();//truyền id của user
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showChangePassModal, setShowChangePassModal] = useState(false);//hộp thoại đổi mk
  const [newPassword,setNewPassword]=useState();//biến đổi mật khẩu
  const [confirmPassword, setConfirmPassword] = useState("");


  const [user, setUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [form, setForm] = useState(
    { username: "",
    email: "",
    SDT:"",
    password:"",
    ngaytaotk:"", 
    avatar:""
    });

  // Lấy dữ liệu user
  useEffect(() => {
    api.get(`/user/${id}`)
      .then(res => {
        setUser(res.data);
        setForm({ 
            username: res.data.username,
            email: res.data.email,
            SDT: res.data.SDT,
            password: res.data.password,
            ngaytaotk: res.data.ngaytaotk,
            avatar: res.data.avatar
        
        });
      })
      .catch(err => console.error(err));
  }, [id]);
  //cập nhật dữ liệu
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  //hàm Save
  const handleSave = async () => {
    try{
    const { password, ...formWithoutPassword } = form;

    await api.put(`/user/${id}`, formWithoutPassword);
    window.location.reload();
    alert("Cập nhật thành công!");
    }catch(err){
    console.log("Lỗi: " + err);
    }
  };


  const handleAvatarUpload = async () => {
    if (!avatarFile) return alert("Chưa chọn ảnh!");
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    await api.post(`/user/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("Cập nhật ảnh đại diện thành công!");
    window.location.reload();
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    try {
      await api.put(`/user/${id}`, {
        password: newPassword,
      });
      alert("Đổi mật khẩu thành công!");
      setShowChangePassModal(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.log("Lỗi: " + err);
    }
  };


  if (!user) return <p>Đang tải...</p>;

  return (
    <div className="bgprofile">
        <div className="profile-container">
          <button className="btn" onClick={() => navigate(-1)}>
            ⬅ Quay lại
          </button>
          <h2 >Thông tin cá nhân</h2>

          <div className="avatar-section">
            <img
              src={user.avatar ? `http://localhost:5000${user.avatar}` : "/default-avatar.png"}
              alt="Avatar"
              className="avatar-img"
            />
            <input type="file" onChange={(e) => setAvatarFile(e.target.files[0])} />
            <button className="btn avatarup" onClick={handleAvatarUpload}>Cập nhật ảnh</button>
          </div>

          <div className="info-section">
            <label>Tên người dùng:</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              type="text"
            />

            <label>Email:</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
            />
            <label>Số điện thoại:</label>
            <input
              name="SDT"
              value={form.SDT}
              onChange={handleChange}
              type="text"
            />
            <label>Mật khẩu:</label>
            <p>
              
              {showPassword ? form.password : "******"}
              </p>
            <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="btn show"
            >
            {showPassword ? "Ẩn" : "Hiện"}
          </button>
          <button
                style={{margin: "10px"}}
                type="button" 
                className="btn dialog"
                onClick={() => setShowChangePassModal(true)}
              >
                Đổi mật khẩu
          </button>
            <label>Ngày tạo tài khoản :</label>
            <p className="createddate">
            {new Date(form.ngaytaotk).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
              </p>

            <div className="button-group">
              <button className="btn save" onClick={handleSave}>Lưu</button>
            </div>
          </div>

          {/* HỘP THOẠI ĐỔI MẬT KHẨU */}
          {showChangePassModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Đổi mật khẩu</h3>
                <input
                  type="password"
                  placeholder="Mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div className="modal-buttons">
                  <button onClick={handleChangePassword} className="btn save">
                    Xác nhận
                  </button>
                  <button
                    onClick={() => setShowChangePassModal(false)}
                    className="btn delete"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default Profile;
