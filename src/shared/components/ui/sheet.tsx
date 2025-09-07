import * as React from 'react';
import { cn } from '@/shared/utils';

// Basic Sheet components for mobile-like overlay panels
interface SheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface SheetContentProps {
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const Sheet: React.FC<SheetProps> = ({ children, open = false, onOpenChange }) => {
  return (
    <div data-state={open ? 'open' : 'closed'}>
      {children}
    </div>
  );
};

const SheetTrigger: React.FC<{ children: React.ReactNode; asChild?: boolean }> = ({ 
  children, 
  asChild = false 
}) => {
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      'data-testid': 'sheet-trigger'
    });
  }
  
  return (
    <button data-testid="sheet-trigger">
      {children}
    </button>
  );
};

const SheetContent: React.FC<SheetContentProps> = ({ 
  children, 
  className, 
  side = 'right' 
}) => {
  const sideClasses = {
    top: 'top-0 left-0 right-0 border-b',
    right: 'top-0 right-0 h-full border-l',
    bottom: 'bottom-0 left-0 right-0 border-t',
    left: 'top-0 left-0 h-full border-r'
  };

  return (
    <div
      className={cn(
        'fixed z-50 bg-background p-6 shadow-lg transition-all',
        sideClasses[side],
        className
      )}
      data-testid="sheet-content"
    >
      {children}
    </div>
  );
};

const SheetHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}>
    {children}
  </div>
);

const SheetTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <h2 className={cn('text-lg font-semibold text-foreground', className)}>
    {children}
  </h2>
);

const SheetDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <p className={cn('text-sm text-muted-foreground', className)}>
    {children}
  </p>
);

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
};