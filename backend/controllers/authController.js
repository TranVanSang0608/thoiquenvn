const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const Habit = require('../models/habitModel');
const Completion = require('../models/completionModel');
const Mood = require('../models/moodModel');

// @desc    Đăng ký người dùng
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(new ErrorHandler('Email đã được sử dụng', 400));
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    const refreshToken = generateRefreshToken(user._id);
    
    // Lưu refresh token vào cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      settings: user.settings,
      token: generateToken(user._id),
    });
  } else {
    return next(new ErrorHandler('Dữ liệu người dùng không hợp lệ', 400));
  }
});

// @desc    Đăng nhập người dùng
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const refreshToken = generateRefreshToken(user._id);
    
    // Lưu refresh token vào cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      settings: user.settings,
      token: generateToken(user._id),
    });
  } else {
    return next(new ErrorHandler('Email hoặc mật khẩu không đúng', 401));
  }
});

// @desc    Làm mới token
// @route   POST /api/auth/refresh-token
// @access  Public (nhưng cần refresh token)
const refreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return next(new ErrorHandler('Không tìm thấy refresh token', 401));
  }
  
  try {
    // Xác minh refresh token
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
    
    // Lấy thông tin người dùng
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new ErrorHandler('Không tìm thấy người dùng', 404));
    }
    
    // Tạo token mới
    const newToken = generateToken(user._id);
    
    res.json({
      token: newToken
    });
  } catch (error) {
    console.error('Lỗi refresh token:', error);
    return next(new ErrorHandler('Refresh token không hợp lệ hoặc đã hết hạn', 401));
  }
});

// @desc    Đăng xuất người dùng
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  // Xóa refresh token khỏi cookie
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  
  res.status(200).json({ message: 'Đăng xuất thành công' });
});

// @desc    Lấy thông tin người dùng
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      settings: user.settings,
    });
  } else {
    return next(new ErrorHandler('Không tìm thấy người dùng', 404));
  }
});

// @desc    Cập nhật thông tin người dùng
// @route   PUT /api/auth/me
// @access  Private
const updateUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.settings) {
      user.settings = {
        ...user.settings,
        ...req.body.settings,
      };
    }
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      settings: updatedUser.settings,
      token: generateToken(updatedUser._id),
    });
  } else {
    return next(new ErrorHandler('Không tìm thấy người dùng', 404));
  }
});

// @desc    Cập nhật cài đặt người dùng
// @route   PUT /api/auth/settings
// @access  Private
const updateUserSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Cập nhật cài đặt
    if (req.body.settings) {
      user.settings = {
        ...user.settings,
        ...req.body.settings
      };
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      settings: updatedUser.settings
    });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy người dùng');
  }
});

// @desc    Xóa tài khoản người dùng
// @route   DELETE /api/auth/me
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Xóa tất cả dữ liệu liên quan trước
    await Habit.deleteMany({ user: req.user._id });
    await Completion.deleteMany({ user: req.user._id });
    await Mood.deleteMany({ user: req.user._id });

    // Xóa tài khoản
    await user.remove();

    res.json({ message: 'Tài khoản đã được xóa' });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy người dùng');
  }
});

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  updateUserSettings,
  deleteUser
};