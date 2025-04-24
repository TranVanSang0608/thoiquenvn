const express = require('express');
const router = express.Router();
const { 
  getMoods,
  getMoodByDate,
  createMood,
  updateMood,
  deleteMood,
  getMoodStats
} = require('../controllers/moodController');
const { protect } = require('../middlewares/authMiddleware');

// Bảo vệ tất cả các routes
router.use(protect);

// Route cho tất cả mood
router.route('/')
  .get(getMoods)
  .post(createMood);

// Route cho mood theo ngày
router.get('/date/:date', getMoodByDate);

// Route cho thống kê mood
router.get('/stats', getMoodStats);

// Route cho mood cụ thể
router.route('/:id')
  .put(updateMood)
  .delete(deleteMood);

module.exports = router;