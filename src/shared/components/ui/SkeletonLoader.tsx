import React from 'react';

interface SkeletonProps {
  className?: string;
  rows?: number;
  height?: string;
  animated?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({ 
  className = '', 
  rows = 1, 
  height = 'h-4',
  animated = true 
}) => {
  const baseClasses = `bg-gray-200 rounded ${height} ${animated ? 'animate-pulse' : ''}`;
  
  if (rows === 1) {
    return <div className={`${baseClasses} ${className}`} />;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={baseClasses} style={{ width: `${100 - (index % 3) * 10}%` }} />
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
    <div className="animate-pulse">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="p-6 space-y-6">
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
      
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      
      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <CardSkeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <CardSkeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default SkeletonLoader;