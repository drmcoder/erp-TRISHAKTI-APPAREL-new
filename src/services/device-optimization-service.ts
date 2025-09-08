// Device Optimization Service
// Handles device detection, responsive layouts, and performance optimization

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
  inputMode: 'touch' | 'mouse' | 'hybrid';
  densityLevel: 'compact' | 'comfortable' | 'spacious';
}

export interface OptimizationSettings {
  enableAnimations: boolean;
  enableImages: boolean;
  enablePrefetch: boolean;
  enableServiceWorker: boolean;
  cacheStrategy: 'aggressive' | 'conservative' | 'minimal';
  imageQuality: 'low' | 'medium' | 'high';
  updateFrequency: number; // milliseconds
  maxConcurrentRequests: number;
  enableOfflineMode: boolean;
}

class DeviceOptimizationService {
  private deviceInfo: DeviceInfo;
  private layoutConfig: LayoutConfig;
  private optimizationSettings: OptimizationSettings;
  private callbacks: Map<string, Function[]> = new Map();
  private resizeObserver: ResizeObserver | null = null;
  private orientationListener: ((event: Event) => void) | null = null;

  constructor() {
    this.deviceInfo = this.detectDevice();
    this.layoutConfig = this.generateLayoutConfig();
    this.optimizationSettings = this.generateOptimizationSettings();
    
    this.initializeListeners();
  }

  // Device Detection
  private detectDevice(): DeviceInfo {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    
    // Device type detection
    let deviceType: DeviceType = 'desktop';
    if (screenWidth <= 480) {
      deviceType = 'mobile';
    } else if (screenWidth <= 768) {
      deviceType = 'tablet';
    } else if (screenWidth >= 1920) {
      deviceType = 'tv';
    }

    // Mobile device detection via user agent
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
    
    if (isMobile && !isTablet && deviceType !== 'mobile') {
      deviceType = 'mobile';
    } else if (isTablet && deviceType !== 'tablet') {
      deviceType = 'tablet';
    }

    // Orientation detection
    const orientation: OrientationType = screenWidth > screenHeight ? 'landscape' : 'portrait';

    // Connection detection
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    let connectionType: ConnectionType = 'wifi';
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === '4g') {
        connectionType = '4g';
      } else if (effectiveType === '3g') {
        connectionType = '3g';
      } else if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        connectionType = 'slow';
      }
    }

    // Other device capabilities
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const pixelRatio = window.devicePixelRatio || 1;
    const isOnline = navigator.onLine;
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Battery information
    let batteryLevel: number | undefined;
    let isLowPowerMode = false;
    
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryLevel = battery.level * 100;
        isLowPowerMode = battery.level < 0.2;
      });
    }

    return {
      type: deviceType,
      orientation,
      screenWidth,
      screenHeight,
      pixelRatio,
      touchSupport,
      connectionType,
      isOnline,
      batteryLevel,
      isLowPowerMode,
      userAgent,
      prefersDarkMode,
      reducedMotion
    };
  }

  // Layout Configuration Generation
  private generateLayoutConfig(): LayoutConfig {
    const { type, orientation, screenWidth, touchSupport } = this.deviceInfo;
    
    let config: LayoutConfig = {
      columns: 1,
      spacing: 'normal',
      fontSize: 'medium',
      buttonSize: 'md',
      cardPadding: 'p-4',
      navigationStyle: 'tabs',
      inputMode: touchSupport ? 'touch' : 'mouse',
      densityLevel: 'comfortable'
    };

    switch (type) {
      case 'mobile':
        config = {
          columns: 1,
          spacing: 'tight',
          fontSize: orientation === 'landscape' ? 'small' : 'medium',
          buttonSize: 'lg',
          cardPadding: 'p-3',
          navigationStyle: 'tabs',
          inputMode: 'touch',
          densityLevel: 'compact'
        };
        break;

      case 'tablet':
        config = {
          columns: orientation === 'landscape' ? 2 : 1,
          spacing: 'normal',
          fontSize: 'medium',
          buttonSize: 'lg',
          cardPadding: 'p-4',
          navigationStyle: 'drawer',
          inputMode: 'touch',
          densityLevel: 'comfortable'
        };
        break;

      case 'desktop':
        config = {
          columns: Math.floor(screenWidth / 400),
          spacing: 'normal',
          fontSize: 'medium',
          buttonSize: 'md',
          cardPadding: 'p-4',
          navigationStyle: 'sidebar',
          inputMode: touchSupport ? 'hybrid' : 'mouse',
          densityLevel: 'comfortable'
        };
        break;

      case 'tv':
        config = {
          columns: Math.floor(screenWidth / 500),
          spacing: 'relaxed',
          fontSize: 'xlarge',
          buttonSize: 'xl',
          cardPadding: 'p-6',
          navigationStyle: 'hidden',
          inputMode: 'mouse',
          densityLevel: 'spacious'
        };
        break;
    }

    return config;
  }

  // Optimization Settings Generation
  private generateOptimizationSettings(): OptimizationSettings {
    const { type, connectionType, isLowPowerMode } = this.deviceInfo;
    
    // Base settings
    let settings: OptimizationSettings = {
      enableAnimations: true,
      enableImages: true,
      enablePrefetch: true,
      enableServiceWorker: true,
      cacheStrategy: 'conservative',
      imageQuality: 'medium',
      updateFrequency: 5000,
      maxConcurrentRequests: 6,
      enableOfflineMode: true
    };

    // Device-specific optimizations
    if (type === 'mobile') {
      settings.imageQuality = 'medium';
      settings.maxConcurrentRequests = 4;
      settings.updateFrequency = 10000;
    }

    // Connection-specific optimizations
    if (connectionType === 'slow' || connectionType === '3g') {
      settings.enableAnimations = false;
      settings.imageQuality = 'low';
      settings.enablePrefetch = false;
      settings.cacheStrategy = 'aggressive';
      settings.maxConcurrentRequests = 2;
      settings.updateFrequency = 30000;
    }

    // Battery optimizations
    if (isLowPowerMode) {
      settings.enableAnimations = false;
      settings.updateFrequency = 60000;
      settings.maxConcurrentRequests = 2;
    }

    // Reduced motion support
    if (this.deviceInfo.reducedMotion) {
      settings.enableAnimations = false;
    }

    return settings;
  }

  // Event Listeners
  private initializeListeners(): void {
    // Resize listener
    this.resizeObserver = new ResizeObserver((entries) => {
      const newDeviceInfo = this.detectDevice();
      if (newDeviceInfo.type !== this.deviceInfo.type || 
          newDeviceInfo.orientation !== this.deviceInfo.orientation) {
        this.updateDevice(newDeviceInfo);
      }
    });
    
    if (document.body) {
      this.resizeObserver.observe(document.body);
    }

    // Orientation change listener
    this.orientationListener = () => {
      setTimeout(() => {
        const newDeviceInfo = this.detectDevice();
        this.updateDevice(newDeviceInfo);
      }, 100); // Delay to ensure dimensions are updated
    };
    
    window.addEventListener('orientationchange', this.orientationListener);
    window.addEventListener('resize', this.orientationListener);

    // Online/offline listeners
    window.addEventListener('online', () => {
      this.updateDevice({ ...this.deviceInfo, isOnline: true });
    });

    window.addEventListener('offline', () => {
      this.updateDevice({ ...this.deviceInfo, isOnline: false });
    });

    // Battery status listener
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          const batteryLevel = battery.level * 100;
          const isLowPowerMode = battery.level < 0.2;
          this.updateDevice({ 
            ...this.deviceInfo, 
            batteryLevel, 
            isLowPowerMode 
          });
        };

        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      });
    }

    // Connection change listener
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', () => {
        const newDeviceInfo = this.detectDevice();
        this.updateDevice(newDeviceInfo);
      });
    }
  }

  // Update Device Information
  private updateDevice(newDeviceInfo: DeviceInfo): void {
    const prevType = this.deviceInfo.type;
    const prevOrientation = this.deviceInfo.orientation;

    this.deviceInfo = newDeviceInfo;
    this.layoutConfig = this.generateLayoutConfig();
    this.optimizationSettings = this.generateOptimizationSettings();

    // Trigger callbacks
    this.emit('deviceChange', this.deviceInfo);
    
    if (prevType !== newDeviceInfo.type) {
      this.emit('deviceTypeChange', { from: prevType, to: newDeviceInfo.type });
    }
    
    if (prevOrientation !== newDeviceInfo.orientation) {
      this.emit('orientationChange', { from: prevOrientation, to: newDeviceInfo.orientation });
    }

    console.log('🔄 Device updated:', newDeviceInfo.type, newDeviceInfo.orientation);
  }

  // Event Management
  on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (callback) {
      const callbacks = this.callbacks.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    } else {
      this.callbacks.delete(event);
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }

  // Public Methods
  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }

  getLayoutConfig(): LayoutConfig {
    return { ...this.layoutConfig };
  }

  getOptimizationSettings(): OptimizationSettings {
    return { ...this.optimizationSettings };
  }

  // Responsive Classes Generation
  getResponsiveClasses(): { [key: string]: string } {
    const { type, orientation } = this.deviceInfo;
    const { spacing, fontSize, buttonSize, cardPadding, densityLevel } = this.layoutConfig;

    const spacingMap = {
      tight: 'gap-2',
      normal: 'gap-4',
      relaxed: 'gap-6'
    };

    const fontSizeMap = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
      xlarge: 'text-xl'
    };

    const buttonSizeMap = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg'
    };

    const densityMap = {
      compact: 'space-y-2',
      comfortable: 'space-y-4',
      spacious: 'space-y-6'
    };

    return {
      container: `device-${type} orientation-${orientation} density-${densityLevel}`,
      spacing: spacingMap[spacing],
      fontSize: fontSizeMap[fontSize],
      buttonSize: buttonSizeMap[buttonSize],
      cardPadding,
      density: densityMap[densityLevel],
      columns: `grid-cols-${this.layoutConfig.columns}`,
      touchTarget: this.deviceInfo.touchSupport ? 'min-h-[44px] min-w-[44px]' : '',
      highContrast: type === 'tv' ? 'contrast-125' : ''
    };
  }

  // Performance Optimization Methods
  shouldLoadImages(): boolean {
    return this.optimizationSettings.enableImages && 
           this.deviceInfo.connectionType !== 'slow';
  }

  shouldEnableAnimations(): boolean {
    return this.optimizationSettings.enableAnimations && 
           !this.deviceInfo.reducedMotion && 
           !this.deviceInfo.isLowPowerMode;
  }

  getImageQuality(): 'low' | 'medium' | 'high' {
    return this.optimizationSettings.imageQuality;
  }

  getUpdateFrequency(): number {
    return this.optimizationSettings.updateFrequency;
  }

  // Layout Helpers
  getGridColumns(): number {
    return this.layoutConfig.columns;
  }

  getNavigationStyle(): string {
    return this.layoutConfig.navigationStyle;
  }

  isTouch(): boolean {
    return this.deviceInfo.touchSupport;
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

  // Cleanup
  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.orientationListener) {
      window.removeEventListener('orientationchange', this.orientationListener);
      window.removeEventListener('resize', this.orientationListener);
    }

    this.callbacks.clear();
  }

  // Debug Information
  getDebugInfo(): any {
    return {
      deviceInfo: this.deviceInfo,
      layoutConfig: this.layoutConfig,
      optimizationSettings: this.optimizationSettings,
      responsiveClasses: this.getResponsiveClasses()
    };
  }
}

// Singleton instance
export const deviceOptimizationService = new DeviceOptimizationService();

export default DeviceOptimizationService;