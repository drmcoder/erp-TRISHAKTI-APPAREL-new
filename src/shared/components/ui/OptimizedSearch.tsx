import React, { useState, useCallback, useMemo } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useDebouncedSearch } from '../../hooks/useVirtualization';
import { debounce } from '../../utils/performance-utils';

interface OptimizedSearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  showClearButton?: boolean;
  className?: string;
  autoFocus?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const OptimizedSearch: React.FC<OptimizedSearchProps> = ({
  placeholder = "Search...",
  onSearch,
  debounceMs = 300,
  showClearButton = true,
  className = '',
  autoFocus = false,
  size = 'md'
}) => {
  const [value, setValue] = useState('');
  const debouncedValue = useDebouncedSearch(value, debounceMs);

  // Memoized debounced search function
  const debouncedSearch = useMemo(
    () => debounce(onSearch, debounceMs),
    [onSearch, debounceMs]
  );

  // Effect to call search when debounced value changes
  React.useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
  }, []);

  const handleClear = useCallback(() => {
    setValue('');
    onSearch('');
  }, [onSearch]);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-5 py-3 text-lg'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <MagnifyingGlassIcon className={`text-gray-400 ${iconSizes[size]}`} />
      </div>
      
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`
          w-full pl-10 pr-10 border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-colors duration-200
          placeholder-gray-500 text-gray-900
          ${sizeClasses[size]}
        `}
      />
      
      {showClearButton && value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-gray-100 rounded-r-lg transition-colors"
        >
          <XMarkIcon className={`text-gray-400 hover:text-gray-600 ${iconSizes[size]}`} />
        </button>
      )}
    </div>
  );
};

export default OptimizedSearch;