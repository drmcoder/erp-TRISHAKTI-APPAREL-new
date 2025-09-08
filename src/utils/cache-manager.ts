// Cache Management Utility - Force reload and clear browser cache
export class CacheManager {
  private static readonly CACHE_VERSION_KEY = 'tsa_cache_version';
  private static readonly CURRENT_VERSION = Date.now().toString();

  /**
   * Force reload the application and clear all caches
   */
  static forceReload(): void {
    // Clear all local storage
    localStorage.clear();
    
    // Clear session storage
    sessionStorage.clear();
    
    // Set new cache version
    localStorage.setItem(this.CACHE_VERSION_KEY, this.CURRENT_VERSION);
    
    // Force reload without cache
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    }
    
    // Hard reload
    window.location.reload();
  }

  /**
   * Check if app needs to be reloaded due to cache version mismatch
   */
  static shouldReload(): boolean {
    const storedVersion = localStorage.getItem(this.CACHE_VERSION_KEY);
    return !storedVersion || storedVersion !== this.CURRENT_VERSION;
  }

  /**
   * Clear specific cache by key
   */
  static clearCache(key: string): void {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }

  /**
   * Add cache-busting parameter to URL
   */
  static addCacheBuster(url: string): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_cb=${Date.now()}`;
  }

  /**
   * Programmatically clear browser cache (limited)
   */
  static async clearBrowserCache(): Promise<void> {
    try {
      // Clear service worker caches if available
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
    } catch (error) {
      console.warn('Could not clear browser cache:', error);
    }
  }

  /**
   * Show reload prompt to user
   */
  static showReloadPrompt(): void {
    const shouldReload = confirm(
      'A new version of the app is available. Click OK to reload and get the latest updates.'
    );
    
    if (shouldReload) {
      this.forceReload();
    }
  }

  /**
   * Initialize cache management
   */
  static init(): void {
    // Check if reload is needed on app startup
    if (this.shouldReload()) {
      console.log('Cache version mismatch detected, updating...');
      localStorage.setItem(this.CACHE_VERSION_KEY, this.CURRENT_VERSION);
    }

    // Add global reload function
    (window as any).forceReload = this.forceReload.bind(this);
    (window as any).clearCache = this.clearBrowserCache.bind(this);
  }
}

// Auto-initialize
CacheManager.init();

export default CacheManager;