import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'ghost' | 'outline' | 'link' | 'back';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
  children: React.ReactNode;
}

const buttonVariants = {
  primary: [
    'bg-primary-500 text-white border-primary-500',
    'hover:bg-primary-600 hover:border-primary-600',
    'focus:ring-primary-500 focus:border-primary-600',
    'active:bg-primary-700 active:border-primary-700',
    'disabled:bg-primary-300 disabled:border-primary-300 disabled:cursor-not-allowed',
    'dark:bg-primary-600 dark:border-primary-600',
    'dark:hover:bg-primary-700 dark:hover:border-primary-700',
  ],
  secondary: [
    'bg-secondary-100 text-secondary-900 border-secondary-200',
    'hover:bg-secondary-200 hover:border-secondary-300',
    'focus:ring-secondary-500 focus:border-secondary-400',
    'active:bg-secondary-300 active:border-secondary-400',
    'disabled:bg-secondary-50 disabled:text-secondary-400 disabled:cursor-not-allowed',
    'dark:bg-secondary-800 dark:text-secondary-100 dark:border-secondary-700',
    'dark:hover:bg-secondary-700 dark:hover:border-secondary-600',
  ],
  success: [
    'bg-success-500 text-white border-success-500',
    'hover:bg-success-600 hover:border-success-600',
    'focus:ring-success-500 focus:border-success-600',
    'active:bg-success-700 active:border-success-700',
    'disabled:bg-success-300 disabled:border-success-300 disabled:cursor-not-allowed',
  ],
  warning: [
    'bg-warning-500 text-white border-warning-500',
    'hover:bg-warning-600 hover:border-warning-600',
    'focus:ring-warning-500 focus:border-warning-600',
    'active:bg-warning-700 active:border-warning-700',
    'disabled:bg-warning-300 disabled:border-warning-300 disabled:cursor-not-allowed',
  ],
  danger: [
    'bg-danger-500 text-white border-danger-500',
    'hover:bg-danger-600 hover:border-danger-600',
    'focus:ring-danger-500 focus:border-danger-600',
    'active:bg-danger-700 active:border-danger-700',
    'disabled:bg-danger-300 disabled:border-danger-300 disabled:cursor-not-allowed',
  ],
  ghost: [
    'bg-transparent text-secondary-700 border-transparent',
    'hover:bg-secondary-100 hover:text-secondary-900',
    'focus:ring-secondary-500 focus:bg-secondary-100',
    'active:bg-secondary-200',
    'disabled:text-secondary-400 disabled:cursor-not-allowed',
    'dark:text-secondary-300',
    'dark:hover:bg-secondary-800 dark:hover:text-secondary-100',
  ],
  outline: [
    'bg-transparent text-secondary-700 border-secondary-300',
    'hover:bg-secondary-50 hover:border-secondary-400',
    'focus:ring-secondary-500 focus:border-secondary-500',
    'active:bg-secondary-100 active:border-secondary-500',
    'disabled:text-secondary-400 disabled:border-secondary-200 disabled:cursor-not-allowed',
    'dark:text-secondary-300 dark:border-secondary-600',
    'dark:hover:bg-secondary-800 dark:hover:border-secondary-500',
  ],
  link: [
    'bg-transparent text-primary-600 border-transparent p-0',
    'hover:text-primary-700 hover:underline',
    'focus:ring-primary-500 focus:underline',
    'active:text-primary-800',
    'disabled:text-primary-400 disabled:cursor-not-allowed disabled:no-underline',
    'dark:text-primary-400',
    'dark:hover:text-primary-300',
  ],
};

const buttonSizes = {
  xs: 'px-2 py-1 text-xs font-medium',
  sm: 'px-3 py-1.5 text-sm font-medium',
  md: 'px-4 py-2 text-sm font-medium',
  lg: 'px-6 py-3 text-base font-medium',
  xl: 'px-8 py-4 text-lg font-medium',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      rounded = false,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'border font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'select-none',
          
          // Size styles
          buttonSizes[size],
          
          // Variant styles
          buttonVariants[variant],
          
          // Border radius
          rounded ? 'rounded-full' : 'rounded-md',
          
          // Full width
          fullWidth && 'w-full',
          
          // Loading state
          loading && 'cursor-wait',
          
          className
        )}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {loading && (
          <Loader2 
            className={cn(
              'animate-spin',
              size === 'xs' && 'w-3 h-3',
              size === 'sm' && 'w-3 h-3',
              size === 'md' && 'w-4 h-4',
              size === 'lg' && 'w-4 h-4',
              size === 'xl' && 'w-5 h-5',
              (leftIcon || children) && 'mr-2'
            )}
          />
        )}
        
        {leftIcon && !loading && (
          <span 
            className={cn(
              'flex-shrink-0',
              children && 'mr-2'
            )}
          >
            {leftIcon}
          </span>
        )}
        
        {children && (
          <span className="truncate">
            {children}
          </span>
        )}
        
        {rightIcon && !loading && (
          <span 
            className={cn(
              'flex-shrink-0',
              children && 'ml-2'
            )}
          >
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Preset button variants
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
);

export const SuccessButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="success" {...props} />
);

export const WarningButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="warning" {...props} />
);

export const DangerButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="danger" {...props} />
);

export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="ghost" {...props} />
);

export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="outline" {...props} />
);

export const LinkButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="link" {...props} />
);