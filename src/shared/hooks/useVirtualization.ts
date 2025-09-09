import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

interface UseVirtualizationProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualizationResult {
  virtualItems: any[];
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetY: number;
  scrollToIndex: (index: number) => void;
}

export const useVirtualization = ({
  items,
  itemHeight,
  containerHeight,
  overscan = 5
}: UseVirtualizationProps): VirtualizationResult => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { startIndex, endIndex, offsetY } = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(items.length - 1, start + visibleCount + 2 * overscan);
    const offset = start * itemHeight;

    return {
      startIndex: start,
      endIndex: end,
      offsetY: offset
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const virtualItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current) {
      const scrollTop = index * itemHeight;
      containerRef.current.scrollTop = scrollTop;
      setScrollTop(scrollTop);
    }
  }, [itemHeight]);

  return {
    virtualItems,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
    scrollToIndex
  };
};

// Hook for optimizing large lists
export const useOptimizedList = <T>(
  items: T[],
  searchTerm: string,
  filterFn?: (item: T, search: string) => boolean
) => {
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    
    const defaultFilter = (item: any, search: string) => 
      JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    
    const filter = filterFn || defaultFilter;
    return items.filter(item => filter(item, searchTerm));
  }, [items, searchTerm, filterFn]);

  return filteredItems;
};

// Hook for debounced search
export const useDebouncedSearch = (value: string, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useVirtualization;