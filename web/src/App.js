import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Homeuser from "./pages/home/homeuser";
import Homepage from "./pages/home/homepage";
import { Navigate } from "react-router-dom";
import Protected from "./pages/token/Protected";
import Profile from "./pages/home/profile/Profile"; 
import HomeContent from "./pages/home/main/HomeContent"
import ForgotPassword from "./pages/auth/QuenMK";
import VerifyOtp from "./pages/auth/OTP";
import ResetPassword from "./pages/auth/ResetPass";
import CreateTopic from "./pages/createtopic/Taochude";
export default function App() {
  return (
       
      <Router>
        <Routes>
            {/*Auth */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />


            {/*public */}
            <Route path="/home" element={<Homepage />} />


            {/* User */}
            
            {/* ✅ Protected User Routes */}
            {/* HOMEUSER sẽ gồm các file như history main profile*/}
            <Route element={<Protected />}>
              <Route path="/home/:id" element={<Homeuser />}>{/*trang cá nhân của mỗi id */}
                <Route index element={<HomeContent />} />
                <Route path="profile" element={<Profile />} />{/*profile tài khoản*/}
                <Route path="create-topic" element={<CreateTopic />} />
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

