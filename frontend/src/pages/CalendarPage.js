// src/pages/CalendarPage.js
import React, { useState, useEffect } from 'react';
import { useHabit } from '../context/HabitContext';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  addMonths, 
  subMonths, 
  isSameDay, 
  isSameMonth, 
  isToday,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { vi } from 'date-fns/locale';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ViewColumnsIcon
} from '@heroicons/react/24/outline';
import CalendarHeatmap from '../components/calendar/CalendarHeatmap';
import HabitCompletionHistory from '../components/habits/HabitCompletionHistory';
import Modal from '../components/ui/Modal';

const VIEW_TYPES = {
  MONTH: 'month',
  WEEK: 'week'
};

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [viewType, setViewType] = useState(VIEW_TYPES.MONTH);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [habitCompletions, setHabitCompletions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const { 
    habits, 
    getHabits, 
    completeHabit, 
    uncompleteHabit, 
    getHabitHistory,
    getHabitCompletionsForDate
  } = useHabit();

  const [completionsMap, setCompletionsMap] = useState({});
  const [heatmapData, setHeatmapData] = useState({});
  const [loading, setLoading] = useState(true);
  const [animation, setAnimation] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await getHabits();
      await fetchCompletionsForRange();
      await prepareHeatmapData();
      setLoading(false);
    };

    fetchData();
  }, [getHabits]);

  useEffect(() => {
    // Lấy tất cả các ngày trong khoảng thời gian hiển thị (tháng hoặc tuần)
    updateCalendarDays();
    
    // Lấy lại dữ liệu hoàn thành cho khoảng thời gian mới
    fetchCompletionsForRange();
  }, [currentDate, viewType]);

  const updateCalendarDays = () => {
    let daysInRange;
    
    if (viewType === VIEW_TYPES.MONTH) {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      daysInRange = eachDayOfInterval({ start: monthStart, end: monthEnd });
    } else {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Tuần bắt đầu từ thứ 2
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      daysInRange = eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
    
    // Thêm animation khi chuyển đổi ngày
    setAnimation("animate-fadeIn");
    setTimeout(() => {
      setAnimation("");
    }, 300);
    
    setCalendarDays(daysInRange);
  };

  // Hàm lấy dữ liệu hoàn thành thói quen cho khoảng thời gian hiển thị
  const fetchCompletionsForRange = async () => {
    try {
      let rangeStart, rangeEnd;
      
      if (viewType === VIEW_TYPES.MONTH) {
        rangeStart = startOfMonth(currentDate);
        rangeEnd = endOfMonth(currentDate);
      } else {
        rangeStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        rangeEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      }
      
      // Lấy lịch sử hoàn thành cho mỗi thói quen
      const completions = {};
      
      if (habits && habits.length > 0) {
        for (const habit of habits) {
          try {
            const history = await getHabitHistory(
              habit._id, 
              format(rangeStart, 'yyyy-MM-dd'),
              format(rangeEnd, 'yyyy-MM-dd')
            );
            
            // Lưu trữ dữ liệu vào một đối tượng dễ truy vấn
            if (history && history.completions) {
              history.completions.forEach(completion => {
                const dateKey = format(new Date(completion.date), 'yyyy-MM-dd');
                if (!completions[dateKey]) {
                  completions[dateKey] = [];
                }
                completions[dateKey].push(habit._id);
              });
            }
          } catch (error) {
            console.error(`Lỗi khi lấy lịch sử cho thói quen ${habit.name}:`, error);
          }
        }
      }
      
      setCompletionsMap(completions);
      
      // Lấy dữ liệu hoàn thành cho ngày đã chọn
      await fetchCompletionsForSelectedDate();
      
      // Cập nhật dữ liệu cho heatmap nếu đang ở chế độ xem tháng
      if (viewType === VIEW_TYPES.MONTH) {
        await prepareHeatmapData();
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu hoàn thành:', error);
    }
  };

  const fetchCompletionsForSelectedDate = async () => {
    try {
      const completionsData = await getHabitCompletionsForDate(selectedDate);
      setHabitCompletions(completionsData || []);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu hoàn thành cho ngày đã chọn:', error);
    }
  };

  // Hàm chuẩn bị dữ liệu cho heatmap
  const prepareHeatmapData = async () => {
    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 90); // 90 ngày trước
      
      const heatmapCompletions = {};
      
      if (habits && habits.length > 0) {
        const totalHabits = habits.length;
        
        // Lấy dữ liệu cho 90 ngày gần đây
        for (const habit of habits) {
          try {
            const history = await getHabitHistory(
              habit._id, 
              format(startDate, 'yyyy-MM-dd'),
              format(today, 'yyyy-MM-dd')
            );
            
            if (history && history.completions) {
              history.completions.forEach(completion => {
                const dateKey = format(new Date(completion.date), 'yyyy-MM-dd');
                if (!heatmapCompletions[dateKey]) {
                  heatmapCompletions[dateKey] = { completed: 0, total: totalHabits };
                }
                heatmapCompletions[dateKey].completed += 1;
              });
            }
          } catch (error) {
            console.error(`Lỗi khi lấy lịch sử cho heatmap:`, error);
          }
        }
        
        // Đảm bảo tất cả các ngày đều có dữ liệu
        const dateRange = eachDayOfInterval({
          start: startDate,
          end: today
        });
        
        dateRange.forEach(date => {
          const dateKey = format(date, 'yyyy-MM-dd');
          if (!heatmapCompletions[dateKey]) {
            heatmapCompletions[dateKey] = { completed: 0, total: totalHabits };
          }
        });
      }
      
      setHeatmapData(heatmapCompletions);
    } catch (error) {
      console.error('Lỗi khi chuẩn bị dữ liệu heatmap:', error);
    }
  };

  // Hàm kiểm tra thói quen đã hoàn thành vào ngày cụ thể chưa
  const getCompletedHabitsForDate = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const completedHabitIds = completionsMap[dateKey] || [];
    
    const completedHabits = habits.filter(habit => 
      completedHabitIds.includes(habit._id)
    );
    
    return completedHabits;
  };

  const prevPeriod = () => {
    if (viewType === VIEW_TYPES.MONTH) {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const nextPeriod = () => {
    if (viewType === VIEW_TYPES.MONTH) {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    // Mỗi khi chọn ngày, cập nhật dữ liệu hoàn thành cho ngày đó
    fetchCompletionsForSelectedDate();
  };

  const toggleViewType = () => {
    setViewType(viewType === VIEW_TYPES.MONTH ? VIEW_TYPES.WEEK : VIEW_TYPES.MONTH);
  };

  const handleToggleHabit = async (habit) => {
    // Kiểm tra xem thói quen có được hoàn thành trong ngày đã chọn không
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const completedHabitIds = completionsMap[dateKey] || [];
    const isCompletedToday = completedHabitIds.includes(habit._id);

    try {
      if (isCompletedToday) {
        await uncompleteHabit(habit._id, dateKey);
      } else {
        await completeHabit(habit._id, dateKey);
      }
      // Cập nhật lại dữ liệu hoàn thành
      await fetchCompletionsForRange();
      await fetchCompletionsForSelectedDate();
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái hoàn thành:', error);
    }
  };

  const handleViewHabitHistory = async (habit) => {
    setSelectedHabit(habit);
    
    try {
      // Lấy lịch sử hoàn thành cho thói quen này
      const history = await getHabitHistory(habit._id);
      setHabitCompletions(history ? history.completions || [] : []);
      setShowHistory(true);
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử thói quen:', error);
    }
  };

  const exportCalendarData = () => {
    try {
      // Chuẩn bị dữ liệu xuất ra
      const exportData = {
        habits,
        completionsMap,
        exportDate: new Date().toISOString()
      };
      
      // Tạo Blob và link để tải xuống
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Tạo link download và click
      const link = document.createElement('a');
      link.download = `thoiquen-calendar-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
      link.href = url;
      link.click();
      
      // Giải phóng URL object
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Lỗi khi xuất dữ liệu:', error);
    }
  };

  // Lọc habits cho ngày đã chọn
  const habitsForSelectedDate = habits || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const periodTitle = viewType === VIEW_TYPES.MONTH 
    ? format(currentDate, 'MMMM yyyy', { locale: vi })
    : `Tuần ${format(currentDate, 'w', { locale: vi })} - ${format(currentDate, 'yyyy', { locale: vi })}`;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-dark">Lịch thói quen</h1>
        
        <div className="flex space-x-2">
          <Button 
            onClick={toggleViewType} 
            variant="outline" 
            className="flex items-center"
          >
            {viewType === VIEW_TYPES.MONTH ? (
              <>
                <ViewColumnsIcon className="h-4 w-4 mr-1" />
                Xem theo tuần
              </>
            ) : (
              <>
                <CalendarIcon className="h-4 w-4 mr-1" />
                Xem theo tháng
              </>
            )}
          </Button>
          
          <Button 
            onClick={exportCalendarData}
            variant="outline"
            className="flex items-center"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
            Xuất dữ liệu
          </Button>
        </div>
      </div>
      
      {/* Chỉ hiển thị heatmap trong chế độ xem tháng */}
      {viewType === VIEW_TYPES.MONTH && (
        <Card className="p-4 mb-6">
          <CalendarHeatmap completionData={heatmapData} days={90} />
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Calendar View */}
        <div className="md:col-span-8">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">
                {periodTitle}
              </h2>
              <div className="flex space-x-2">
                <Button onClick={prevPeriod} variant="outline" className="p-2">
                  <ChevronLeftIcon className="h-5 w-5" />
                </Button>
                <Button 
                  onClick={() => {
                    setCurrentDate(new Date());
                    setSelectedDate(new Date());
                  }}
                  variant="outline"
                  className="px-3 py-2 text-sm"
                >
                  Hôm nay
                </Button>
                <Button onClick={nextPeriod} variant="outline" className="p-2">
                  <ChevronRightIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Calendar Header */}
            <div className="grid grid-cols-7 text-center mb-2">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, index) => (
                <div key={index} className="font-medium text-neutral-dark py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className={`grid grid-cols-7 gap-1 ${animation}`}>
              {/* Spaces for days before the first day of week in MONTH view */}
              {viewType === VIEW_TYPES.MONTH && 
                Array.from({ 
                  length: (new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() + 6) % 7 
                }).map((_, index) => (
                  <div key={`empty-${index}`} className="h-24 bg-neutral-lightest rounded-md"></div>
                ))
              }
              
              {/* Calendar days */}
              {calendarDays.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentToday = isToday(day);
                const isCurrentMonth = viewType === VIEW_TYPES.WEEK || isSameMonth(day, currentDate);
                
                // Đếm số thói quen được hoàn thành trong ngày này
                const completedHabits = getCompletedHabitsForDate(day);
                const completedCount = completedHabits.length;
                const totalCount = habits.length;
                
                // Tính toán màu nền dựa trên tỷ lệ hoàn thành
                let progressClass = '';
                let completionRatio = 0;
                
                if (totalCount > 0) {
                  completionRatio = completedCount / totalCount;
                  if (completionRatio === 1) {
                    progressClass = 'bg-green-100'; // Hoàn thành tất cả
                  } else if (completionRatio > 0) {
                    progressClass = 'bg-yellow-100'; // Hoàn thành một phần
                  }
                }
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`h-24 p-1 rounded-md border cursor-pointer transition-colors duration-200
                      ${isSelected ? 'border-primary bg-primary-light/10' : 'border-neutral-light hover:bg-neutral-lightest'}
                      ${isCurrentToday ? 'bg-neutral-lightest border-primary-light' : ''}
                      ${progressClass}
                      ${!isCurrentMonth ? 'opacity-50' : ''}
                    `}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className={`text-right text-sm mb-1 ${isCurrentToday ? 'font-bold text-primary' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    
                    {totalCount > 0 && (
                      <div className="mt-1 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          completionRatio === 1 ? 'bg-green-200 text-green-800' :
                          completionRatio > 0 ? 'bg-yellow-200 text-yellow-800' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {completedCount}/{totalCount}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        
        {/* Selected Date View */}
        <div className="md:col-span-4">
          <Card className="p-4 h-full">
            <h2 className="text-xl font-medium mb-4">
              {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
            </h2>
            
            {habitsForSelectedDate.length === 0 ? (
              <div className="text-center text-neutral p-4">
                <p>Không có thói quen nào cho ngày này.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {habitsForSelectedDate.map(habit => {
                  const dateKey = format(selectedDate, 'yyyy-MM-dd');
                  const completedHabitIds = completionsMap[dateKey] || [];
                  const isCompleted = completedHabitIds.includes(habit._id);
                  
                  return (
                    <div key={habit._id} className="rounded-md border border-neutral-light">
                      <div 
                        className="flex items-center p-3 hover:bg-neutral-lightest cursor-pointer"
                        onClick={() => handleToggleHabit(habit)}
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                          style={{ backgroundColor: `${habit.color || '#e5e7eb'}20` }}
                        >
                          <span className="text-xl">{habit.icon || '✓'}</span>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium">{habit.name}</h3>
                          {habit.description && (
                            <p className="text-sm text-gray-500">{habit.description}</p>
                          )}
                        </div>
                        
                        <div>
                          {isCompleted ? (
                            <div className="h-6 w-6 bg-success rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div className="h-6 w-6 border-2 border-neutral-light rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <div className="px-3 py-2 border-t border-neutral-light bg-neutral-lightest/30">
                        <button
                          className="text-sm text-primary hover:underline"
                          onClick={() => handleViewHabitHistory(habit)}
                        >
                          Xem lịch sử hoàn thành
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
      
      {/* Modal hiển thị lịch sử hoàn thành */}
      <Modal
        isOpen={showHistory && selectedHabit !== null}
        onClose={() => setShowHistory(false)}
        title={selectedHabit ? `Lịch sử hoàn thành: ${selectedHabit.name}` : 'Lịch sử hoàn thành'}
      >
        <HabitCompletionHistory completions={habitCompletions} />
      </Modal>
    </div>
  );
};

export default CalendarPage;