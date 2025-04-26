// src/components/mood/MoodInsight.js
import React, { useMemo } from 'react';
import Card from '../ui/Card';

const MoodInsight = ({ moods }) => {
  const insights = useMemo(() => {
    if (!moods.length) return null;
    
    // Đếm số lượng các loại tâm trạng
    const moodCounts = {
      happy: 0,
      good: 0,
      neutral: 0,
      bad: 0,
      awful: 0
    };
    
    moods.forEach(mood => {
      if (moodCounts[mood.mood] !== undefined) {
        moodCounts[mood.mood]++;
      }
    });
    
    // Tìm tâm trạng phổ biến nhất
    let mostCommonMood = 'neutral';
    let maxCount = 0;
    
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        mostCommonMood = mood;
        maxCount = count;
      }
    });
    
    // Tính số ngày ghi lại tâm trạng
    const recordedDays = moods.length;
    
    // Tính % các loại tâm trạng
    const positivePercent = ((moodCounts.happy + moodCounts.good) / recordedDays * 100).toFixed(0);
    const neutralPercent = ((moodCounts.neutral) / recordedDays * 100).toFixed(0);
    const negativePercent = ((moodCounts.bad + moodCounts.awful) / recordedDays * 100).toFixed(0);
    
    return {
      mostCommonMood,
      recordedDays,
      positivePercent,
      neutralPercent,
      negativePercent
    };
  }, [moods]);
  
  if (!insights) {
    return null;
  }
  
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
  
  return (
    <Card className="p-4">
      <h2 className="text-lg font-medium mb-4">Phân tích tâm trạng</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-neutral">Ngày đã ghi lại:</span>
          <span className="font-medium">{insights.recordedDays} ngày</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-neutral">Tâm trạng phổ biến nhất:</span>
          <span className="font-medium flex items-center">
            <span className="mr-2">{getMoodEmoji(insights.mostCommonMood)}</span>
            {getMoodLabel(insights.mostCommonMood)}
          </span>
        </div>
        
        <div className="py-2">
          <div className="flex justify-between mb-1">
            <span className="text-neutral">Tâm trạng tích cực:</span>
            <span className="font-medium text-green-500">{insights.positivePercent}%</span>
          </div>
          <div className="h-2 bg-neutral-lightest rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-400 rounded-full" 
              style={{ width: `${insights.positivePercent}%` }}
            ></div>
          </div>
        </div>
        
        <div className="py-2">
          <div className="flex justify-between mb-1">
            <span className="text-neutral">Tâm trạng trung tính:</span>
            <span className="font-medium text-blue-500">{insights.neutralPercent}%</span>
          </div>
          <div className="h-2 bg-neutral-lightest rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-400 rounded-full" 
              style={{ width: `${insights.neutralPercent}%` }}
            ></div>
          </div>
        </div>
        
        <div className="py-2">
          <div className="flex justify-between mb-1">
            <span className="text-neutral">Tâm trạng tiêu cực:</span>
            <span className="font-medium text-red-500">{insights.negativePercent}%</span>
          </div>
          <div className="h-2 bg-neutral-lightest rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-400 rounded-full" 
              style={{ width: `${insights.negativePercent}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MoodInsight;