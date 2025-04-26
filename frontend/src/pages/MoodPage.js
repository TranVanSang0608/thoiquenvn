// src/pages/MoodPage.js
import React, { useState, useEffect } from 'react';
import { useMood } from '../context/MoodContext';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MoodSelector from '../components/mood/MoodSelector';
import MoodCalendar from '../components/mood/MoodCalendar';
import MoodTimeline from '../components/mood/MoodTimeLine';
import MoodChart from '../components/mood/MoodChart';
import MoodInsight from '../components/mood/MoodInsight';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const MoodPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState('');
  const [moodNote, setMoodNote] = useState('');
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar', 'timeline', 'chart'
  
  const { moods, getMoods, createMood, getMoodByDate, currentMood } = useMood();
  const [loading, setLoading] = useState(true);
  
  // Lấy dữ liệu tâm trạng cho tháng hiện tại
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      
      await getMoods(
        format(start, 'yyyy-MM-dd'),
        format(end, 'yyyy-MM-dd')
      );
      
      setLoading(false);
    };
    
    fetchData();
  }, [currentMonth, getMoods]);
  
  // Lấy tâm trạng cho ngày được chọn
  useEffect(() => {
    const fetchMoodForDate = async () => {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      await getMoodByDate(formattedDate);
    };
    
    fetchMoodForDate();
  }, [selectedDate, getMoodByDate]);
  
  // Cập nhật form khi thay đổi ngày hoặc có dữ liệu mới
  useEffect(() => {
    if (currentMood) {
      setSelectedMood(currentMood.mood);
      setMoodNote(currentMood.note || '');
    } else {
      setSelectedMood('');
      setMoodNote('');
    }
  }, [currentMood, selectedDate]);
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };
  
  const handleSaveMood = async () => {
    if (!selectedMood) return;
    
    try {
      await createMood({
        mood: selectedMood,
        note: moodNote,
        date: format(selectedDate, 'yyyy-MM-dd')
      });
      
      // Cập nhật lại dữ liệu tháng hiện tại
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      
      await getMoods(
        format(start, 'yyyy-MM-dd'),
        format(end, 'yyyy-MM-dd')
      );
    } catch (error) {
      console.error('Lỗi khi lưu tâm trạng:', error);
    }
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
      <h1 className="text-2xl font-bold text-neutral-dark mb-6">Theo dõi tâm trạng</h1>
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="flex justify-center bg-white rounded-lg shadow-sm overflow-hidden">
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'calendar' ? 'bg-primary text-white' : 'text-neutral-dark hover:bg-neutral-lightest'}`}
            onClick={() => setActiveTab('calendar')}
          >
            Lịch
          </button>
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'timeline' ? 'bg-primary text-white' : 'text-neutral-dark hover:bg-neutral-lightest'}`}
            onClick={() => setActiveTab('timeline')}
          >
            Dòng thời gian
          </button>
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'chart' ? 'bg-primary text-white' : 'text-neutral-dark hover:bg-neutral-lightest'}`}
            onClick={() => setActiveTab('chart')}
          >
            Biểu đồ
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Content Area */}
        <div className="md:col-span-8">
          <Card className="p-4">
            {activeTab === 'calendar' && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <Button onClick={prevMonth} variant="outline" className="p-2">
                    <ChevronLeftIcon className="h-5 w-5" />
                  </Button>
                  
                  <h2 className="text-xl font-medium">
                    {format(currentMonth, 'MMMM yyyy', { locale: vi })}
                  </h2>
                  
                  <Button onClick={nextMonth} variant="outline" className="p-2">
                    <ChevronRightIcon className="h-5 w-5" />
                  </Button>
                </div>
                
                <MoodCalendar 
                  moods={moods} 
                  currentMonth={currentMonth}
                  selectedDate={selectedDate}
                  onSelectDate={handleDateSelect}
                />
              </>
            )}
            
            {activeTab === 'timeline' && (
              <>
                <h2 className="text-xl font-medium mb-4">Lịch sử tâm trạng</h2>
                <MoodTimeline moods={moods} />
              </>
            )}
            
            {activeTab === 'chart' && (
              <>
                <h2 className="text-xl font-medium mb-4">Biểu đồ tâm trạng</h2>
                <MoodChart 
                  moods={moods}
                  startDate={format(startOfMonth(currentMonth), 'yyyy-MM-dd')}
                  endDate={format(endOfMonth(currentMonth), 'yyyy-MM-dd')}
                />
              </>
            )}
          </Card>
        </div>
        
        {/* Sidebar / Form Area */}
        <div className="md:col-span-4">
          <Card className="p-4 mb-6">
            <h2 className="text-lg font-medium mb-4">
              {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
            </h2>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-neutral mb-2">Tâm trạng của bạn hôm nay?</h3>
              <MoodSelector 
                selectedMood={selectedMood}
                onSelect={setSelectedMood}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral mb-2">Ghi chú (tùy chọn)</label>
              <textarea
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="Ghi chú về tâm trạng của bạn..."
                className="w-full px-3 py-2 border border-neutral-light rounded-md"
                rows={4}
              ></textarea>
            </div>
            
            <Button
              onClick={handleSaveMood}
              className="w-full"
              disabled={!selectedMood}
            >
              Lưu tâm trạng
            </Button>
          </Card>
          
          {/* Thêm component MoodInsight */}
          <MoodInsight moods={moods} />
        </div>
      </div>
    </div>
  );
};

export default MoodPage;