import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';

const ICONS = ['🏃‍♂️', '📚', '💧', '🧘', '🥗', '📝', '💤', '🎯', '💪', '🧠', '🌱', '🎵'];
const COLORS = [
  '#8A5CF5', // Tím (Primary)
  '#A3E4D7', // Xanh mint
  '#F9E79F', // Vàng
  '#F5B7B1', // Hồng nhạt
  '#AED6F1', // Xanh dương nhạt
  '#FAD7A0', // Cam nhạt
  '#D7BDE2', // Tím nhạt
  '#A9DFBF', // Xanh lá nhạt
];

const HabitForm = ({ habit, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '🎯',
    color: '#8A5CF5',
    category: 'general',
    frequency: {
      type: 'daily',
      days: [0, 1, 2, 3, 4, 5, 6],
    },
    reminder: {
      enabled: false,
      time: '09:00',
    },
  });
  
  useEffect(() => {
    if (habit) {
      setFormData({
        title: habit.title || '',
        description: habit.description || '',
        icon: habit.icon || '🎯',
        color: habit.color || '#8A5CF5',
        category: habit.category || 'general',
        frequency: habit.frequency || {
          type: 'daily',
          days: [0, 1, 2, 3, 4, 5, 6],
        },
        reminder: habit.reminder || {
          enabled: false,
          time: '09:00',
        },
      });
    }
  }, [habit]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleFrequencyChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      frequency: {
        ...formData.frequency,
        [name]: value,
      },
    });
  };
  
  const handleReminderChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      reminder: {
        ...formData.reminder,
        [name]: type === 'checkbox' ? checked : value,
      },
    });
  };
  
  const handleDayToggle = (day) => {
    const currentDays = formData.frequency.days || [];
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    
    setFormData({
      ...formData,
      frequency: {
        ...formData.frequency,
        days: updatedDays,
      },
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-neutral-dark">
          Tên thói quen <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-neutral-light rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="Ví dụ: Tập thể dục, Đọc sách..."
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-dark">
          Mô tả
        </label>
        <textarea
          id="description"
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-neutral-light rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="Mô tả chi tiết về thói quen này"
        ></textarea>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-neutral-dark mb-2">
          Biểu tượng
        </label>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
          {ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              className={`h-10 w-10 flex items-center justify-center rounded-md text-xl ${
                formData.icon === icon ? 'bg-primary-light/20 ring-2 ring-primary' : 'bg-neutral-lightest hover:bg-neutral-light'
              }`}
              onClick={() => setFormData({ ...formData, icon })}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-neutral-dark mb-2">
          Màu sắc
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`h-10 w-10 rounded-md ${
                formData.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, color })}
            ></button>
          ))}
        </div>
      </div>
      
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-neutral-dark">
          Danh mục
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-neutral-light rounded-md focus:outline-none focus:ring-primary focus:border-primary"
        >
          <option value="general">Chung</option>
          <option value="health">Sức khỏe</option>
          <option value="learning">Học tập</option>
          <option value="work">Công việc</option>
          <option value="personal">Cá nhân</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-neutral-dark mb-2">
          Tần suất
        </label>
        <div className="mt-2 space-y-4">
          <div>
            <select
              name="type"
              value={formData.frequency.type}
              onChange={handleFrequencyChange}
              className="block w-full pl-3 pr-10 py-2 text-base border border-neutral-light rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="daily">Hàng ngày</option>
              <option value="weekly">Theo ngày trong tuần</option>
            </select>
          </div>
          
          {formData.frequency.type === 'weekly' && (
            <div className="flex flex-wrap gap-2">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, index) => (
                <button
                  key={day}
                  type="button"
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    formData.frequency.days.includes(index)
                      ? 'bg-primary text-white'
                      : 'bg-neutral-lightest text-neutral-dark hover:bg-neutral-light'
                  }`}
                  onClick={() => handleDayToggle(index)}
                >
                  {day}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="pt-2">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="reminderEnabled"
              name="enabled"
              type="checkbox"
              checked={formData.reminder.enabled}
              onChange={handleReminderChange}
              className="h-4 w-4 text-primary border-neutral-light rounded focus:ring-primary"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="reminderEnabled" className="font-medium text-neutral-dark">
              Bật nhắc nhở
            </label>
          </div>
        </div>
        
        {formData.reminder.enabled && (
          <div className="mt-3">
            <label htmlFor="reminderTime" className="block text-sm font-medium text-neutral-dark">
              Thời gian
            </label>
            <input
              type="time"
              id="reminderTime"
              name="time"
              value={formData.reminder.time}
              onChange={handleReminderChange}
              className="mt-1 block w-full px-3 py-2 border border-neutral-light rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Hủy
        </Button>
        <Button
          type="submit"
        >
          {habit ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  );
};

export default HabitForm;