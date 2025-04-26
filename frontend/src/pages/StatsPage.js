// src/pages/StatsPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useHabit } from '../context/HabitContext';
import { useMood } from '../context/MoodContext';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import Card from '../components/ui/Card';
import StatsSummaryCard from '../components/stats/StatsSummaryCard';
import StatBarChart from '../components/stats/StatBarChart';
import StatLineChart from '../components/stats/StatLineChart';
import StatPieChart from '../components/stats/StatPieChart';
import HeatmapCalendar from '../components/stats/HeatmapCalendar';
import api from '../utils/api';
import { CSVLink } from 'react-csv';

const StatsPage = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { moods, getMoods } = useMood();
  
  // Thiết lập ngày bắt đầu và kết thúc dựa trên timeRange
  const dateRange = useMemo(() => {
    let startDate, endDate;
    
    if (timeRange === 'week') {
      startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      endDate = format(new Date(), 'yyyy-MM-dd');
    } else if (timeRange === 'month') {
      startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');
    } else if (timeRange === 'year') {
      startDate = format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd');
      endDate = format(new Date(new Date().getFullYear(), 11, 31), 'yyyy-MM-dd');
    }
    
    return { startDate, endDate };
  }, [timeRange]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Lấy dữ liệu thống kê từ API
        const { data } = await api.get(`/habits/stats/overview?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
        setStatsData(data);
        
        // Lấy dữ liệu tâm trạng trong cùng khoảng thời gian
        await getMoods(dateRange.startDate, dateRange.endDate);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu thống kê:', error);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [dateRange, getMoods]);
  
  // Dữ liệu phân bố tâm trạng
  const moodDistribution = useMemo(() => {
    const distribution = {
      happy: 0,
      good: 0,
      neutral: 0,
      bad: 0,
      awful: 0
    };
    
    moods.forEach(mood => {
      if (distribution[mood.mood] !== undefined) {
        distribution[mood.mood]++;
      }
    });
    
    return [
      { name: 'Vui vẻ', value: distribution.happy, color: '#FDE047' },
      { name: 'Tốt', value: distribution.good, color: '#A3E635' },
      { name: 'Bình thường', value: distribution.neutral, color: '#93C5FD' },
      { name: 'Không tốt', value: distribution.bad, color: '#F87171' },
      { name: 'Tệ', value: distribution.awful, color:'#D8B4FE' }
   ];
 }, [moods]);
 
 // Chuẩn bị dữ liệu để xuất CSV
 const prepareExportData = () => {
   if (!statsData?.completionData) return [];
   
   return statsData.completionData.map(item => ({
     Ngày: item.date,
     'Số thói quen hoàn thành': item.completed,
     'Tổng số thói quen': item.total,
     'Tỷ lệ hoàn thành': `${Math.round(item.rate * 100)}%`
   }));
 };
 
 if (loading) {
   return (
     <div className="flex justify-center items-center h-64">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
     </div>
   );
 }
 
 return (
   <div className="max-w-6xl mx-auto p-4">
     <div className="flex justify-between items-center mb-6">
       <h1 className="text-2xl font-bold text-neutral-dark">Thống kê</h1>
       
       {/* Nút xuất dữ liệu */}
       <CSVLink
         data={prepareExportData()}
         filename={`thoiquen-thongke-${timeRange}-${format(new Date(), 'yyyy-MM-dd')}.csv`}
         className="px-3 py-2 bg-neutral-light hover:bg-neutral text-neutral-dark rounded-md text-sm flex items-center"
       >
         <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
         </svg>
         Xuất dữ liệu
       </CSVLink>
     </div>
     
     {/* Time Range Selector */}
     <div className="mb-6">
       <div className="flex justify-center bg-white rounded-lg shadow-sm overflow-hidden">
         <button
           className={`px-6 py-3 font-medium ${timeRange === 'week' ? 'bg-primary text-white' : 'text-neutral-dark hover:bg-neutral-lightest'}`}
           onClick={() => setTimeRange('week')}
         >
           Tuần này
         </button>
         <button
           className={`px-6 py-3 font-medium ${timeRange === 'month' ? 'bg-primary text-white' : 'text-neutral-dark hover:bg-neutral-lightest'}`}
           onClick={() => setTimeRange('month')}
         >
           Tháng này
         </button>
         <button
           className={`px-6 py-3 font-medium ${timeRange === 'year' ? 'bg-primary text-white' : 'text-neutral-dark hover:bg-neutral-lightest'}`}
           onClick={() => setTimeRange('year')}
         >
           Năm nay
         </button>
       </div>
     </div>
     
     {/* Summary Cards */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
       <StatsSummaryCard 
         title="Tỷ lệ hoàn thành"
         value={statsData?.overview.completionRate || 0}
         unit="%"
         color="primary"
         icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
       />
       
       <StatsSummaryCard 
         title="Chuỗi ngày hiện tại"
         value={statsData?.overview.currentStreak || 0}
         unit="ngày"
         color="success"
         icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
       />
       
       <StatsSummaryCard 
         title="Chuỗi ngày tốt nhất"
         value={statsData?.overview.bestStreak || 0}
         unit="ngày"
         color="warning"
         icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
       />
     </div>
     
     {/* Heatmap Calendar */}
     {timeRange === 'month' || timeRange === 'year' ? (
       <Card className="p-6 mb-6">
         <h2 className="text-xl font-medium text-neutral-dark mb-4">Biểu đồ nhiệt hoàn thành</h2>
         <HeatmapCalendar 
           data={statsData?.completionData || []}
           startDate={dateRange.startDate}
           endDate={dateRange.endDate}
         />
       </Card>
     ) : null}
     
     {/* Completion Rate Chart */}
     <Card className="p-6 mb-6">
       <StatLineChart 
         title="Tỷ lệ hoàn thành theo ngày"
         data={statsData?.completionData || []}
         xKey="date"
         lines={[
           { dataKey: 'rate', name: 'Tỷ lệ hoàn thành', color: '#8A5CF5' }
         ]}
         height={300}
         yAxisFormatter={(value) => `${Math.round(value * 100)}%`}
       />
     </Card>
     
     {/* Mood and Habits Stats */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
       {/* Top Habits */}
       <Card className="p-6">
         <h2 className="text-xl font-medium text-neutral-dark mb-4">Thói quen tốt nhất</h2>
         <div className="space-y-4">
           {statsData?.topHabits && statsData.topHabits.length > 0 ? (
             statsData.topHabits.map((habit, index) => (
               <div key={index} className="mb-2">
                 <div className="flex justify-between items-center mb-1">
                   <span className="font-medium">
                     <span className="mr-2">{habit.icon}</span>
                     {habit.title}
                   </span>
                   <span className="text-sm text-neutral">{Math.round(habit.completionRate)}%</span>
                 </div>
                 <div className="h-2 bg-neutral-lightest rounded-full overflow-hidden">
                   <div 
                     className="h-full rounded-full" 
                     style={{ 
                       width: `${Math.round(habit.completionRate)}%`,
                       backgroundColor: habit.color || '#8A5CF5'
                     }}
                   ></div>
                 </div>
               </div>
             ))
           ) : (
             <div className="text-center text-neutral py-8">
               Chưa có đủ dữ liệu thói quen
             </div>
           )}
         </div>
       </Card>
       
       {/* Mood Distribution */}
       <Card className="p-6">
         <StatPieChart
           title="Phân bố tâm trạng"
           data={moodDistribution}
           height={280}
         />
       </Card>
     </div>
     
     {/* Task Completion Chart */}
     <Card className="p-6">
       <StatBarChart
         title="Số thói quen hoàn thành theo ngày"
         data={statsData?.completionData || []}
         xKey="date"
         bars={[
           { dataKey: 'completed', name: 'Đã hoàn thành', color: '#34D399' },
           { dataKey: 'total', name: 'Tổng số', color: '#9CA3AF' }
         ]}
         height={300}
       />
     </Card>
   </div>
 );
};

export default StatsPage;