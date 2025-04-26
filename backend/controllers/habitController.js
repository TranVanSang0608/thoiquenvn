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

// @desc    Lấy tất cả completions theo ngày
// @route   GET /api/habits/completions/date/:date
// @access  Private
const getCompletionsByDate = asyncHandler(async (req, res) => {
  const { date } = req.params;
  
  // Tạo range của ngày (từ 00:00 đến 23:59:59)
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  
  // Tìm tất cả completion trong ngày cho user hiện tại
  const completions = await Completion.find({
    user: req.user._id,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('habit', 'title icon color');
  
  res.json(completions);
});

// @desc    Lấy thống kê tổng quan
// @route   GET /api/habits/stats/overview
// @access  Private
const getHabitStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  // Chuyển đổi chuỗi ngày thành đối tượng Date
  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate ? new Date(endDate) : new Date();
  
  // Thiết lập giờ cho ngày bắt đầu và kết thúc
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
  // Lấy tất cả thói quen của người dùng
  const habits = await Habit.find({ user: req.user._id, isArchived: false });
  
  // Lấy tất cả completions trong khoảng thời gian
  const completions = await Completion.find({
    user: req.user._id,
    date: { $gte: start, $lte: end },
    completed: true
  });
  
  // Tính tỷ lệ hoàn thành
  const daysInRange = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  const totalPossible = habits.length * daysInRange;
  const completionRate = totalPossible > 0 
    ? (completions.length / totalPossible) * 100 
    : 0;
  
  // Tính streak hiện tại và tốt nhất
  // (Logic phức tạp hơn, chỉ là ví dụ đơn giản)
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  // Kiểm tra xem hôm nay đã hoàn thành ít nhất một thói quen chưa
  const todayCompletions = await Completion.countDocuments({
    user: req.user._id,
    date: { 
      $gte: currentDate,
      $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
    },
    completed: true
  });
  
  let currentStreak = 0;
  if (todayCompletions > 0) {
    currentStreak = 1;
    
    // Kiểm tra các ngày trước đó
    let checkDate = new Date(currentDate);
    checkDate.setDate(checkDate.getDate() - 1);
    
    while (true) {
      const dayCompletions = await Completion.countDocuments({
        user: req.user._id,
        date: { 
          $gte: checkDate,
          $lt: new Date(checkDate.getTime() + 24 * 60 * 60 * 1000)
        },
        completed: true
      });
      
      if (dayCompletions > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }
  
  // Logic để tính streak tốt nhất trong lịch sử
  // (Đây sẽ là logic phức tạp và tốn kém, nên có thể cân nhắc lưu trữ giá trị này)
  const bestStreak = Math.max(currentStreak, habits.reduce((max, habit) => Math.max(max, habit.streak?.longest || 0), 0));
  
  // Lấy top 5 thói quen có tỷ lệ hoàn thành cao nhất
  const habitsWithStats = await Promise.all(habits.map(async (habit) => {
    const habitCompletions = completions.filter(c => c.habit.toString() === habit._id.toString());
    const rate = daysInRange > 0 ? (habitCompletions.length / daysInRange) * 100 : 0;
    
    return {
      _id: habit._id,
      title: habit.title,
      icon: habit.icon,
      color: habit.color,
      completionRate: rate,
      streak: habit.streak?.current || 0
    };
  }));
  
  const topHabits = habitsWithStats
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 5);
  
  // Tạo dữ liệu hoàn thành theo ngày
  const completionData = [];
  const days = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  
  for (const day of days) {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayCompletions = completions.filter(c => 
      c.date >= dayStart && c.date <= dayEnd
    );
    
    completionData.push({
      date: day.toISOString().split('T')[0],
      completed: dayCompletions.length,
      total: habits.length,
      rate: habits.length > 0 ? dayCompletions.length / habits.length : 0
    });
  }
  
  res.json({
    overview: {
      completionRate: Math.round(completionRate),
      currentStreak,
      bestStreak
    },
    topHabits,
    completionData
  });
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
  getCompletionsByDate,
  getHabitStats
};