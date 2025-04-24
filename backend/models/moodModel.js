const mongoose = require('mongoose');

const moodSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    mood: {
      type: String,
      required: [true, 'Vui lòng chọn tâm trạng'],
      enum: ['happy', 'good', 'neutral', 'bad', 'awful'],
      default: 'neutral',
    },
    note: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Tạo index để đảm bảo 1 user chỉ có 1 mood cho mỗi ngày
moodSchema.index({ user: 1, date: 1 }, { unique: true });

const Mood = mongoose.model('Mood', moodSchema);
module.exports = Mood;