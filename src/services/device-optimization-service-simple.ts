// Simple Device Optimization Service
// Lightweight version for development without complex dependencies

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'tv';
export type OrientationType = 'portrait' | 'landscape';
export type ConnectionType = '4g' | '3g' | 'wifi' | 'ethernet' | 'slow' | 'fast';

export interface DeviceInfo {
  type: DeviceType;
  orientation: OrientationType;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  touchSupport: boolean;
  connectionType: ConnectionType;
  isOnline: boolean;
  batteryLevel?: number;
  isLowPowerMode: boolean;
  userAgent: string;
  prefersDarkMode: boolean;
  reducedMotion: boolean;
}

export interface LayoutConfig {
  columns: number;
  spacing: 'tight' | 'normal' | 'relaxed';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  buttonSize: 'sm' | 'md' | 'lg' | 'xl';
  cardPadding: string;
  navigationStyle: 'tabs' | 'drawer' | 'sidebar' | 'hidden';
  maxWidth: string;
  gridGap: string;
}

export interface OptimizationSettings {
  enableVirtualScrolling: boolean;
  enableImageLazyLoading: boolean;
  enablePerformanceMode: boolean;
  enableOfflineMode: boolean;
  maxConcurrentRequests: number;
  cacheSize: number;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
}

class DeviceOptimizationService {
  private deviceInfo: DeviceInfo;
  private layoutConfig: LayoutConfig;
  private optimizationSettings: OptimizationSettings;

  constructor() {
    this.deviceInfo = this.detectDevice();
    this.layoutConfig = this.generateLayoutConfig();
    this.optimizationSettings = this.generateOptimizationSettings();
  }

  private detectDevice(): DeviceInfo {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    let deviceType: DeviceType = 'desktop';
    if (screenWidth < 768) deviceType = 'mobile';
    else if (screenWidth < 1024) deviceType = 'tablet';
    else if (screenWidth > 1920) deviceType = 'tv';

    const orientation: OrientationType = screenWidth > screenHeight ? 'landscape' : 'portrait';

    return {
      type: deviceType,
      orientation,
      screenWidth,
      screenHeight,
      pixelRatio: window.devicePixelRatio || 1,
      touchSupport: 'ontouchstart' in window,
      connectionType: 'wifi',
      isOnline: navigator.onLine,
      isLowPowerMode: false,
      userAgent: navigator.userAgent,
      prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };
  }

  private generateLayoutConfig(): LayoutConfig {
    const { type } = this.deviceInfo;
    
    switch (type) {
      case 'mobile':
        return {
          columns: 1,
          spacing: 'tight',
          fontSize: 'medium',
          buttonSize: 'lg',
          cardPadding: 'p-3',
          navigationStyle: 'tabs',
          maxWidth: 'max-w-full',
          gridGap: 'gap-3'
        };
      case 'tablet':
        return {
          columns: 2,
          spacing: 'normal',
          fontSize: 'medium',
          buttonSize: 'md',
          cardPadding: 'p-4',
          navigationStyle: 'drawer',
          maxWidth: 'max-w-4xl',
          gridGap: 'gap-4'
        };
      case 'tv':
        return {
          columns: 4,
          spacing: 'relaxed',
          fontSize: 'xlarge',
          buttonSize: 'xl',
          cardPadding: 'p-8',
          navigationStyle: 'hidden',
          maxWidth: 'max-w-full',
          gridGap: 'gap-8'
        };
      default:
        return {
          columns: 3,
          spacing: 'normal',
          fontSize: 'medium',
          buttonSize: 'md',
          cardPadding: 'p-6',
          navigationStyle: 'sidebar',
          maxWidth: 'max-w-7xl',
          gridGap: 'gap-6'
        };
    }
  }

  private generateOptimizationSettings(): OptimizationSettings {
    return {
      enableVirtualScrolling: true,
      enableImageLazyLoading: true,
      enablePerformanceMode: this.deviceInfo.type === 'mobile',
      enableOfflineMode: false,
      maxConcurrentRequests: 5,
      cacheSize: 50,
      enableAnalytics: true,
      enableErrorReporting: true
    };
  }

  getDeviceInfo(): DeviceInfo {
    return this.deviceInfo;
  }

  getLayoutConfig(): LayoutConfig {
    return this.layoutConfig;
  }

  getOptimizationSettings(): OptimizationSettings {
    return this.optimizationSettings;
  }

  getResponsiveClasses(): Record<string, string> {
    const { type } = this.deviceInfo;
    
    return {
      container: type === 'mobile' ? 'px-4 py-2' : type === 'tablet' ? 'px-6 py-4' : 'px-8 py-6',
      card: type === 'mobile' ? 'p-3 rounded-lg' : 'p-6 rounded-xl',
      button: type === 'mobile' ? 'px-4 py-3 text-base' : 'px-6 py-2 text-sm',
      text: type === 'tv' ? 'text-2xl' : type === 'mobile' ? 'text-base' : 'text-sm',
      grid: `grid-cols-${this.layoutConfig.columns} gap-${type === 'mobile' ? '3' : '6'}`
    };
  }

  isMobile(): boolean {
    return this.deviceInfo.type === 'mobile';
  }

  isTablet(): boolean {
    return this.deviceInfo.type === 'tablet';
  }

  isDesktop(): boolean {
    return this.deviceInfo.type === 'desktop';
  }

  isTV(): boolean {
    return this.deviceInfo.type === 'tv';
  }

  isLandscape(): boolean {
    return this.deviceInfo.orientation === 'landscape';
  }

  isPortrait(): boolean {
    return this.deviceInfo.orientation === 'portrait';
  }
}

// Singleton instance
export const deviceOptimizationService = new DeviceOptimizationService();

export default DeviceOptimizationService;