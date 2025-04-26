import React, { useState, useMemo } from 'react';
import { format, eachDayOfInterval, parseISO, isSameDay, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';

const HeatmapCalendar = ({ data, startDate, endDate }) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Tạo mảng các ngày trong khoảng thời gian
  const daysInRange = useMemo(() => {
    if (!startDate || !endDate) return [];
    
    return eachDayOfInterval({
      start: parseISO(startDate),
      end: parseISO(endDate)
    });
  }, [startDate, endDate]);
  
  // Tạo ma trận các ngày cho lịch
  const calendarMatrix = useMemo(() => {
    if (daysInRange.length === 0) return [];
    
    const matrix = [];
    const firstDay = daysInRange[0];
    const totalWeeks = Math.ceil(daysInRange.length / 7);
    
    for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
      const week = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const day = addDays(firstDay, weekIndex * 7 + dayIndex);
        
        // Kiểm tra xem ngày này có nằm trong khoảng không
        const isInRange = daysInRange.some(d => isSameDay(d, day));
        
        if (isInRange) {
          week.push(day);
        } else {
          week.push(null);
        }
      }
      matrix.push(week);
    }
    
    return matrix;
  }, [daysInRange]);
  
  // Hàm để lấy dữ liệu cho một ngày cụ thể
  const getDayData = (day) => {
    if (!day || !data || data.length === 0) return null;
    
    const formattedDay = format(day, 'yyyy-MM-dd');
    return data.find(item => item.date === formattedDay);
  };
  
  // Hàm để lấy màu dựa trên tỷ lệ hoàn thành
  const getColorByRate = (rate) => {
    if (rate === undefined || rate === null) return 'bg-neutral-lightest';
    
    if (rate === 0) return 'bg-neutral-lightest';
    if (rate <= 0.25) return 'bg-red-100';
    if (rate <= 0.5) return 'bg-orange-100';
    if (rate <= 0.75) return 'bg-yellow-100';
    if (rate <= 0.9) return 'bg-green-100';
    return 'bg-green-300';
  };
  
  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {/* Day headers */}
        <div className="flex mb-2">
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, index) => (
            <div key={index} className="w-10 h-10 flex items-center justify-center text-xs text-neutral">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="space-y-2">
          {calendarMatrix.map((week, weekIndex) => (
            <div key={weekIndex} className="flex">
              {week.map((day, dayIndex) => {
                const dayData = getDayData(day);
                const completionRate = dayData?.rate;
                const colorClass = getColorByRate(completionRate);
                
                return (
                  <div key={dayIndex} 
                    className="w-10 h-10 flex items-center justify-center"
                    onMouseEnter={() => day && setHoveredDay({ day, data: dayData })}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {day ? (
                      <div 
                        className={`w-8 h-8 rounded-md ${colorClass} flex items-center justify-center text-xs cursor-pointer transition-colors duration-200`}
                      >
                        {format(day, 'd')}
                      </div>
                    ) : (
                      <div className="w-8 h-8"></div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Hover tooltip */}
        {hoveredDay && (
          <div className="mt-4 p-3 bg-white border border-neutral-lightest rounded-md shadow-sm">
            <p className="text-sm font-medium">
              {format(hoveredDay.day, 'EEEE, dd MMMM yyyy', { locale: vi })}
            </p>
            
            {hoveredDay.data ? (
              <div className="mt-1 text-sm">
                <p>Đã hoàn thành: <span className="font-medium">{hoveredDay.data.completed}/{hoveredDay.data.total}</span></p>
                <p>Tỷ lệ: <span className="font-medium">{Math.round(hoveredDay.data.rate * 100)}%</span></p>
              </div>
            ) : (
              <p className="mt-1 text-sm text-neutral">Không có dữ liệu</p>
            )}
          </div>
        )}
        
        {/* Legend */}
        <div className="mt-6 flex items-center justify-end space-x-4">
          <div className="text-xs text-neutral">Tỷ lệ hoàn thành:</div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-neutral-lightest rounded"></div>
            <span className="text-xs">0%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-red-100 rounded"></div>
            <span className="text-xs">1-25%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-orange-100 rounded"></div>
            <span className="text-xs">26-50%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-yellow-100 rounded"></div>
            <span className="text-xs">51-75%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span className="text-xs">76-90%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-green-300 rounded"></div>
            <span className="text-xs">91-100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapCalendar;