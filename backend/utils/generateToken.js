const jwt = require('jsonwebtoken');

// Access token với thời gian ngắn hơn
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d', // 1 ngày thay vì 30 ngày
  });
};

// Refresh token với thời gian dài hơn
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d', // 30 ngày
  });
};

module.exports = { generateToken, generateRefreshToken };