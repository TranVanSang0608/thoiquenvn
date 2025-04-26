const express = require('express');
const router = express.Router();
const { 
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  completeHabit,
  uncompleteHabit,
  getHabitHistory,
  getCompletionsByDate,
  getHabitStats
} = require('../controllers/habitController');
const { protect } = require('../middlewares/authMiddleware');

// Bảo vệ tất cả các routes
router.use(protect);

// Route cho tất cả thói quen
router.route('/')
  .get(getHabits)
  .post(createHabit);

// Route lấy thống kê
router.get('/stats/overview', getHabitStats);

// Route lấy completions theo ngày
router.get('/completions/date/:date', getCompletionsByDate);

// Route cho thói quen cụ thể
router.route('/:id')
  .get(getHabitById)
  .put(updateHabit)
  .delete(deleteHabit);

// Route đánh dấu hoàn thành/bỏ đánh dấu
router.post('/:id/complete', completeHabit);
router.post('/:id/uncomplete', uncompleteHabit);

// Route lấy lịch sử
router.get('/:id/history', getHabitHistory);

module.exports = router;