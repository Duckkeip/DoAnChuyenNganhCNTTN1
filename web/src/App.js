import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Homepage from "./pages/home/homepage";
import { Navigate } from "react-router-dom";
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to ="/home" replace/>} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

      </Routes>
    </Router>
  );
}

