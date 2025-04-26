// src/components/mood/MoodTimeline.js
import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const MoodTimeline = ({ moods }) => {
  // Sắp xếp moods theo ngày, mới nhất lên đầu
  const sortedMoods = [...moods].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
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
  
  // Lấy tên tâm trạng
  const getMoodLabel = (mood) => {
    switch(mood) {
      case 'happy': return 'Vui vẻ';
      case 'good': return 'Tốt';
      case 'neutral': return 'Bình thường';
      case 'bad': return 'Không tốt';
      case 'awful': return 'Tệ';
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
  
  if (sortedMoods.length === 0) {
    return (
      <div className="text-center py-6 text-neutral">
        Chưa có dữ liệu tâm trạng nào được ghi lại.
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {sortedMoods.map((moodEntry) => (
        <div 
          key={moodEntry._id} 
          className={`p-4 rounded-lg border ${getMoodColor(moodEntry.mood)}`}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <span className="text-2xl mr-2">{getMoodEmoji(moodEntry.mood)}</span>
              <span className="font-medium">{getMoodLabel(moodEntry.mood)}</span>
            </div>
            <div className="text-sm text-neutral">
              {format(new Date(moodEntry.date), 'EEEE, dd/MM/yyyy', { locale: vi })}
            </div>
          </div>
          
          {moodEntry.note && (
            <div className="mt-2 text-neutral-dark">
              {moodEntry.note}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MoodTimeline;