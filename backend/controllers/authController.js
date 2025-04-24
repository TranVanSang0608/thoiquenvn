const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const generateToken = require('../utils/generateToken');

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

// @desc    Lấy thông tin người dùng
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
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

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};