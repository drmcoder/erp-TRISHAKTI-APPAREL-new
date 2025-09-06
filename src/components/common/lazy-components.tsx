// Lazy Loading Components
// Code splitting and lazy loading implementation with performance optimizations

import React, { Suspense, lazy, ComponentType, LazyExoticComponent } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Loading skeleton components
export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("animate-pulse space-y-4", className)}>
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
    </div>
  </div>
);

export const TableLoadingSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  </div>
);

export const CardLoadingSkeleton: React.FC = () => (
  <Card>
    <CardContent className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-4/5"></div>
          <div className="h-3 bg-gray-200 rounded w-3/5"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ChartLoadingSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
    <div className="flex justify-center space-x-4">
      <div className="h-3 bg-gray-200 rounded w-16"></div>
      <div className="h-3 bg-gray-200 rounded w-20"></div>
      <div className="h-3 bg-gray-200 rounded w-18"></div>
    </div>
  </div>
);

// Universal loading component
export const ComponentLoader: React.FC<{ 
  type?: 'default' | 'table' | 'card' | 'chart';
  className?: string;
}> = ({ type = 'default', className }) => {
  switch (type) {
    case 'table':
      return <TableLoadingSkeleton />;
    case 'card':
      return <CardLoadingSkeleton />;
    case 'chart':
      return <ChartLoadingSkeleton />;
    default:
      return <LoadingSkeleton className={className} />;
  }
};

// Full page loading component
export const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
      <div className="text-sm text-muted-foreground">Loading...</div>
    </div>
  </div>
);

// Error fallback component
export const ErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => (
  <div className="min-h-[200px] flex items-center justify-center">
    <Card className="w-full max-w-md mx-4">
      <CardContent className="p-6 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />
        <div>
          <h3 className="font-semibold text-lg">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>
        <Button onClick={resetErrorBoundary} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  </div>
);

// Lazy wrapper with error boundary
export const LazyWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ComponentType;
  loadingType?: 'default' | 'table' | 'card' | 'chart' | 'page';
}> = ({ children, fallback, loadingType = 'default' }) => {
  const LoadingComponent = fallback || (() => 
    loadingType === 'page' ? <PageLoader /> : <ComponentLoader type={loadingType} />
  );

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingComponent />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// HOC for lazy loading with retry logic
export function withLazyLoading<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallbackComponent?: ComponentType,
  retries: number = 3
): LazyExoticComponent<ComponentType<T>> {
  return lazy(async () => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await importFunc();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Lazy loading attempt ${attempt} failed:`, error);
        
        if (attempt < retries) {
          // Exponential backoff delay
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  });
}

// Preload component function
export const preloadComponent = (
  importFunc: () => Promise<any>
): (() => Promise<any>) => {
  let componentPromise: Promise<any> | null = null;
  
  return () => {
    if (!componentPromise) {
      componentPromise = importFunc();
    }
    return componentPromise;
  };
};

// Intersection Observer based lazy loading
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [hasIntersected, setHasIntersected] = React.useState(false);

  React.useEffect(() => {
    const current = ref.current;
    if (!current || hasIntersected) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasIntersected(true);
            callback();
          }
        });
      },
      { 
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(current);
    
    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [callback, hasIntersected, options]);

  return { ref, hasIntersected };
};

// Lazy loading container with intersection observer
export const LazyContainer: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  once?: boolean;
}> = ({ children, fallback, className, once = true }) => {
  const [shouldRender, setShouldRender] = React.useState(false);
  
  const { ref } = useIntersectionObserver(() => {
    setShouldRender(true);
  });

  return (
    <div ref={ref} className={className}>
      {shouldRender ? children : (fallback || <ComponentLoader />)}
    </div>
  );
};

// Heavy component lazy loader
export const HeavyComponentLoader: React.FC<{
  component: LazyExoticComponent<ComponentType<any>>;
  props?: any;
  delay?: number;
  preload?: boolean;
}> = ({ component: Component, props, delay = 0, preload = false }) => {
  const [shouldLoad, setShouldLoad] = React.useState(!delay);

  React.useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setShouldLoad(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  React.useEffect(() => {
    if (preload && Component) {
      // Preload the component
      const preloadTimer = setTimeout(() => {
        Component._payload?._result || Component._init?.(Component._payload);
      }, 100);
      
      return () => clearTimeout(preloadTimer);
    }
  }, [preload, Component]);

  if (!shouldLoad) {
    return <ComponentLoader />;
  }

  return (
    <LazyWrapper fallback={() => <ComponentLoader />}>
      <Component {...props} />
    </LazyWrapper>
  );
};

// Bundle analyzer component for development
export const BundleAnalyzer: React.FC = () => {
  const [bundleInfo, setBundleInfo] = React.useState<any>(null);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Simulate bundle analysis
      setTimeout(() => {
        setBundleInfo({
          totalSize: '2.1 MB',
          chunks: [
            { name: 'main', size: '450 KB', loaded: true },
            { name: 'vendors', size: '1.2 MB', loaded: true },
            { name: 'work-assignment', size: '280 KB', loaded: false },
            { name: 'operators', size: '120 KB', loaded: false },
            { name: 'reports', size: '95 KB', loaded: false }
          ]
        });
      }, 2000);
    }
  }, []);

  if (process.env.NODE_ENV !== 'development' || !bundleInfo) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="font-semibold text-sm mb-2">Bundle Analysis</h3>
      <div className="text-xs space-y-1">
        <div>Total: {bundleInfo.totalSize}</div>
        {bundleInfo.chunks.map((chunk: any) => (
          <div key={chunk.name} className="flex justify-between">
            <span className={chunk.loaded ? 'text-green-600' : 'text-gray-500'}>
              {chunk.name}
            </span>
            <span>{chunk.size}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  LazyWrapper,
  ComponentLoader,
  PageLoader,
  ErrorFallback,
  withLazyLoading,
  preloadComponent,
  LazyContainer,
  HeavyComponentLoader
};