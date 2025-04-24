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
  getHabitHistory
} = require('../controllers/habitController');
const { protect } = require('../middlewares/authMiddleware');

// Bảo vệ tất cả các routes
router.use(protect);

// Route cho tất cả thói quen
router.route('/')
  .get(getHabits)
  .post(createHabit);

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