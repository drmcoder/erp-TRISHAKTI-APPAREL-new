import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/shared/utils';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'borderless';
  error?: string;
  label?: string;
  hint?: string;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  maxHeight?: string;
  onSelectionChange?: (value: string | string[]) => void;
  className?: string;
  menuClassName?: string;
}

const dropdownSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
};

const dropdownVariants = {
  default: [
    'bg-white border-secondary-300',
    'focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
    'disabled:bg-secondary-50 disabled:text-secondary-500',
    'dark:bg-secondary-900 dark:border-secondary-600',
    'dark:focus:border-primary-400 dark:focus:ring-primary-400',
    'dark:disabled:bg-secondary-800',
  ],
  filled: [
    'bg-secondary-50 border-secondary-200',
    'focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
    'disabled:bg-secondary-100 disabled:text-secondary-500',
    'dark:bg-secondary-800 dark:border-secondary-700',
    'dark:focus:bg-secondary-900 dark:focus:border-primary-400',
  ],
  borderless: [
    'bg-transparent border-0 border-b border-secondary-300',
    'focus:border-primary-500 focus:ring-0',
    'rounded-none px-0',
    'disabled:bg-transparent disabled:text-secondary-500',
    'dark:border-secondary-600',
    'dark:focus:border-primary-400',
  ],
};

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  placeholder = 'Select an option...',
  disabled = false,
  size = 'md',
  variant = 'default',
  error,
  label,
  hint,
  searchable = false,
  clearable = false,
  multiple = false,
  maxHeight = '200px',
  onSelectionChange,
  className,
  menuClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>(
    multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : [])
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOption = !multiple 
    ? options.find(opt => opt.value === value)
    : null;

  const displayValue = multiple
    ? selectedValues.length > 0
      ? `${selectedValues.length} selected`
      : placeholder
    : selectedOption?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable) {
      searchInputRef.current?.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionSelect = (optionValue: string) => {
    if (multiple) {
      const newSelectedValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      
      setSelectedValues(newSelectedValues);
      onSelectionChange?.(newSelectedValues);
    } else {
      setSelectedValues([optionValue]);
      onSelectionChange?.(optionValue);
      setIsOpen(false);
    }
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValues([]);
    onSelectionChange?.(multiple ? [] : '');
  };

  return (
    <div className="w-full">
      {label && (
        <label className={cn(
          'block text-sm font-medium mb-2',
          error ? 'text-danger-700' : 'text-secondary-700',
          disabled && 'text-secondary-500',
          'dark:text-secondary-300'
        )}>
          {label}
        </label>
      )}

      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={cn(
            // Base styles
            'w-full flex items-center justify-between',
            'border rounded-md shadow-sm',
            'focus:outline-none focus:ring-offset-0',
            'transition-colors duration-200',
            'disabled:cursor-not-allowed',
            
            // Size styles
            dropdownSizes[size],
            
            // Variant styles
            dropdownVariants[variant],
            
            // Error state
            error && [
              'border-danger-300 text-danger-900',
              'focus:border-danger-500 focus:ring-danger-500',
              'dark:border-danger-600',
            ],
            
            className
          )}
        >
          <span className={cn(
            'block truncate text-left',
            !selectedOption && !selectedValues.length && 'text-secondary-400'
          )}>
            {displayValue}
          </span>
          
          <div className="flex items-center space-x-2">
            {clearable && selectedValues.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-secondary-400 hover:text-secondary-600"
              >
                ×
              </button>
            )}
            
            <ChevronDown className={cn(
              'w-4 h-4 text-secondary-400 transition-transform duration-200',
              isOpen && 'rotate-180'
            )} />
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'absolute z-50 w-full mt-1',
                'bg-white rounded-md shadow-lg border border-secondary-200',
                'dark:bg-secondary-800 dark:border-secondary-600',
                menuClassName
              )}
            >
              {searchable && (
                <div className="p-2 border-b border-secondary-200 dark:border-secondary-600">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-secondary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-secondary-700 dark:border-secondary-600"
                  />
                </div>
              )}

              <div 
                className="py-1 overflow-y-auto"
                style={{ maxHeight }}
              >
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-secondary-500 dark:text-secondary-400">
                    No options found
                  </div>
                ) : (
                  filteredOptions.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleOptionSelect(option.value)}
                        disabled={option.disabled}
                        className={cn(
                          'w-full flex items-center px-3 py-2 text-sm text-left',
                          'hover:bg-secondary-100 focus:bg-secondary-100',
                          'focus:outline-none',
                          'dark:hover:bg-secondary-700 dark:focus:bg-secondary-700',
                          isSelected && 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
                          option.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {option.icon && (
                          <span className="mr-2 flex-shrink-0">
                            {option.icon}
                          </span>
                        )}
                        
                        <span className="flex-1 truncate">
                          {option.label}
                        </span>
                        
                        {multiple && isSelected && (
                          <Check className="w-4 h-4 ml-2 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
};