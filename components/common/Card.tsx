import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <div 
      className={`
        bg-[rgba(var(--color-background-secondary-rgb),0.3)] 
        backdrop-blur-sm 
        rounded-xl 
        border border-[rgba(var(--color-border-primary-rgb),0.3)] 
        shadow-lg shadow-[rgba(var(--color-interactive-primary-rgb),0.1)] 
        overflow-hidden
        flex flex-col
        ${noPadding ? '' : 'p-6'} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;