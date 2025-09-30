// server/middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (roles = []) => {
  // roles = [] cho phép tất cả user, hoặc ['admin'] cho admin
  return (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header) return res.status(401).json({ message: 'Không có token' });

    const token = header.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token không hợp lệ' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (roles.length && !roles.includes(decoded.role))
        return res.status(403).json({ message: 'Không đủ quyền' });

      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token hết hạn/không hợp lệ' });
    }
  };
};

module.exports = auth;
