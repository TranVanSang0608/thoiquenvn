import React from 'react';
import Card from '../ui/Card';

const getColorClass = (color) => {
  const colors = {
    primary: 'bg-primary text-white',
    success: 'bg-success text-white',
    danger: 'bg-danger text-white',
    warning: 'bg-warning text-white',
    info: 'bg-info text-white',
    default: 'bg-neutral-lightest text-neutral-dark'
  };
  
  return colors[color] || colors.default;
};

const StatsSummaryCard = ({ title, value, unit, color = 'primary', icon }) => {
  const colorClass = getColorClass(color);
  
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center">
        <div className="p-4 flex-grow">
          <h3 className="text-sm font-medium text-neutral mb-2">{title}</h3>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-neutral-dark">{value}</span>
            {unit && <span className="ml-1 text-neutral">{unit}</span>}
          </div>
        </div>
        
        <div className={`p-4 self-stretch flex items-center ${colorClass}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatsSummaryCard;