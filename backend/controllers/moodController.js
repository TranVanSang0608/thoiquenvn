const asyncHandler = require('express-async-handler');
const Mood = require('../models/moodModel');
const ErrorHandler = require('../utils/errorHandler');

// @desc    Lấy tất cả mood của người dùng
// @route   GET /api/moods
// @access  Private
const getMoods = asyncHandler(async (req, res) => {
  // Lấy mood trong khoảng thời gian
  const { startDate, endDate } = req.query;
  let dateFilter = { user: req.user._id };

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

  const moods = await Mood.find(dateFilter).sort({ date: -1 });
  res.json(moods);
});

// @desc    Lấy mood của ngày cụ thể
// @route   GET /api/moods/date/:date
// @access  Private
const getMoodByDate = asyncHandler(async (req, res) => {
  const date = new Date(req.params.date);
  // Đặt giờ, phút, giây về 0 để so sánh ngày
  date.setHours(0, 0, 0, 0);

  const mood = await Mood.findOne({
    user: req.user._id,
    date: {
      $gte: date,
      $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  if (mood) {
    res.json(mood);
  } else {
    res.status(404).json({ message: 'Không tìm thấy tâm trạng cho ngày này' });
  }
});

// @desc    Tạo hoặc cập nhật mood cho ngày hiện tại
// @route   POST /api/moods
// @access  Private
const createMood = asyncHandler(async (req, res) => {
  const { mood, note, date } = req.body;

  // Sử dụng ngày từ request hoặc ngày hiện tại
  const moodDate = date ? new Date(date) : new Date();
  // Đặt giờ, phút, giây về 0 để so sánh ngày
  moodDate.setHours(0, 0, 0, 0);

  // Kiểm tra xem đã có mood cho ngày này chưa
  let existingMood = await Mood.findOne({
    user: req.user._id,
    date: {
      $gte: moodDate,
      $lt: new Date(moodDate.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  if (existingMood) {
    // Cập nhật mood nếu đã tồn tại
    existingMood.mood = mood || existingMood.mood;
    existingMood.note = note !== undefined ? note : existingMood.note;
    
    const updatedMood = await existingMood.save();
    res.status(200).json(updatedMood);
  } else {
    // Tạo mới nếu chưa tồn tại
    const newMood = await Mood.create({
      user: req.user._id,
      date: moodDate,
      mood,
      note: note || '',
    });
    
    res.status(201).json(newMood);
  }
});

// @desc    Cập nhật mood
// @route   PUT /api/moods/:id
// @access  Private
const updateMood = asyncHandler(async (req, res, next) => {
  const { mood, note } = req.body;
  
  const existingMood = await Mood.findById(req.params.id);
  
  if (!existingMood) {
    return next(new ErrorHandler('Không tìm thấy tâm trạng', 404));
  }
  
  if (existingMood.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Không được phép', 401));
  }
  
  existingMood.mood = mood || existingMood.mood;
  existingMood.note = note !== undefined ? note : existingMood.note;
  
  const updatedMood = await existingMood.save();
  res.status(200).json(updatedMood);
});

// @desc    Xóa mood
// @route   DELETE /api/moods/:id
// @access  Private
const deleteMood = asyncHandler(async (req, res, next) => {
  const mood = await Mood.findById(req.params.id);
  
  if (!mood) {
    return next(new ErrorHandler('Không tìm thấy tâm trạng', 404));
  }
  
  if (mood.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler('Không được phép', 401));
  }
  
  await mood.remove();
  res.json({ message: 'Đã xóa tâm trạng' });
});

// @desc    Lấy thống kê tâm trạng
// @route   GET /api/moods/stats
// @access  Private
const getMoodStats = asyncHandler(async (req, res) => {
  // Lấy thống kê trong khoảng thời gian
  const { startDate, endDate } = req.query;
  let dateFilter = { user: req.user._id };

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

  // Thống kê số lượng mỗi loại tâm trạng
  const stats = await Mood.aggregate([
    { $match: dateFilter },
    { $group: { _id: '$mood', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Tính tâm trạng trung bình
  const moodValues = {
    'happy': 5,
    'good': 4,
    'neutral': 3,
    'bad': 2,
    'awful': 1
  };
  
  // Tính tổng số mood
  const totalMoods = stats.reduce((sum, item) => sum + item.count, 0);
  
  // Tính tâm trạng trung bình
  let averageMood = 0;
  if (totalMoods > 0) {
    const moodSum = stats.reduce((sum, item) => {
      return sum + (moodValues[item._id] * item.count);
    }, 0);
    averageMood = moodSum / totalMoods;
  }
  
  res.json({
    stats,
    totalMoods,
    averageMood
  });
});

module.exports = {
  getMoods,
  getMoodByDate,
  createMood,
  updateMood,
  deleteMood,
  getMoodStats,
};
  // Tính tâm trạng trung bình (nếu có thể