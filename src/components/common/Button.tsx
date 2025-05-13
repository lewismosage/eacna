import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
} & (
  | React.ButtonHTMLAttributes<HTMLButtonElement>
  | React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    }
  | {
      to: string;
    }
);

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
    accent: 'bg-accent-500 text-primary-900 hover:bg-accent-600 focus:ring-accent-400',
    outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    text: 'text-primary-600 hover:text-primary-700 hover:bg-primary-50 focus:ring-primary-500',
  };
  
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };
  
  const widthStyles = fullWidth ? 'w-full' : '';
  const iconStyles = Icon ? (iconPosition === 'left' ? 'space-x-2' : 'flex-row-reverse space-x-2 space-x-reverse') : '';
  
  const allStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${iconStyles} ${className}`;
  
  const iconElement = Icon ? <Icon className={size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} /> : null;

  // Check if it's a Link from react-router-dom
  if ('to' in props) {
    const { to, ...restProps } = props;
    return (
      <Link to={to} className={allStyles} {...restProps}>
        {iconElement}
        <span>{children}</span>
      </Link>
    );
  }

  // Check if it's an anchor tag
  if ('href' in props) {
    return (
      <a className={allStyles} {...props}>
        {iconElement}
        <span>{children}</span>
      </a>
    );
  }

  // Otherwise it's a button
  return (
    <button className={allStyles} {...props}>
      {iconElement}
      <span>{children}</span>
    </button>
  );
};

export default Button;