//config/getIP.js

const os = require('os');// bắt mạng wifi đang sử dụng

//  Hàm lấy IP Wi-Fi hiện tại
function getWifiIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address; // IP LAN
      }
    }
  }
  return "localhost"; // Không có mạng
}

module.exports = getWifiIP;