import React from 'react';
import { format, eachDayOfInterval, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';

const CalendarHeatmap = ({ completionData, days = 90 }) => {
  const today = new Date();
  const startDate = subDays(today, days - 1);
  
  const dateRange = eachDayOfInterval({
    start: startDate,
    end: today
  });
  
  // Lấy dữ liệu hoàn thành cho mỗi ngày
  const getCompletionRate = (date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayData = completionData[dateString];
    
    if (!dayData) return 0;
    return dayData.completed / dayData.total;
  };
  
  // Xác định màu dựa trên tỷ lệ hoàn thành
  const getColor = (rate) => {
    if (rate === 0) return 'bg-neutral-light';
    if (rate < 0.25) return 'bg-primary-light/25';
    if (rate < 0.5) return 'bg-primary-light/50';
    if (rate < 0.75) return 'bg-primary-light/75';
    return 'bg-primary';
  };

  // Tạo mảng chứa các ngày trong tuần (header)
  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  
  return (
    <div className="my-4">
      <h3 className="text-lg font-medium mb-2">Hoạt động {days} ngày qua</h3>
      
      <div className="flex">
        {/* Hiển thị header cho các ngày trong tuần */}
        <div className="mr-2 mt-6">
          {weekDays.map((day, index) => (
            <div key={index} className="h-4 flex items-center justify-end text-xs text-gray-500 mb-1">
              {index % 2 === 0 ? day : ''}
            </div>
          ))}
        </div>
        
        {/* Hiển thị biểu đồ nhiệt */}
        <div className="flex flex-wrap">
          {Array.from({ length: 7 }).map((_, dayOfWeek) => (
            <div key={dayOfWeek} className="flex flex-col w-4 mr-1">
              {dateRange
                .filter(date => date.getDay() === dayOfWeek)
                .map(date => {
                  const rate = getCompletionRate(date);
                  const color = getColor(rate);
                  const tooltipText = `${format(date, 'EEEE, dd/MM/yyyy', { locale: vi })}: ${Math.round(rate * 100)}%`;
                  
                  return (
                    <div 
                      key={date.toISOString()}
                      className={`w-4 h-4 rounded-sm mb-1 ${color} cursor-pointer hover:opacity-80`}
                      title={tooltipText}
                    ></div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Chú thích */}
      <div className="flex items-center text-xs mt-2">
        <span className="mr-1">Ít hoàn thành</span>
        <div className={`w-3 h-3 rounded-sm bg-neutral-light mx-0.5`}></div>
        <div className={`w-3 h-3 rounded-sm bg-primary-light/25 mx-0.5`}></div>
        <div className={`w-3 h-3 rounded-sm bg-primary-light/50 mx-0.5`}></div>
        <div className={`w-3 h-3 rounded-sm bg-primary-light/75 mx-0.5`}></div>
        <div className={`w-3 h-3 rounded-sm bg-primary mx-0.5`}></div>
        <span className="ml-1">Nhiều hoàn thành</span>
      </div>
    </div>
  );
};

export default CalendarHeatmap;