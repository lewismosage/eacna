// src/components/common/Badge.jsx
import React from 'react';
import classNames from 'classnames';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  [key: string]: any;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  color = 'primary', 
  className, 
  size = 'md',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium';
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1 text-base'
  };
  
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    dark: 'bg-gray-800 text-white'
  };

  return (
    <span
      className={classNames(
        baseClasses,
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;