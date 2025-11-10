import React, { useEffect, useState } from "react";
import api from "../token/check"
import "./Admin.css";

function UserList() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // user đang xem chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách người dùng:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;

    try {
      
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
      console.log(`Xóa thành công tài khoản ${id}`)
      alert("Xóa tài khoản thành công")
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
    }
  };
  
  const updateUserStatus = async (tinhtrang) => {
  if (!selectedUser) return;

  try {
    console.log(tinhtrang);
    const res = await api.put(`/admin/users/${selectedUser._id}/status`, 
      {
    tinhtrang // ✅ dùng đúng tên backend mong đợi
    });

    alert(res.data.message || "Cập nhật thành công");

    setUsers(users.map(u =>
      u._id === selectedUser._id ? { ...u, tinhtrang } : u
    ));

    setSelectedUser({ ...selectedUser, tinhtrang });
  } catch (err) {
    console.error(err);
    alert("Cập nhật thất bại");
  }
};

  const verifyUserAccount = async (verified) => {
    try {
      const res = await api.put(`/admin/users/${selectedUser._id}/status`, { verified });
      alert(res.data.message);

      setUsers(users.map(u =>
        u._id === selectedUser._id ? { ...u, verified } : u
      ));
      setSelectedUser({ ...selectedUser, verified });
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại");
    }
  };
  const handleViewDetail = (user) => {
  setSelectedUser(user);
  setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedUser(null);
  };

  return (
    <div className="userlist-container">
      <h2>👥 Danh sách người dùng</h2>
      <table className="user-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên đăng nhập</th>
            <th>Email</th>
            <th>Quyền</th>
            <th>Tình trạng</th>
            <th>Đã xác thực</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (users.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.tinhtrang}</td>
                <td>{user.verified ? "✅" : "❌"}</td>
                <td>
                  <button className="view-btn" onClick={() => handleViewDetail(user)}>Xem chi tiết</button>
                  <button className="delete-btn" onClick={() => handleDelete(user._id)}>Xóa</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">Không có người dùng nào.</td>
            </tr>
          )}
        </tbody>
      </table>

        {showDetailModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Chi tiết người dùng</h3>
              <button className="close-btn" onClick={closeDetailModal}>✖</button>
            </div>

            <div className="modal-body">
              <p><strong>Username:</strong> {selectedUser.username}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Trạng thái:</strong> {selectedUser.tinhtrang}</p>
              <p><strong>Đã xác thực:</strong> {selectedUser.verified ? "✅" : "❌"}</p>

              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => updateUserStatus("active")}
                  disabled={selectedUser.tinhtrang === "active"}
                >
                  Cho phép truy cập
                </button>{" "}
                <button
                  onClick={() => updateUserStatus("blocked")}
                  disabled={selectedUser.tinhtrang === "blocked"}
                >
                  Chặn
                </button>{" "}
                 {/* Xác thực email trực tiếp */}
                {!selectedUser.verified && (
                  <button
                    style={{ marginLeft: "10px", backgroundColor: "#4CAF50" }}
                    onClick={() => verifyUserAccount(true)}
                  >
                    Xác thực người dùng
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default UserList;
