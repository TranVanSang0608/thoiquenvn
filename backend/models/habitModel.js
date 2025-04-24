const mongoose = require('mongoose');

const habitSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tên thói quen'],
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '🎯',
    },
    color: {
      type: String,
      default: '#8A5CF5',
    },
    category: {
      type: String,
      default: 'general',
    },
    frequency: {
      type: {
        type: String,
        enum: ['daily', 'weekly', 'custom'],
        default: 'daily',
      },
      days: {
        type: [Number],
        default: [0, 1, 2, 3, 4, 5, 6], // 0: chủ nhật, 1-6: thứ 2 đến thứ 7
      },
      timesPerPeriod: {
        type: Number,
        default: 1,
      },
    },
    reminder: {
      enabled: {
        type: Boolean,
        default: false,
      },
      time: {
        type: String,
        default: '09:00',
      },
      days: {
        type: [Number],
        default: [0, 1, 2, 3, 4, 5, 6],
      },
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    streak: {
      current: {
        type: Number,
        default: 0,
      },
      longest: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Habit = mongoose.model('Habit', habitSchema);
module.exports = Habit;