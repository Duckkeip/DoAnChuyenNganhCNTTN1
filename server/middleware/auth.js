const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
  if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "MY_SECRET_KEY");
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Người dùng không tồn tại" });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới được phép" });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
