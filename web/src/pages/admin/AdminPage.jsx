import "./Admin.css"
import React, { useEffect } from "react";
import { useNavigate,Outlet ,useParams } from "react-router-dom";

function AdminPage() {
    const { id } = useParams();
    const navigate = useNavigate();
  
    useEffect(() => {
      // Lấy user từ localStorage
      const storedUser = JSON.parse(localStorage.getItem("user"));
  
      // Nếu chưa đăng nhập hoặc không phải admin → đá ra ngoài
      if (!storedUser || storedUser.role !== "admin") {
        alert("❌ Bạn không có quyền truy cập trang này!");
        navigate("/home");
      }
    }, [navigate]);
  
    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    };
    return (
        <div className="admin-layout">
          {/* Thanh bên trái */}
          <aside className="admin-sidebar">
            <h2> Admin </h2>
            <nav>
              <button onClick={() => navigate(`/admin/${id}`)}>🏠 Dashboard</button>
              <button onClick={() => navigate(`/admin/${id}/users`)}>👥 Quản lý User</button>
              <button onClick={() => navigate(`/home/${id}`)}>Sang trang người dùng</button>
            </nav>
            <button className="logout-btn" onClick={handleLogout}>  🚪 Đăng xuất</button>
          </aside>
    
          {/* Nội dung trang con */}
          <main className="admin-content">
            <Outlet />
          </main>
        </div>
      );
    }
    
    export default AdminPage;