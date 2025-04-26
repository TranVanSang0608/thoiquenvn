import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'default'
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-sm';
  
  const paddingClasses = {
    none: '',
    default: 'p-4',
    large: 'p-6',
  };
  
  const hoverClasses = hover ? 'transition-shadow duration-200 hover:shadow-md' : '';
  
  const cardClasses = `
    ${baseClasses}
    ${paddingClasses[padding]}
    ${hoverClasses}
    ${className}
  `;
  
  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};

export default Card;