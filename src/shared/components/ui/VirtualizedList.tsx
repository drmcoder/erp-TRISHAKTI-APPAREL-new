import React, { memo, useMemo, useCallback } from 'react';
import { useVirtualization } from '../../hooks/useVirtualization';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  loading?: boolean;
  emptyMessage?: string;
}

function VirtualizedListComponent<T>({
  items,
  itemHeight,
  height,
  renderItem,
  className = '',
  overscan = 5,
  loading = false,
  emptyMessage = 'No items found'
}: VirtualizedListProps<T>) {
  const containerStyle = useMemo(
    () => ({
      height,
      overflow: 'auto',
      position: 'relative' as const
    }),
    [height]
  );

  const {
    virtualItems,
    startIndex,
    totalHeight,
    offsetY
  } = useVirtualization({
    items,
    itemHeight,
    containerHeight: height,
    overscan
  });

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    // Scroll handling is managed by the useVirtualization hook
  }, []);

  if (loading) {
    return (
      <div style={containerStyle} className={className}>
        <div className="space-y-2 p-4">
          {Array.from({ length: Math.ceil(height / itemHeight) }, (_, i) => (
            <div key={i} style={{ height: itemHeight }} className="animate-pulse bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={containerStyle} className={`${className} flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <p className="text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={containerStyle}
      className={className}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {virtualItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="flex-shrink-0"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const VirtualizedList = memo(VirtualizedListComponent) as <T>(
  props: VirtualizedListProps<T>
) => JSX.Element;

// Pre-configured virtualized list for common use cases
export const BundleList = memo(({ bundles, onBundleSelect, loading = false }: {
  bundles: any[];
  onBundleSelect: (bundle: any) => void;
  loading?: boolean;
}) => {
  const renderBundle = useCallback((bundle: any, index: number) => (
    <div
      key={bundle.id || index}
      className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onBundleSelect(bundle)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {bundle.bundleNumber || `Bundle ${index + 1}`}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {bundle.articleStyle || 'No style specified'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {bundle.priority || 'Normal'}
          </span>
        </div>
      </div>
    </div>
  ), [onBundleSelect]);

  return (
    <VirtualizedList
      items={bundles}
      itemHeight={80}
      height={400}
      renderItem={renderBundle}
      loading={loading}
      emptyMessage="No bundles available"
      className="border border-gray-200 rounded-lg"
    />
  );
});

BundleList.displayName = 'BundleList';

export default VirtualizedList;