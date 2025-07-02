import React from 'react';
import { cn } from '@/utils/cn';
import { InputProps } from '@/types';

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder = '',
  label,
  error,
  disabled = false,
  className = '',
  type = 'text',
  ...props
}) => {
  const inputClasses = cn(
    'block w-full px-3 py-2 border border-secondary-300 rounded-lg shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-secondary-50 disabled:text-secondary-500',
    error && 'border-error-300 focus:ring-error-500 focus:border-error-500',
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-secondary-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error-600">{error}</p>
      )}
    </div>
  );
};

export default Input; 