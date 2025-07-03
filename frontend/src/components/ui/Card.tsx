import React from 'react';
import { cn } from '@/utils/cn';
import { CardProps } from '@/types';

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
}) => {
  return (
    <div className={cn(
      'bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden',
      className
    )}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-secondary-200">
          {title && (
            <h3 className="text-lg font-semibold text-secondary-900">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-secondary-600">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );
};

export default Card; 