import { useState, useCallback, useRef, useEffect } from 'react';

export interface LoadingState {
  isLoading: boolean;
  loadingStates: Record<string, boolean>;
}

export interface UseLoadingStateReturn extends LoadingState {
  startLoading: (key?: string) => void;
  stopLoading: (key?: string) => void;
  setLoading: (loading: boolean, key?: string) => void;
  withLoading: <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    key?: string
  ) => (...args: T) => Promise<R>;
  isLoadingAny: boolean;
}

const DEFAULT_KEY = 'default';

export const useLoadingState = (
  initialLoading = false
): UseLoadingStateReturn => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    initialLoading ? { [DEFAULT_KEY]: true } : {}
  );
  
  const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(clearTimeout);
    };
  }, []);

  const startLoading = useCallback((key = DEFAULT_KEY) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
  }, []);

  const stopLoading = useCallback((key = DEFAULT_KEY) => {
    setLoadingStates(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
      delete timeoutRefs.current[key];
    }
  }, []);

  const setLoading = useCallback((loading: boolean, key = DEFAULT_KEY) => {
    if (loading) {
      startLoading(key);
    } else {
      stopLoading(key);
    }
  }, [startLoading, stopLoading]);

  const withLoading = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    key = DEFAULT_KEY
  ) => {
    return async (...args: T): Promise<R> => {
      startLoading(key);
      try {
        return await fn(...args);
      } finally {
        stopLoading(key);
      }
    };
  }, [startLoading, stopLoading]);

  const isLoading = loadingStates[DEFAULT_KEY] || false;
  const isLoadingAny = Object.keys(loadingStates).length > 0;

  return {
    isLoading,
    loadingStates,
    isLoadingAny,
    startLoading,
    stopLoading,
    setLoading,
    withLoading,
  };
};

export const useDelayedLoading = (delay = 200) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay]);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setIsVisible(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    isVisible,
    startLoading,
    stopLoading,
  };
};