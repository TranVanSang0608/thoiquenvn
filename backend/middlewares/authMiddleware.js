const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(' ')[1];

      // Xác thực token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Tìm user theo id từ token và loại bỏ password
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      return next(new ErrorHandler('Không được phép, token không hợp lệ', 401));
    }
  }

  if (!token) {
    return next(new ErrorHandler('Không được phép, không có token', 401));
  }
});

module.exports = { protect };