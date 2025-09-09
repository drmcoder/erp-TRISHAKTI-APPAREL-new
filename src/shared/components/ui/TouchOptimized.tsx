import React, { memo, useCallback, useState, useRef } from 'react';
import { cn } from '../../lib/utils';

// Touch-optimized button with haptic feedback
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hapticFeedback?: boolean;
  rippleEffect?: boolean;
}

export const TouchButton = memo<TouchButtonProps>(({
  variant = 'primary',
  size = 'md',
  hapticFeedback = true,
  rippleEffect = true,
  className,
  children,
  onClick,
  disabled,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const rippleId = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsPressed(true);
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Light haptic feedback
    }
  }, [hapticFeedback]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (rippleEffect) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple = { id: rippleId.current++, x, y };
      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }

    if (onClick) onClick(e);
  }, [disabled, rippleEffect, onClick]);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px] min-w-[64px]',
    md: 'px-4 py-3 text-base min-h-[44px] min-w-[80px]',
    lg: 'px-6 py-4 text-lg min-h-[52px] min-w-[96px]',
    xl: 'px-8 py-5 text-xl min-h-[60px] min-w-[112px]'
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800 shadow-md hover:shadow-lg',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg'
  };

  return (
    <button
      className={cn(
        'relative overflow-hidden rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        'active:scale-95 select-none',
        sizeClasses[size],
        variantClasses[variant],
        isPressed && 'scale-95',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
      
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white bg-opacity-30 rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            pointerEvents: 'none'
          }}
        />
      ))}
    </button>
  );
});

TouchButton.displayName = 'TouchButton';

// Touch-optimized card with better tap targets
interface TouchCardProps {
  children: React.ReactNode;
  onTap?: () => void;
  className?: string;
  active?: boolean;
  disabled?: boolean;
}

export const TouchCard = memo<TouchCardProps>(({
  children,
  onTap,
  className,
  active = false,
  disabled = false
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = useCallback(() => {
    if (!disabled) {
      setIsPressed(true);
    }
  }, [disabled]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
    if (onTap && !disabled) {
      onTap();
    }
  }, [onTap, disabled]);

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-all duration-200 select-none',
        'min-h-[60px]', // Minimum touch target size
        onTap && !disabled && 'cursor-pointer hover:shadow-md',
        active && 'ring-2 ring-blue-500 bg-blue-50 border-blue-300',
        isPressed && 'scale-98 shadow-sm',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'border-gray-200 bg-white hover:border-gray-300',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onTap && !disabled ? onTap : undefined}
    >
      {children}
    </div>
  );
});

TouchCard.displayName = 'TouchCard';

// Touch-optimized input with better mobile experience
interface TouchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TouchInput = memo<TouchInputProps>(({
  label,
  error,
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <span className="text-gray-400">{leftIcon}</span>
          </div>
        )}
        
        <input
          className={cn(
            'w-full rounded-lg border border-gray-300 transition-all duration-200',
            'px-4 py-3 text-base min-h-[44px]', // Large touch targets
            'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'placeholder-gray-500',
            isFocused && 'ring-2 ring-blue-500 border-blue-500',
            leftIcon && 'pl-12',
            rightIcon && 'pr-12',
            error && 'border-red-500 ring-red-200',
            className
          )}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            <span className="text-gray-400">{rightIcon}</span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
});

TouchInput.displayName = 'TouchInput';

// Swipe gesture component
interface SwipeableProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  className?: string;
}

export const Swipeable = memo<SwipeableProps>(({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 100,
  className
}) => {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }

    touchStart.current = null;
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
});

Swipeable.displayName = 'Swipeable';

export default { TouchButton, TouchCard, TouchInput, Swipeable };