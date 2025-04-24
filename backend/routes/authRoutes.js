const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile 
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Đăng ký và đăng nhập - Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Lấy và cập nhật profile - Protected routes
router.route('/me')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;