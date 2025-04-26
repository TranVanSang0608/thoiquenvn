const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  refreshToken,
  logoutUser,
  getUserProfile, 
  updateUserProfile,
  updateUserSettings,
  deleteUser
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Đăng ký và đăng nhập - Public routes
router.post('/register', (req, res, next) => {
  registerUser(req, res, next);
});

router.post('/login', (req, res, next) => {
  loginUser(req, res, next);
});

// Refresh token - Public route (nhưng cần có refresh token trong cookie)
router.post('/refresh-token', (req, res, next) => {
  refreshToken(req, res, next);
});

// Đăng xuất - Protected route
router.post('/logout', protect, (req, res, next) => {
  logoutUser(req, res, next);
});

// Lấy và cập nhật profile - Protected routes
router.route('/me')
  .get(protect, (req, res, next) => {
    getUserProfile(req, res, next);
  })
  .put(protect, (req, res, next) => {
    updateUserProfile(req, res, next);
  })
  .delete(protect, (req, res, next) => {
    deleteUser(req, res, next);
  });

// Cập nhật cài đặt
router.put('/settings', protect, (req, res, next) => {
  updateUserSettings(req, res, next);
});

module.exports = router;