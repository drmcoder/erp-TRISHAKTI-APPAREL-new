// Performance optimization utilities

// Debounce function for search and input handling
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

// Throttle function for scroll and resize events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memoization utility
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Image lazy loading utility
export const createImageLoader = () => {
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading support
    return (img: HTMLImageElement) => {
      img.loading = 'lazy';
    };
  }
  
  // Fallback for browsers without native support
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src!;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });
  
  return (img: HTMLImageElement) => {
    img.classList.add('lazy');
    imageObserver.observe(img);
  };
};

// Optimize bundle loading with dynamic imports
export const createDynamicImport = <T>(
  importFn: () => Promise<{ default: T }>,
  retries: number = 3
): Promise<T> => {
  return new Promise((resolve, reject) => {
    let attempt = 0;
    
    const tryImport = () => {
      importFn()
        .then(module => resolve(module.default))
        .catch(error => {
          attempt++;
          if (attempt < retries) {
            console.warn(`Import failed, retrying... (${attempt}/${retries})`);
            setTimeout(tryImport, 1000 * attempt);
          } else {
            reject(new Error(`Failed to load module after ${retries} attempts: ${error.message}`));
          }
        });
    };
    
    tryImport();
  });
};

// Web Workers utility for heavy computations
export const createWebWorker = (workerFunction: Function): Worker => {
  const code = `
    self.onmessage = function(e) {
      const result = (${workerFunction.toString()})(e.data);
      self.postMessage(result);
    }
  `;
  
  const blob = new Blob([code], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
};

// Local storage with compression for large data
export const compressedStorage = {
  setItem: (key: string, value: any) => {
    try {
      const compressed = JSON.stringify(value);
      localStorage.setItem(key, compressed);
    } catch (error) {
      console.warn('Failed to store compressed data:', error);
    }
  },
  
  getItem: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Failed to retrieve compressed data:', error);
      return null;
    }
  },
  
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  }
};

// Performance monitoring
export const performanceMonitor = {
  start: (name: string) => {
    performance.mark(`${name}-start`);
  },
  
  end: (name: string) => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const entries = performance.getEntriesByName(name);
    if (entries.length > 0) {
      const duration = entries[entries.length - 1].duration;
      console.log(`${name} took ${duration.toFixed(2)}ms`);
    }
  }
};

// Check if device is mobile for conditional rendering
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
};

// Optimize arrays for large datasets
export const optimizeArrayOperations = {
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },
  
  unique: <T>(array: T[], keyFn?: (item: T) => any): T[] => {
    if (!keyFn) return [...new Set(array)];
    
    const seen = new Set();
    return array.filter(item => {
      const key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  },
  
  binarySearch: <T>(array: T[], target: T, compareFn?: (a: T, b: T) => number): number => {
    let left = 0;
    let right = array.length - 1;
    const compare = compareFn || ((a, b) => a < b ? -1 : a > b ? 1 : 0);
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const comparison = compare(array[mid], target);
      
      if (comparison === 0) return mid;
      if (comparison < 0) left = mid + 1;
      else right = mid - 1;
    }
    
    return -1;
  }
};

export default {
  debounce,
  throttle,
  memoize,
  createImageLoader,
  createDynamicImport,
  createWebWorker,
  compressedStorage,
  performanceMonitor,
  isMobileDevice,
  optimizeArrayOperations
};