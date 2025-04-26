import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

const HabitCompletionHistory = ({ completions }) => {
  if (!completions || completions.length === 0) {
    return (
      <div className="text-center py-4 text-neutral">
        Chưa có dữ liệu hoàn thành cho thói quen này
      </div>
    );
  }
  
  // Sắp xếp theo ngày, mới nhất lên đầu
  const sortedCompletions = [...completions].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  return (
    <div className="space-y-2">
      {sortedCompletions.map(completion => (
        <div 
          key={completion._id} 
          className="flex items-center p-3 border-b border-neutral-light"
        >
          <div className="mr-3">
            {completion.completed ? (
              <CheckIcon className="h-5 w-5 text-success" />
            ) : (
              <XMarkIcon className="h-5 w-5 text-neutral" />
            )}
          </div>
          
          <div className="flex-1">
            <p className="font-medium">
              {format(new Date(completion.date), 'EEEE, dd/MM/yyyy', { locale: vi })}
            </p>
            {completion.note && (
              <p className="text-sm text-neutral mt-1">{completion.note}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HabitCompletionHistory;