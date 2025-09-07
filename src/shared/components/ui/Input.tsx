import React from 'react';
import { Eye, EyeOff, Search, X } from 'lucide-react';
import { cn } from '@/shared/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'borderless';
  clearable?: boolean;
  onClear?: () => void;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

const inputSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
};

const inputVariants = {
  default: [
    'bg-white border-secondary-300',
    'focus:border-primary-500 focus:ring-primary-500',
    'disabled:bg-secondary-50 disabled:text-secondary-500',
    'dark:bg-secondary-900 dark:border-secondary-600',
    'dark:focus:border-primary-400 dark:focus:ring-primary-400',
    'dark:disabled:bg-secondary-800',
  ],
  filled: [
    'bg-secondary-50 border-secondary-200',
    'focus:bg-white focus:border-primary-500 focus:ring-primary-500',
    'disabled:bg-secondary-100 disabled:text-secondary-500',
    'dark:bg-secondary-800 dark:border-secondary-700',
    'dark:focus:bg-secondary-900 dark:focus:border-primary-400',
  ],
  borderless: [
    'bg-transparent border-0 border-b border-secondary-300',
    'focus:border-primary-500 focus:ring-0 focus:ring-offset-0',
    'rounded-none px-0',
    'disabled:bg-transparent disabled:text-secondary-500',
    'dark:border-secondary-600',
    'dark:focus:border-primary-400',
  ],
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      size = 'md',
      variant = 'default',
      clearable = false,
      onClear,
      disabled,
      value,
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value || '');
    const generatedId = React.useId();
    const inputId = id || `input-${generatedId}`;

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    
    const hasValue = (value !== undefined ? value : internalValue) !== '';
    const showClearButton = clearable && hasValue && !disabled;
    const showPasswordToggle = isPassword && !disabled;

    const handleClear = () => {
      setInternalValue('');
      onClear?.();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      props.onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-2',
              error ? 'text-danger-700' : 'text-secondary-700',
              disabled && 'text-secondary-500',
              'dark:text-secondary-300'
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className={cn(
              'absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400',
              size === 'sm' && 'left-2',
              size === 'lg' && 'left-4'
            )}>
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            value={value !== undefined ? value : internalValue}
            className={cn(
              // Base styles
              'block w-full border rounded-md shadow-sm',
              'placeholder-secondary-400',
              'focus:outline-none focus:ring-1',
              'transition-colors duration-200',
              'disabled:cursor-not-allowed',
              
              // Size styles
              inputSizes[size],
              
              // Variant styles
              inputVariants[variant],
              
              // Icon padding
              leftIcon && variant !== 'borderless' && (
                size === 'sm' ? 'pl-8' : size === 'lg' ? 'pl-12' : 'pl-10'
              ),
              (rightIcon || showClearButton || showPasswordToggle) && variant !== 'borderless' && (
                size === 'sm' ? 'pr-8' : size === 'lg' ? 'pr-12' : 'pr-10'
              ),
              
              // Error state
              error && [
                'border-danger-300 text-danger-900',
                'focus:border-danger-500 focus:ring-danger-500',
                'dark:border-danger-600',
              ],
              
              className
            )}
            onChange={handleChange}
            {...props}
          />
          
          {(rightIcon || showClearButton || showPasswordToggle) && (
            <div className={cn(
              'absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1',
              size === 'sm' && 'right-2',
              size === 'lg' && 'right-4'
            )}>
              {showClearButton && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-secondary-400 hover:text-secondary-600 focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              {showPasswordToggle && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-secondary-400 hover:text-secondary-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
              
              {rightIcon && !showClearButton && !showPasswordToggle && (
                <div className="text-secondary-400">
                  {rightIcon}
                </div>
              )}
            </div>
          )}
        </div>
        
        {(error || hint) && (
          <div className="mt-1">
            {error ? (
              <p className="text-sm text-danger-600 dark:text-danger-400">
                {error}
              </p>
            ) : hint ? (
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                {hint}
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      hint,
      resize = 'vertical',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || `textarea-${generatedId}`;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaId}
            className={cn(
              'block text-sm font-medium mb-2',
              error ? 'text-danger-700' : 'text-secondary-700',
              disabled && 'text-secondary-500',
              'dark:text-secondary-300'
            )}
          >
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          className={cn(
            // Base styles
            'block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm',
            'placeholder-secondary-400 text-sm',
            'focus:outline-none focus:ring-1 focus:border-primary-500 focus:ring-primary-500',
            'transition-colors duration-200',
            'disabled:cursor-not-allowed disabled:bg-secondary-50 disabled:text-secondary-500',
            
            // Resize behavior
            resize === 'none' && 'resize-none',
            resize === 'both' && 'resize',
            resize === 'horizontal' && 'resize-x',
            resize === 'vertical' && 'resize-y',
            
            // Dark mode
            'dark:bg-secondary-900 dark:border-secondary-600',
            'dark:focus:border-primary-400 dark:focus:ring-primary-400',
            'dark:disabled:bg-secondary-800',
            
            // Error state
            error && [
              'border-danger-300 text-danger-900',
              'focus:border-danger-500 focus:ring-danger-500',
              'dark:border-danger-600',
            ],
            
            className
          )}
          {...props}
        />
        
        {(error || hint) && (
          <div className="mt-1">
            {error ? (
              <p className="text-sm text-danger-600 dark:text-danger-400">
                {error}
              </p>
            ) : hint ? (
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                {hint}
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Specialized input variants
export const SearchInput: React.FC<Omit<InputProps, 'leftIcon' | 'type'>> = (props) => (
  <Input leftIcon={<Search className="w-4 h-4" />} type="search" {...props} />
);

export const PasswordInput: React.FC<Omit<InputProps, 'type'>> = (props) => (
  <Input type="password" {...props} />
);