// Progressive Web App utilities for better mobile performance

// Service Worker registration
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available
              showUpdateNotification();
            }
          });
        }
      });

      console.log('Service Worker registered successfully');
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Show update notification
const showUpdateNotification = () => {
  if (confirm('A new version of the app is available. Reload to update?')) {
    window.location.reload();
  }
};

// Cache management
export const cacheManager = {
  // Cache API responses
  cacheResponse: async (url: string, response: Response) => {
    if ('caches' in window) {
      const cache = await caches.open('api-cache-v1');
      await cache.put(url, response.clone());
    }
  },

  // Get cached response
  getCachedResponse: async (url: string): Promise<Response | null> => {
    if ('caches' in window) {
      const cache = await caches.open('api-cache-v1');
      return await cache.match(url) || null;
    }
    return null;
  },

  // Clear old caches
  clearOldCaches: async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        name.startsWith('api-cache-') && name !== 'api-cache-v1'
      );
      
      await Promise.all(
        oldCaches.map(cacheName => caches.delete(cacheName))
      );
    }
  }
};

// Install prompt management
export const installPromptManager = {
  deferredPrompt: null as any,

  // Handle install prompt
  handleInstallPrompt: (e: any) => {
    e.preventDefault();
    installPromptManager.deferredPrompt = e;
    // Show custom install button
    showInstallButton();
  },

  // Trigger install
  triggerInstall: async () => {
    if (installPromptManager.deferredPrompt) {
      installPromptManager.deferredPrompt.prompt();
      const { outcome } = await installPromptManager.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('App installed');
      }
      
      installPromptManager.deferredPrompt = null;
      hideInstallButton();
    }
  }
};

// Show/hide install button
const showInstallButton = () => {
  const button = document.getElementById('install-button');
  if (button) button.style.display = 'block';
};

const hideInstallButton = () => {
  const button = document.getElementById('install-button');
  if (button) button.style.display = 'none';
};

// Network status monitoring
export const networkMonitor = {
  isOnline: navigator.onLine,
  
  init: () => {
    window.addEventListener('online', () => {
      networkMonitor.isOnline = true;
      networkMonitor.onStatusChange?.(true);
    });
    
    window.addEventListener('offline', () => {
      networkMonitor.isOnline = false;
      networkMonitor.onStatusChange?.(false);
    });
  },
  
  onStatusChange: null as ((online: boolean) => void) | null
};

// Background sync for offline actions
export const backgroundSync = {
  // Queue actions for when online
  queueAction: (action: string, data: any) => {
    const queue = JSON.parse(localStorage.getItem('sync-queue') || '[]');
    queue.push({ action, data, timestamp: Date.now() });
    localStorage.setItem('sync-queue', JSON.stringify(queue));
  },

  // Process queued actions
  processQueue: async () => {
    const queue = JSON.parse(localStorage.getItem('sync-queue') || '[]');
    
    for (const item of queue) {
      try {
        await processAction(item.action, item.data);
        // Remove from queue on success
        const newQueue = queue.filter((q: any) => q !== item);
        localStorage.setItem('sync-queue', JSON.stringify(newQueue));
      } catch (error) {
        console.error('Failed to sync action:', error);
      }
    }
  }
};

// Process individual actions
const processAction = async (action: string, data: any) => {
  switch (action) {
    case 'bundle-assignment':
      // Process bundle assignment
      break;
    case 'wip-entry':
      // Process WIP entry
      break;
    // Add more action types as needed
  }
};

// Performance monitoring
export const performanceTracker = {
  // Track page load time
  trackPageLoad: () => {
    window.addEventListener('load', () => {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navTiming.loadEventEnd - navTiming.fetchStart;
      
      console.log(`Page load time: ${loadTime}ms`);
      
      // Send to analytics if available
      if ('gtag' in window) {
        (window as any).gtag('event', 'page_load_time', {
          value: Math.round(loadTime),
          event_category: 'performance'
        });
      }
    });
  },

  // Track First Contentful Paint
  trackFCP: () => {
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log(`First Contentful Paint: ${entry.startTime}ms`);
        }
      }
    }).observe({ entryTypes: ['paint'] });
  },

  // Track Largest Contentful Paint
  trackLCP: () => {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log(`Largest Contentful Paint: ${lastEntry.startTime}ms`);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }
};

// Initialize PWA features
export const initPWA = () => {
  registerServiceWorker();
  networkMonitor.init();
  performanceTracker.trackPageLoad();
  performanceTracker.trackFCP();
  performanceTracker.trackLCP();
  
  // Handle install prompt
  window.addEventListener('beforeinstallprompt', installPromptManager.handleInstallPrompt);
  
  // Process background sync when online
  if (navigator.onLine) {
    backgroundSync.processQueue();
  }
  
  // Clear old caches
  cacheManager.clearOldCaches();
};

export default {
  registerServiceWorker,
  cacheManager,
  installPromptManager,
  networkMonitor,
  backgroundSync,
  performanceTracker,
  initPWA
};