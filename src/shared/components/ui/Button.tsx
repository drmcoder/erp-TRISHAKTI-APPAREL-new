import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'ghost' | 'outline' | 'link' | 'back' | 'glass' | 'neu';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
  interactive?: boolean; // Enable modern micro-interactions
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
  info: [
    'bg-blue-500 text-white border-blue-500',
    'hover:bg-blue-600 hover:border-blue-600',
    'focus:ring-blue-500 focus:border-blue-600',
    'active:bg-blue-700 active:border-blue-700',
    'disabled:bg-blue-300 disabled:border-blue-300 disabled:cursor-not-allowed',
  ],
  back: [
    'bg-gray-500 text-white border-gray-500',
    'hover:bg-gray-600 hover:border-gray-600',
    'focus:ring-gray-500 focus:border-gray-600',
    'active:bg-gray-700 active:border-gray-700',
    'disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed',
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
  glass: [
    'bg-white/10 text-secondary-800 border border-white/20 backdrop-blur-md',
    'hover:bg-white/20 hover:border-white/30',
    'focus:ring-primary-500/50 focus:border-primary-300/50',
    'active:bg-white/30',
    'disabled:bg-white/5 disabled:text-secondary-400 disabled:cursor-not-allowed',
    'dark:bg-secondary-900/30 dark:text-secondary-200 dark:border-secondary-700/30',
    'dark:hover:bg-secondary-900/40',
  ],
  neu: [
    'bg-secondary-50 text-secondary-700 border-0',
    'shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]',
    'hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]',
    'active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]',
    'focus:ring-primary-500/30',
    'disabled:text-secondary-400 disabled:cursor-not-allowed disabled:shadow-none',
    'dark:bg-secondary-800 dark:text-secondary-300',
    'dark:shadow-[4px_4px_8px_#111827,-4px_-4px_8px_#374151]',
    'dark:hover:shadow-[2px_2px_4px_#111827,-2px_-2px_4px_#374151]',
    'dark:active:shadow-[inset_2px_2px_4px_#111827,inset_-2px_-2px_4px_#374151]',
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
      interactive = false,
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
          
          // Interactive enhancements
          interactive && !isDisabled && [
            'button-press',
            variant !== 'neu' && 'hover-lift',
          ],
          
          // Touch-friendly sizing for mobile
          'min-h-[44px] md:min-h-[auto]',
          
          // Enhanced focus states
          'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          
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

export const GlassButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="glass" interactive {...props} />
);

export const NeuButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="neu" interactive {...props} />
);

export const InteractiveButton: React.FC<ButtonProps> = (props) => (
  <Button interactive {...props} />
);