import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill' | 'square';
  outline?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  children: React.ReactNode;
}

const badgeVariants = {
  default: {
    solid: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-800 dark:text-secondary-300',
    outline: 'border border-secondary-300 text-secondary-700 bg-transparent dark:border-secondary-600 dark:text-secondary-400',
  },
  primary: {
    solid: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300',
    outline: 'border border-primary-300 text-primary-700 bg-transparent dark:border-primary-600 dark:text-primary-400',
  },
  secondary: {
    solid: 'bg-secondary-200 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-300',
    outline: 'border border-secondary-400 text-secondary-700 bg-transparent dark:border-secondary-500 dark:text-secondary-400',
  },
  success: {
    solid: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300',
    outline: 'border border-success-300 text-success-700 bg-transparent dark:border-success-600 dark:text-success-400',
  },
  warning: {
    solid: 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300',
    outline: 'border border-warning-300 text-warning-700 bg-transparent dark:border-warning-600 dark:text-warning-400',
  },
  danger: {
    solid: 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-300',
    outline: 'border border-danger-300 text-danger-700 bg-transparent dark:border-danger-600 dark:text-danger-400',
  },
  info: {
    solid: 'bg-info-100 text-info-800 dark:bg-info-900 dark:text-info-300',
    outline: 'border border-info-300 text-info-700 bg-transparent dark:border-info-600 dark:text-info-400',
  },
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs font-medium',
  md: 'px-2.5 py-1 text-xs font-medium',
  lg: 'px-3 py-1.5 text-sm font-medium',
};

const badgeShapes = {
  rounded: 'rounded',
  pill: 'rounded-full',
  square: 'rounded-none',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      shape = 'rounded',
      outline = false,
      dismissible = false,
      onDismiss,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-medium whitespace-nowrap',
          'transition-colors duration-200',
          
          // Size styles
          badgeSizes[size],
          
          // Shape styles
          badgeShapes[shape],
          
          // Variant styles
          outline ? badgeVariants[variant].outline : badgeVariants[variant].solid,
          
          className
        )}
        {...props}
      >
        <span className="truncate">{children}</span>
        
        {dismissible && (
          <button
            onClick={onDismiss}
            className={cn(
              'ml-1 -mr-1 flex-shrink-0',
              'hover:bg-black hover:bg-opacity-10 rounded-full',
              'focus:outline-none focus:bg-black focus:bg-opacity-20',
              'transition-colors duration-150',
              size === 'sm' && 'w-3 h-3',
              size === 'md' && 'w-4 h-4',
              size === 'lg' && 'w-5 h-5'
            )}
          >
            <X className="w-full h-full" />
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Status badges for ERP system
export const StatusBadge: React.FC<{
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';
  size?: BadgeProps['size'];
  className?: string;
}> = ({ status, size = 'md', className }) => {
  const statusConfig = {
    'pending': { variant: 'warning' as const, label: 'Pending' },
    'in-progress': { variant: 'primary' as const, label: 'In Progress' },
    'completed': { variant: 'success' as const, label: 'Completed' },
    'cancelled': { variant: 'danger' as const, label: 'Cancelled' },
    'on-hold': { variant: 'secondary' as const, label: 'On Hold' },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      size={size}
      className={className}
    >
      {config.label}
    </Badge>
  );
};

export const PriorityBadge: React.FC<{
  priority: 'low' | 'medium' | 'high' | 'critical';
  size?: BadgeProps['size'];
  className?: string;
}> = ({ priority, size = 'md', className }) => {
  const priorityConfig = {
    'low': { variant: 'success' as const, label: 'Low' },
    'medium': { variant: 'warning' as const, label: 'Medium' },
    'high': { variant: 'danger' as const, label: 'High' },
    'critical': { variant: 'danger' as const, label: 'Critical' },
  };

  const config = priorityConfig[priority];

  return (
    <Badge
      variant={config.variant}
      size={size}
      className={className}
    >
      {config.label}
    </Badge>
  );
};

// Notification badge (dot indicator)
export const NotificationBadge: React.FC<{
  count?: number;
  max?: number;
  showZero?: boolean;
  className?: string;
  children?: React.ReactNode;
}> = ({ count = 0, max = 99, showZero = false, className, children }) => {
  const shouldShow = count > 0 || showZero;
  const displayCount = count > max ? `${max}+` : count.toString();

  if (!shouldShow && !children) return null;

  return (
    <div className="relative inline-flex">
      {children}
      {shouldShow && (
        <span
          className={cn(
            'absolute -top-1 -right-1',
            'flex items-center justify-center',
            'min-w-[1.25rem] h-5 px-1',
            'text-xs font-medium text-white',
            'bg-danger-500 rounded-full',
            'ring-2 ring-white dark:ring-secondary-900',
            count === 0 && 'w-2 h-2 min-w-0 p-0',
            className
          )}
        >
          {count === 0 ? null : displayCount}
        </span>
      )}
    </div>
  );
};