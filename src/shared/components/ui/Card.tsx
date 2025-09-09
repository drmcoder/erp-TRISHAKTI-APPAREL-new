import React from 'react';
import { cn } from '@/shared/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled' | 'glass' | 'neu';
  size?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  interactive?: boolean; // Enable modern micro-interactions
  children: React.ReactNode;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const cardVariants = {
  default: [
    'bg-white border border-secondary-200 shadow-sm',
    'dark:bg-secondary-900 dark:border-secondary-700',
  ],
  outlined: [
    'bg-white border-2 border-secondary-200 shadow-none',
    'dark:bg-secondary-900 dark:border-secondary-700',
  ],
  elevated: [
    'bg-white border-0 shadow-lg',
    'dark:bg-secondary-900',
  ],
  filled: [
    'bg-secondary-50 border border-secondary-200 shadow-none',
    'dark:bg-secondary-800 dark:border-secondary-700',
  ],
  glass: [
    'bg-white/70 backdrop-blur-md border border-white/20 shadow-lg shadow-black/5',
    'dark:bg-secondary-900/70 dark:border-secondary-700/30 dark:shadow-black/20',
  ],
  neu: [
    'bg-secondary-50 border-0',
    'shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]',
    'dark:bg-secondary-800',
    'dark:shadow-[8px_8px_16px_#111827,-8px_-8px_16px_#374151]',
  ],
};

const cardSizes = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      hoverable = false,
      interactive = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-lg transition-all duration-200',
          
          // Variant styles
          cardVariants[variant],
          
          // Size styles
          cardSizes[size],
          
          // Hover effects
          hoverable && [
            'cursor-pointer',
            'hover:shadow-md hover:scale-[1.02]',
            variant === 'outlined' && 'hover:border-primary-300',
            variant === 'elevated' && 'hover:shadow-xl',
            variant === 'glass' && 'glass-hover dark:glass-hover-dark',
            variant === 'neu' && 'hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] dark:hover:shadow-[4px_4px_8px_#111827,-4px_-4px_8px_#374151]',
          ],
          
          // Interactive enhancements
          interactive && [
            'card-hover',
            'transform-gpu', // Enable GPU acceleration
          ],
          
          // Enhanced focus states for accessibility
          'focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2',
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'mb-4 pb-4 border-b border-secondary-200 dark:border-secondary-700',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardBody: React.FC<CardBodyProps> = ({
  className,
  children,
  ...props
}) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardFooterProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// Additional commonly used Card exports
export const CardContent: React.FC<CardBodyProps> = CardBody;

export const CardDescription: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
  ...props
}) => (
  <p
    className={cn('text-sm text-secondary-600 dark:text-secondary-400', className)}
    {...props}
  >
    {children}
  </p>
);

export const CardTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
  ...props
}) => (
  <h3
    className={cn('text-lg font-semibold text-secondary-900 dark:text-secondary-100', className)}
    {...props}
  >
    {children}
  </h3>
);

// Specialized card variants
export const StatsCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, value, subtitle, trend, icon, className }) => (
  <Card variant="default" className={cn('relative overflow-hidden', className)}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400 mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-success-600' : 'text-danger-600'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          </div>
        )}
      </div>
      {icon && (
        <div className="flex-shrink-0 ml-4">
          <div className="w-8 h-8 text-primary-600 dark:text-primary-400">
            {icon}
          </div>
        </div>
      )}
    </div>
  </Card>
);

export const ActionCard: React.FC<{
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ title, description, icon, actions, className, onClick }) => (
  <Card 
    variant="default" 
    hoverable={!!onClick}
    className={cn('cursor-pointer', className)}
    onClick={onClick}
  >
    <div className="flex items-start space-x-4">
      {icon && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
            {icon}
          </div>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-secondary-900 dark:text-secondary-100 mb-1">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            {description}
          </p>
        )}
        {actions && (
          <div className="mt-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  </Card>
);

// Modern card variants
export const GlassCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="glass" interactive {...props} />
);

export const NeuCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="neu" interactive {...props} />
);

export const InteractiveCard: React.FC<CardProps> = (props) => (
  <Card interactive hoverable {...props} />
);

export const FloatingCard: React.FC<CardProps> = ({ className, ...props }) => (
  <Card 
    variant="elevated" 
    interactive 
    className={cn('animate-float', className)} 
    {...props} 
  />
);