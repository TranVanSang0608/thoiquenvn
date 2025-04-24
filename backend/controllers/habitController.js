const asyncHandler = require('express-async-handler');
const Habit = require('../models/habitModel');
const Completion = require('../models/completionModel');
const ErrorHandler = require('../utils/errorHandler');

// @desc    Lấy tất cả thói quen của người dùng
// @route   GET /api/habits
// @access  Private
const getHabits = asyncHandler(async (req, res) => {
  const habits = await Habit.find({ user: req.user._id, isArchived: false });
  res.json(habits);
});

// @desc    Lấy chi tiết một thói quen
// @route   GET /api/habits/:id
// @access  Private
const getHabitById = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findById(req.params.id);

  if (habit && habit.user.toString() === req.user._id.toString()) {
    res.json(habit);
  } else {
    return next(new ErrorHandler('Không tìm thấy thói quen', 404));
  }
});

// @desc    Tạo thói quen mới
// @route   POST /api/habits
// @access  Private
const createHabit = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    icon,
    color,
    category,
    frequency,
    reminder,
  } = req.body;

  const habit = await Habit.create({
    user: req.user._id,
    title,
    description: description || '',
    icon: icon || '🎯',
    color: color || '#8A5CF5',
    category: category || 'general',
    frequency: frequency || {
      type: 'daily',
      days: [0, 1, 2, 3, 4, 5, 6],
      timesPerPeriod: 1,
    },
    reminder: reminder || {
      enabled: false,
      time: '09:00',
      days: [0, 1, 2, 3, 4, 5, 6],
    },
  });

  res.status(201).json(habit);
});

// @desc    Cập nhật thói quen
// @route   PUT /api/habits/:id
// @access  Private
const updateHabit = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findById(req.params.id);

  if (habit && habit.user.toString() === req.user._id.toString()) {
    habit.title = req.body.title || habit.title;
    habit.description = req.body.description !== undefined ? req.body.description : habit.description;
    habit.icon = req.body.icon || habit.icon;
    habit.color = req.body.color || habit.color;
    habit.category = req.body.category || habit.category;
    
    if (req.body.frequency) {
      habit.frequency = {
        ...habit.frequency,
        ...req.body.frequency,
      };
    }
    
    if (req.body.reminder) {
      habit.reminder = {
        ...habit.reminder,
        ...req.body.reminder,
      };
    }
    
    if (req.body.isArchived !== undefined) {
      habit.isArchived = req.body.isArchived;
    }

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } else {
    return next(new ErrorHandler('Không tìm thấy thói quen', 404));
  }
});

// @desc    Xóa thói quen
// @route   DELETE /api/habits/:id
// @access  Private
const deleteHabit = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findById(req.params.id);

  if (habit && habit.user.toString() === req.user._id.toString()) {
    await habit.remove();
    // Xóa tất cả các completion liên quan
    await Completion.deleteMany({ habit: req.params.id });
    res.json({ message: 'Đã xóa thói quen' });
  } else {
    return next(new ErrorHandler('Không tìm thấy thói quen', 404));
  }
});

// @desc    Đánh dấu thói quen đã hoàn thành
// @route   POST /api/habits/:id/complete
// @access  Private
const completeHabit = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    return next(new ErrorHandler('Không tìm thấy thói quen', 404));
  }

  if (habit.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Không được phép', 401));
  }

  // Lấy ngày từ body hoặc sử dụng ngày hiện tại
  const date = req.body.date ? new Date(req.body.date) : new Date();
  // Đặt giờ, phút, giây về 0 để so sánh ngày
  date.setHours(0, 0, 0, 0);

  // Kiểm tra xem đã có completion chưa
  let completion = await Completion.findOne({
    habit: habit._id,
    user: req.user._id,
    date: {
      $gte: date,
      $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  if (completion) {
    // Nếu đã có, cập nhật trạng thái
    completion.completed = true;
    completion.note = req.body.note || completion.note;
  } else {
    // Nếu chưa có, tạo mới
    completion = new Completion({
      habit: habit._id,
      user: req.user._id,
      date,
      note: req.body.note || '',
    });
  }

  await completion.save();

  // Cập nhật streak
  // Cần một hàm phức tạp hơn để tính streak đúng
  // Tạm thời sử dụng logic đơn giản
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const yesterdayCompletion = await Completion.findOne({
    habit: habit._id,
    user: req.user._id,
    date: {
      $gte: yesterday,
      $lt: date,
    },
    completed: true,
  });

  if (yesterdayCompletion) {
    habit.streak.current += 1;
  } else {
    habit.streak.current = 1;
  }

  // Cập nhật longest streak nếu cần
  if (habit.streak.current > habit.streak.longest) {
    habit.streak.longest = habit.streak.current;
  }

  await habit.save();

  res.status(200).json(completion);
});

// @desc    Bỏ đánh dấu thói quen hoàn thành
// @route   POST /api/habits/:id/uncomplete
// @access  Private
const uncompleteHabit = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    return next(new ErrorHandler('Không tìm thấy thói quen', 404));
  }

  if (habit.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Không được phép', 401));
  }

  // Lấy ngày từ body hoặc sử dụng ngày hiện tại
  const date = req.body.date ? new Date(req.body.date) : new Date();
  // Đặt giờ, phút, giây về 0 để so sánh ngày
  date.setHours(0, 0, 0, 0);

  // Tìm completion
  const completion = await Completion.findOne({
    habit: habit._id,
    user: req.user._id,
    date: {
      $gte: date,
      $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  if (completion) {
    // Cập nhật hoặc xóa
    if (req.body.note) {
      completion.completed = false;
      completion.note = req.body.note;
      await completion.save();
      res.status(200).json(completion);
    } else {
      await completion.remove();
      res.status(200).json({ message: 'Đã bỏ đánh dấu thói quen' });
    }
    
    // Đặt lại streak
    // Logic cần phức tạp hơn để tính streak đúng
    // Tạm thời sử dụng logic đơn giản
    habit.streak.current = 0;
    await habit.save();
  } else {
    // Không có completion nào để bỏ đánh dấu
    res.status(200).json({ message: 'Không có thói quen nào được đánh dấu' });
  }
});

// @desc    Lấy lịch sử hoàn thành của một thói quen
// @route   GET /api/habits/:id/history
// @access  Private
const getHabitHistory = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    return next(new ErrorHandler('Không tìm thấy thói quen', 404));
  }

  if (habit.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Không được phép', 401));
  }

  // Lấy lịch sử trong khoảng thời gian
  const { startDate, endDate } = req.query;
  let dateFilter = { habit: habit._id, user: req.user._id };

  if (startDate || endDate) {
    dateFilter.date = {};
    if (startDate) {
      dateFilter.date.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.date.$lte = new Date(endDate);
      // Đảm bảo đến hết ngày
      dateFilter.date.$lte.setHours(23, 59, 59, 999);
    }
  }

  const completions = await Completion.find(dateFilter).sort({ date: -1 });
  res.json(completions);
});

module.exports = {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  completeHabit,
  uncompleteHabit,
  getHabitHistory,
};