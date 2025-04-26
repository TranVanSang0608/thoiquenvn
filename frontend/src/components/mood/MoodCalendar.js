// src/components/mood/MoodCalendar.js
import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { vi } from 'date-fns/locale';

const MoodCalendar = ({ moods, currentMonth, onSelectDate, selectedDate }) => {
  // Lấy tất cả ngày trong tháng hiện tại
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Tính số ô trống trước ngày đầu tiên của tháng
  const startDay = monthStart.getDay(); // 0: Chủ nhật, 1-6: Thứ 2 - Thứ 7
  const startEmptyCells = startDay === 0 ? 6 : startDay - 1; // Điều chỉnh để tuần bắt đầu từ Thứ 2
  
  // Lấy biểu tượng tương ứng với tâm trạng
  const getMoodEmoji = (mood) => {
    switch(mood) {
      case 'happy': return '😊';
      case 'good': return '🙂';
      case 'neutral': return '😐';
      case 'bad': return '😔';
      case 'awful': return '😢';
      default: return '';
    }
  };
  
  // Lấy màu sắc tương ứng với tâm trạng
  const getMoodColor = (mood) => {
    switch(mood) {
      case 'happy': return 'bg-yellow-100 border-yellow-300';
      case 'good': return 'bg-green-100 border-green-300';
      case 'neutral': return 'bg-blue-100 border-blue-300';
      case 'bad': return 'bg-red-100 border-red-300';
      case 'awful': return 'bg-purple-100 border-purple-300';
      default: return 'bg-white';
    }
  };
  
  return (
    <div>
      <div className="grid grid-cols-7 text-center mb-2">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, index) => (
          <div key={index} className="font-medium text-neutral-dark py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {/* Ô trống trước ngày đầu tiên của tháng */}
        {Array.from({ length: startEmptyCells }).map((_, index) => (
          <div key={`empty-start-${index}`} className="aspect-square p-1"></div>
        ))}
        
        {/* Các ngày trong tháng */}
        {monthDays.map((day) => {
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          
          // Tìm mood cho ngày này
          const dayMood = moods.find(m => isSameDay(new Date(m.date), day));
          const hasMood = !!dayMood;
          
          return (
            <div
              key={day.toString()}
              className={`aspect-square flex flex-col items-center cursor-pointer border rounded-md p-1
                ${isToday ? 'border-primary' : 'border-transparent'}
                ${isSelected ? 'ring-2 ring-primary' : ''}
                ${hasMood ? getMoodColor(dayMood.mood) : 'hover:bg-neutral-50'}
              `}
              onClick={() => onSelectDate(day)}
            >
              <div className={`text-sm ${isToday ? 'font-bold text-primary' : ''}`}>
                {format(day, 'd')}
              </div>
              {hasMood && (
                <div className="text-xl mt-1">
                  {getMoodEmoji(dayMood.mood)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoodCalendar;