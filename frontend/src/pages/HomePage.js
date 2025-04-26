import React, { useState } from 'react';
import { useHabit } from '../context/HabitContext';
import { useMood } from '../context/MoodContext';
import HabitList from '../components/habits/HabitList';
import HabitForm from '../components/habits/HabitForm';
import Modal from '../components/ui/Modal';
import Card from '../components/ui/Card';

const HomePage = () => {
  const { createHabit } = useHabit();
  const { createMood, currentMood } = useMood();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleAddHabit = () => {
    setIsModalOpen(true);
  };
  
  const handleSubmitHabit = async (habitData) => {
    try {
      await createHabit(habitData);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Lỗi khi tạo thói quen:', err);
    }
  };
  
  const handleMoodSelect = async (mood) => {
    try {
      await createMood({
        mood,
        date: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Lỗi khi lưu tâm trạng:', err);
    }
  };
  
  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      happy: '😊',
      good: '🙂',
      neutral: '😐',
      bad: '😔',
      awful: '😢',
    };
    
    return moodEmojis[mood] || '😐';
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-neutral-dark">Hôm nay bạn cảm thấy thế nào?</h2>
          {currentMood && (
            <span className="text-sm text-neutral">
              Đã lưu: {getMoodEmoji(currentMood.mood)}
            </span>
          )}
        </div>
        
        <div className="flex justify-center space-x-4 mt-4">
          <button
            onClick={() => handleMoodSelect('happy')}
            className="flex flex-col items-center"
          >
            <span className="text-3xl">😊</span>
            <span className="mt-1 text-sm">Vui vẻ</span>
          </button>
          <button
            onClick={() => handleMoodSelect('good')}
            className="flex flex-col items-center"
          >
            <span className="text-3xl">🙂</span>
            <span className="mt-1 text-sm">Tốt</span>
          </button>
          <button
            onClick={() => handleMoodSelect('neutral')}
            className="flex flex-col items-center"
          >
            <span className="text-3xl">😐</span>
            <span className="mt-1 text-sm">Bình thường</span>
          </button>
          <button
            onClick={() => handleMoodSelect('bad')}
            className="flex flex-col items-center"
          >
            <span className="text-3xl">😔</span>
            <span className="mt-1 text-sm">Không tốt</span>
          </button>
          <button
            onClick={() => handleMoodSelect('awful')}
            className="flex flex-col items-center"
          >
            <span className="text-3xl">😢</span>
            <span className="mt-1 text-sm">Tệ</span>
          </button>
        </div>
      </Card>
      
      <HabitList onAddHabit={handleAddHabit} />
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm thói quen mới"
      >
        <HabitForm
          onSubmit={handleSubmitHabit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default HomePage;