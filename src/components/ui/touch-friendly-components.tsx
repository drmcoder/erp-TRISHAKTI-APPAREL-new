// Touch-Friendly Components
// Comprehensive set of mobile-optimized components with gesture support

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Check,
  X,
  Plus,
  Minus,
  Trash2,
  Edit,
  Star,
  Heart,
  Share,
  Bookmark,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { useSwipeable } from 'react-swipeable';
import { UI_CONFIG, getTouchTargetSize, isMobile } from '@/config/ui-config';

// Touch-optimized Button
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ElementType;
  children?: React.ReactNode;
  loading?: boolean;
  hapticFeedback?: boolean;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  variant = 'default',
  size = 'md',
  icon: Icon,
  children,
  loading = false,
  hapticFeedback = false,
  className,
  onClick,
  ...props
}) => {
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // Enhanced security: Prevent rapid-fire clicks that might bypass security
    if (loading) {
      e.preventDefault();
      return;
    }

    // Haptic feedback for mobile devices
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50); // Light vibration
    }

    onClick?.(e);
  }, [onClick, hapticFeedback]);

  const touchTargetSize = getTouchTargetSize(size);

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      disabled={loading}
      className={cn(
        // Minimum touch target size
        `min-h-[${touchTargetSize}px] min-w-[${touchTargetSize}px]`,
        // Touch optimization
        'touch-manipulation select-none',
        // Active state for better mobile feedback
        'active:scale-95 transition-transform duration-100',
        // Larger padding for better touch experience
        size === 'sm' && 'px-4 py-3',
        size === 'md' && 'px-6 py-4',
        size === 'lg' && 'px-8 py-5',
        className
      )}
      {...props}
    >
      {loading ? (
        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
      ) : Icon ? (
        <Icon className="w-4 h-4 mr-2" />
      ) : null}
      {children}
    </Button>
  );
};

// Swipeable Card Component
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftActions?: Array<{
    label: string;
    icon: React.ElementType;
    color: 'red' | 'green' | 'blue' | 'orange';
    action: () => void;
  }>;
  rightActions?: Array<{
    label: string;
    icon: React.ElementType;
    color: 'red' | 'green' | 'blue' | 'orange';
    action: () => void;
  }>;
  className?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftActions = [],
  rightActions = [],
  className
}) => {
  const [swipeState, setSwipeState] = useState<'none' | 'left' | 'right'>('none');
  const [dragOffset, setDragOffset] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const swipeHandlers = useSwipeable({
    onSwiping: (eventData) => {
      const offset = eventData.deltaX;
      setDragOffset(offset);
      
      if (offset > 100) {
        setSwipeState('right');
      } else if (offset < -100) {
        setSwipeState('left');
      } else {
        setSwipeState('none');
      }
    },
    onSwiped: (eventData) => {
      if (Math.abs(eventData.deltaX) > 100) {
        if (eventData.deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
      
      setDragOffset(0);
      setSwipeState('none');
    },
    trackMouse: false,
    trackTouch: true,
    delta: 10,
    preventScrollOnSwipe: true
  });

  const getActionColor = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-500 text-white';
      case 'green': return 'bg-green-500 text-white';
      case 'blue': return 'bg-blue-500 text-white';
      case 'orange': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <div 
          className={cn(
            "absolute left-0 top-0 bottom-0 flex items-center transition-transform duration-200",
            swipeState === 'right' ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {leftActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className={cn(
                  "h-full px-4 flex flex-col items-center justify-center min-w-[80px]",
                  "touch-manipulation",
                  getActionColor(action.color)
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <div 
          className={cn(
            "absolute right-0 top-0 bottom-0 flex items-center transition-transform duration-200",
            swipeState === 'left' ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          {rightActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className={cn(
                  "h-full px-4 flex flex-col items-center justify-center min-w-[80px]",
                  "touch-manipulation",
                  getActionColor(action.color)
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Card */}
      <div
        ref={cardRef}
        {...swipeHandlers}
        className={cn(
          "transition-transform duration-200 relative z-10",
          className
        )}
        style={{
          transform: `translateX(${Math.max(-150, Math.min(150, dragOffset))}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Long Press Component
interface LongPressProps {
  children: React.ReactNode;
  onLongPress: () => void;
  delay?: number;
  className?: string;
}

export const LongPress: React.FC<LongPressProps> = ({
  children,
  onLongPress,
  delay = 500,
  className
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleStart = useCallback(() => {
    setIsPressed(true);
    timeoutRef.current = setTimeout(() => {
      onLongPress();
      setIsPressed(false);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 50]); // Pattern vibration
      }
    }, delay);
  }, [onLongPress, delay]);

  const handleEnd = useCallback(() => {
    setIsPressed(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "touch-manipulation select-none",
        "transition-all duration-200",
        isPressed && "scale-95 opacity-80",
        className
      )}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
    >
      {children}
    </div>
  );
};

// Pull to Refresh Component
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
  threshold?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshing = false,
  threshold = 100,
  className
}) => {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop !== 0 || refreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      setPulling(true);
      setPullDistance(Math.min(diff, threshold * 1.5));
    }
  }, [threshold, refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !refreshing) {
      await onRefresh();
    }
    
    setPulling(false);
    setPullDistance(0);
  }, [pullDistance, threshold, refreshing, onRefresh]);

  const pullProgress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center",
          "transition-all duration-200 z-10",
          "bg-background border-b shadow-sm",
          pulling || refreshing ? "opacity-100" : "opacity-0"
        )}
        style={{
          height: Math.max(0, pullDistance),
          transform: `translateY(-${Math.max(0, threshold - pullDistance)}px)`
        }}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw 
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              (refreshing || pullProgress === 1) && "animate-spin"
            )}
            style={{
              transform: `rotate(${pullProgress * 360}deg)`
            }}
          />
          <span>
            {refreshing 
              ? "Refreshing..." 
              : pullProgress === 1 
                ? "Release to refresh" 
                : "Pull to refresh"
            }
          </span>
        </div>
      </div>

      {/* Content */}
      <div 
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${pulling ? pullDistance : 0}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Touch-friendly Action Sheet
interface ActionSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  actions: Array<{
    label: string;
    icon?: React.ElementType;
    destructive?: boolean;
    action: () => void;
  }>;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  open,
  onClose,
  title,
  actions
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Action Sheet */}
      <div className={cn(
        "relative w-full bg-background rounded-t-lg sm:rounded-lg sm:w-96",
        "animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in-0",
        "duration-200"
      )}>
        {title && (
          <div className="px-4 py-3 border-b">
            <h3 className="text-lg font-semibold text-center">{title}</h3>
          </div>
        )}

        <div className="py-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => {
                  action.action();
                  onClose();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-4 text-left",
                  "hover:bg-accent transition-colors duration-200",
                  "touch-manipulation min-h-[56px]", // Larger touch target
                  action.destructive && "text-destructive hover:bg-destructive/10"
                )}
              >
                {Icon && <Icon className="w-5 h-5" />}
                <span className="flex-1 font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* Cancel button for mobile */}
        {isMobile() && (
          <>
            <div className="h-2 bg-muted" />
            <button
              onClick={onClose}
              className="w-full py-4 text-center font-semibold text-muted-foreground hover:bg-accent transition-colors duration-200 touch-manipulation"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Touch-optimized Number Input
interface TouchNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
}

export const TouchNumberInput: React.FC<TouchNumberInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  label,
  className
}) => {
  const handleIncrement = useCallback(() => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
    
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  }, [value, step, max, onChange]);

  const handleDecrement = useCallback(() => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
    
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  }, [value, step, min, onChange]);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium">{label}</label>
      )}
      
      <div className="flex items-center border rounded-lg overflow-hidden">
        <TouchButton
          variant="ghost"
          size="sm"
          onClick={handleDecrement}
          disabled={value <= min}
          className="rounded-none border-r"
          hapticFeedback
        >
          <Minus className="w-4 h-4" />
        </TouchButton>
        
        <div className="flex-1 text-center py-3 px-4 font-medium min-w-[60px]">
          {value}
        </div>
        
        <TouchButton
          variant="ghost"
          size="sm"
          onClick={handleIncrement}
          disabled={value >= max}
          className="rounded-none border-l"
          hapticFeedback
        >
          <Plus className="w-4 h-4" />
        </TouchButton>
      </div>
    </div>
  );
};