import React from 'react';
import { Link } from 'react-router-dom';
import { useHabit } from '../../context/HabitContext';
import Card from '../ui/Card';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon as CheckCircleOutlineIcon } from '@heroicons/react/24/outline';

const HabitItem = ({ habit }) => {
  const { completeHabit, uncompleteHabit } = useHabit();
  
  const handleToggleComplete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (habit.completed) {
      await uncompleteHabit(habit._id);
    } else {
      await completeHabit(habit._id);
    }
  };
  
  return (
    <Link to={`/habits/${habit._id}`}>
      <Card className="flex items-center p-4 hover:shadow-md transition-shadow" hover>
        <div 
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4"
          style={{ backgroundColor: `${habit.color}40` }} // 40 = 25% opacity
        >
          <span className="text-xl" role="img" aria-label={habit.title}>
            {habit.icon}
          </span>
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-neutral-dark">{habit.title}</h3>
          {habit.streak?.current > 0 && (
            <p className="text-sm text-neutral">
              {habit.streak.current} ngày liên tiếp
            </p>
          )}
        </div>
        
        <button
          className="ml-4 focus:outline-none"
          onClick={handleToggleComplete}
        >
          {habit.completed ? (
            <CheckCircleIcon className="h-8 w-8 text-success" />
          ) : (
            <CheckCircleOutlineIcon className="h-8 w-8 text-neutral-light hover:text-success transition-colors" />
          )}
        </button>
      </Card>
    </Link>
  );
};

export default HabitItem;