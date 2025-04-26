// src/components/mood/MoodChart.js
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, eachDayOfInterval } from 'date-fns';
import { vi } from 'date-fns/locale';

const MoodChart = ({ moods, startDate, endDate }) => {
  const chartData = useMemo(() => {
    // Tạo mảng tất cả ngày trong khoảng
    const days = eachDayOfInterval({ start: new Date(startDate), end: new Date(endDate) });
    
    // Giá trị số cho các tâm trạng
    const moodValues = {
      happy: 5,
      good: 4,
      neutral: 3,
      bad: 2,
      awful: 1
    };
    
    // Tạo dữ liệu cho biểu đồ
    return days.map(day => {
      const dayStr = day.toISOString().split('T')[0];
      const dayMood = moods.find(m => m.date.split('T')[0] === dayStr);
      
      return {
        date: format(day, 'dd/MM'),
        value: dayMood ? moodValues[dayMood.mood] : null,
        mood: dayMood ? dayMood.mood : null
      };
    });
  }, [moods, startDate, endDate]);
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const moodValue = payload[0].value;
      let moodText = '';
      let emoji = '';
      
      switch (moodValue) {
        case 5: moodText = 'Vui vẻ'; emoji = '😊'; break;
        case 4: moodText = 'Tốt'; emoji = '🙂'; break;
        case 3: moodText = 'Bình thường'; emoji = '😐'; break;
        case 2: moodText = 'Không tốt'; emoji = '😔'; break;
        case 1: moodText = 'Tệ'; emoji = '😢'; break;
        default: return null;
      }
      
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="text-xs text-neutral">{`Ngày ${label}`}</p>
          <p className="font-medium flex items-center">
            <span className="mr-1">{emoji}</span>
            {moodText}
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  if (!chartData.some(d => d.value !== null)) {
    return (
      <div className="text-center py-6 text-neutral">
        Chưa đủ dữ liệu để hiển thị biểu đồ.
      </div>
    );
  }
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis 
            domain={[1, 5]} 
            ticks={[1, 2, 3, 4, 5]} 
            tickFormatter={(value) => {
              switch (value) {
                case 5: return '😊';
                case 4: return '🙂';
                case 3: return '😐';
                case 2: return '😔';
                case 1: return '😢';
                default: return '';
              }
            }} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="value" 
            name="Tâm trạng" 
            stroke="#8A5CF5" 
            connectNulls={true}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodChart;