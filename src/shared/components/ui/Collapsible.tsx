import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/utils';

interface CollapsibleProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  trigger,
  children,
  defaultOpen = false,
  disabled = false,
  className,
  contentClassName
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'flex items-center justify-between w-full text-left',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-expanded={isOpen}
      >
        {trigger}
        <ChevronDown 
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn('overflow-hidden', contentClassName)}
          >
            <div className="pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Simple collapsible without animation
export const SimpleCollapsible: React.FC<CollapsibleProps> = ({
  trigger,
  children,
  defaultOpen = false,
  disabled = false,
  className,
  contentClassName
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'flex items-center justify-between w-full text-left',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-expanded={isOpen}
      >
        {trigger}
        <ChevronDown 
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
      </button>
      
      {isOpen && (
        <div className={cn('pt-2', contentClassName)}>
          {children}
        </div>
      )}
    </div>
  );
};