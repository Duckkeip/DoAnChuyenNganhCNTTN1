import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Homeuser from "./pages/home/homeuser";
import Homepage from "./pages/home/homepage";
import { Navigate } from "react-router-dom";
import Protected from "./pages/token/Protected";
import Profile from "./pages/home/profile/Profile"; 
import HomeContent from "./pages/home/main/HomeContent"

export default function App() {
  return (
       
      <Router>
        <Routes>
            {/*Auth */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/*public */}
            <Route path="/home" element={<Homepage />} />
            {/* User */}
            {/* Trang homepage với tham số id */}
            {/* ✅ Protected User Routes */}
            <Route element={<Protected />}>
              <Route path="/home/:user_id" element={<Homeuser />}>
                <Route index element={<HomeContent />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>
            
      
            {/* Admin routes 
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UserList />} />
            </Route>*/}
        </Routes>
      </Router>
    

  );
}

