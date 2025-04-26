import React, { useEffect } from 'react';
import { useHabit } from '../../context/HabitContext';
import HabitItem from './HabitItem';
import Card from '../ui/Card';
import { PlusIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const HabitList = ({ onAddHabit }) => {
  const { habits, loading, getHabits } = useHabit();
  
  useEffect(() => {
    getHabits();
  }, [getHabits]);
  
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const today = format(new Date(), 'EEEE, dd/MM/yyyy', { locale: vi });
  const capitalizedToday = today.charAt(0).toUpperCase() + today.slice(1);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-neutral-dark">{capitalizedToday}</h2>
        <button
          onClick={onAddHabit}
          className="flex items-center text-sm text-primary hover:text-primary-dark"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Thêm thói quen
        </button>
      </div>
      
      {habits.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-neutral mb-4">Bạn chưa có thói quen nào.</p>
          <button
            onClick={onAddHabit}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
          >
            Thêm thói quen đầu tiên
          </button>
        </Card>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <HabitItem key={habit._id} habit={habit} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HabitList;