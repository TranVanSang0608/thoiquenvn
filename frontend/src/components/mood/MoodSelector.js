// src/components/mood/MoodSelector.js
import React from 'react';

const MoodSelector = ({ selectedMood, onSelect }) => {
  const moods = [
    { id: 'happy', emoji: '😊', label: 'Vui vẻ', color: 'bg-yellow-100' },
    { id: 'good', emoji: '🙂', label: 'Tốt', color: 'bg-green-100' },
    { id: 'neutral', emoji: '😐', label: 'Bình thường', color: 'bg-blue-100' },
    { id: 'bad', emoji: '😔', label: 'Không tốt', color: 'bg-red-100' },
    { id: 'awful', emoji: '😢', label: 'Tệ', color: 'bg-purple-100' },
  ];
  
  return (
    <div className="flex justify-center space-x-4">
      {moods.map((mood) => (
        <button
          key={mood.id}
          className={`flex flex-col items-center p-3 rounded-lg transition-colors
            ${selectedMood === mood.id ? `${mood.color} ring-2 ring-primary` : 'hover:bg-neutral-50'}
          `}
          onClick={() => onSelect(mood.id)}
        >
          <span className="text-3xl mb-1">{mood.emoji}</span>
          <span className="text-sm">{mood.label}</span>
        </button>
      ))}
    </div>
  );
};

export default MoodSelector;