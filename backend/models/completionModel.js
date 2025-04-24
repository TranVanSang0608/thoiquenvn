const mongoose = require('mongoose');

const completionSchema = mongoose.Schema(
  {
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Habit',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    date: {
      type: Date,
      required: true,
    },
    completed: {
      type: Boolean,
      default: true,
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

// Tạo compound index để đảm bảo 1 habit chỉ có 1 completion cho mỗi ngày
completionSchema.index({ habit: 1, date: 1 }, { unique: true });

const Completion = mongoose.model('Completion', completionSchema);
module.exports = Completion;