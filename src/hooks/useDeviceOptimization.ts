// useDeviceOptimization Hook
// React hook for device-specific UI optimization and responsive behavior

import { useState, useEffect, useMemo } from 'react';
import { 
  deviceOptimizationService, 
  DeviceInfo, 
  LayoutConfig, 
  OptimizationSettings,
  DeviceType,
  OrientationType
} from '../services/device-optimization-service-simple';

export interface UseDeviceOptimizationOptions {
  enableAutoOptimization?: boolean;
  customBreakpoints?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    tv?: number;
  };
}

export interface DeviceOptimizationHook {
  // Device information
  deviceInfo: DeviceInfo;
  deviceType: DeviceType;
  orientation: OrientationType;
  isTouch: boolean;
  isOnline: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTV: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  
  // Layout configuration
  layoutConfig: LayoutConfig;
  columns: number;
  spacing: string;
  fontSize: string;
  buttonSize: string;
  navigationStyle: string;
  
  // Optimization settings
  optimizationSettings: OptimizationSettings;
  shouldLoadImages: boolean;
  shouldEnableAnimations: boolean;
  imageQuality: 'low' | 'medium' | 'high';
  updateFrequency: number;
  
  // CSS classes
  responsiveClasses: {
    container: string;
    spacing: string;
    fontSize: string;
    buttonSize: string;
    cardPadding: string;
    density: string;
    columns: string;
    touchTarget: string;
    highContrast: string;
  };
  
  // Utility functions
  getOptimalImageSize: (baseWidth: number, baseHeight: number) => { width: number; height: number };
  getOptimalFontSize: (baseFontSize: number) => number;
  shouldShowElement: (elementType: 'animation' | 'image' | 'video' | 'complex') => boolean;
  getComponentVariant: (component: 'button' | 'card' | 'input' | 'navigation') => string;
}

export function useDeviceOptimization(options: UseDeviceOptimizationOptions = {}): DeviceOptimizationHook {
  const { enableAutoOptimization = true } = options;

  // State for device information
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(
    deviceOptimizationService.getDeviceInfo()
  );
  
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(
    deviceOptimizationService.getLayoutConfig()
  );
  
  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSettings>(
    deviceOptimizationService.getOptimizationSettings()
  );

  // Update state when device changes
  useEffect(() => {
    const handleDeviceChange = (newDeviceInfo: DeviceInfo) => {
      setDeviceInfo(newDeviceInfo);
      setLayoutConfig(deviceOptimizationService.getLayoutConfig());
      setOptimizationSettings(deviceOptimizationService.getOptimizationSettings());
    };

    const handleDeviceTypeChange = ({ from, to }: { from: DeviceType; to: DeviceType }) => {
      console.log(`📱 Device type changed from ${from} to ${to}`);
    };

    const handleOrientationChange = ({ from, to }: { from: OrientationType; to: OrientationType }) => {
      console.log(`📱 Orientation changed from ${from} to ${to}`);
    };

    // Register event listeners
    deviceOptimizationService.on('deviceChange', handleDeviceChange);
    deviceOptimizationService.on('deviceTypeChange', handleDeviceTypeChange);
    deviceOptimizationService.on('orientationChange', handleOrientationChange);

    // Cleanup
    return () => {
      deviceOptimizationService.off('deviceChange', handleDeviceChange);
      deviceOptimizationService.off('deviceTypeChange', handleDeviceTypeChange);
      deviceOptimizationService.off('orientationChange', handleOrientationChange);
    };
  }, []);

  // Memoized responsive classes
  const responsiveClasses = useMemo(() => {
    return deviceOptimizationService.getResponsiveClasses();
  }, [deviceInfo.type, deviceInfo.orientation, layoutConfig]);

  // Utility functions
  const getOptimalImageSize = useMemo(() => {
    return (baseWidth: number, baseHeight: number) => {
      const { pixelRatio, type } = deviceInfo;
      const { imageQuality } = optimizationSettings;
      
      let scaleFactor = 1;
      
      // Adjust based on device type
      switch (type) {
        case 'mobile':
          scaleFactor = 0.8;
          break;
        case 'tablet':
          scaleFactor = 0.9;
          break;
        case 'tv':
          scaleFactor = 1.5;
          break;
        default:
          scaleFactor = 1;
      }
      
      // Adjust based on image quality setting
      switch (imageQuality) {
        case 'low':
          scaleFactor *= 0.7;
          break;
        case 'medium':
          scaleFactor *= 0.85;
          break;
        case 'high':
          scaleFactor *= 1;
          break;
      }
      
      // Account for pixel ratio but cap it
      const adjustedPixelRatio = Math.min(pixelRatio, 2);
      
      return {
        width: Math.round(baseWidth * scaleFactor * adjustedPixelRatio),
        height: Math.round(baseHeight * scaleFactor * adjustedPixelRatio)
      };
    };
  }, [deviceInfo.pixelRatio, deviceInfo.type, optimizationSettings.imageQuality]);

  const getOptimalFontSize = useMemo(() => {
    return (baseFontSize: number) => {
      const { type } = deviceInfo;
      
      switch (type) {
        case 'mobile':
          return Math.max(baseFontSize * 0.9, 14); // Minimum 14px for mobile
        case 'tablet':
          return baseFontSize * 1.1;
        case 'tv':
          return baseFontSize * 1.5;
        default:
          return baseFontSize;
      }
    };
  }, [deviceInfo.type]);

  const shouldShowElement = useMemo(() => {
    return (elementType: 'animation' | 'image' | 'video' | 'complex') => {
      const { connectionType, isLowPowerMode, reducedMotion } = deviceInfo;
      const { enableAnimations, enableImages } = optimizationSettings;
      
      switch (elementType) {
        case 'animation':
          return enableAnimations && !reducedMotion && !isLowPowerMode;
        case 'image':
          return enableImages && connectionType !== 'slow';
        case 'video':
          return connectionType === '4g' || connectionType === 'wifi' || connectionType === 'ethernet';
        case 'complex':
          return !isLowPowerMode && connectionType !== 'slow';
        default:
          return true;
      }
    };
  }, [deviceInfo, optimizationSettings]);

  const getComponentVariant = useMemo(() => {
    return (component: 'button' | 'card' | 'input' | 'navigation') => {
      const { type, touchSupport } = deviceInfo;
      
      switch (component) {
        case 'button':
          if (type === 'mobile') return 'large';
          if (type === 'tablet') return 'medium';
          if (type === 'tv') return 'xlarge';
          return touchSupport ? 'medium' : 'small';
          
        case 'card':
          if (type === 'mobile') return 'compact';
          if (type === 'tv') return 'spacious';
          return 'comfortable';
          
        case 'input':
          if (type === 'mobile') return 'large';
          if (touchSupport) return 'medium';
          return 'small';
          
        case 'navigation':
          if (type === 'mobile') return 'bottom-tabs';
          if (type === 'tablet') return 'side-drawer';
          if (type === 'tv') return 'hidden';
          return 'top-bar';
          
        default:
          return 'default';
      }
    };
  }, [deviceInfo.type, deviceInfo.touchSupport]);

  // Auto-optimization effect
  useEffect(() => {
    if (!enableAutoOptimization) return;

    // Apply CSS custom properties for dynamic styling
    const root = document.documentElement;
    
    root.style.setProperty('--device-type', deviceInfo.type);
    root.style.setProperty('--orientation', deviceInfo.orientation);
    root.style.setProperty('--columns', layoutConfig.columns.toString());
    root.style.setProperty('--spacing', layoutConfig.spacing);
    root.style.setProperty('--font-size', layoutConfig.fontSize);
    root.style.setProperty('--button-size', layoutConfig.buttonSize);
    
    // Add device-specific classes to body
    document.body.className = document.body.className.replace(/device-\w+/g, '');
    document.body.className = document.body.className.replace(/orientation-\w+/g, '');
    document.body.classList.add(`device-${deviceInfo.type}`);
    document.body.classList.add(`orientation-${deviceInfo.orientation}`);
    
    if (deviceInfo.touchSupport) {
      document.body.classList.add('touch-enabled');
    } else {
      document.body.classList.remove('touch-enabled');
    }
    
    if (deviceInfo.prefersDarkMode) {
      document.body.classList.add('dark-mode-preferred');
    } else {
      document.body.classList.remove('dark-mode-preferred');
    }
    
    if (deviceInfo.reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }

  }, [deviceInfo, layoutConfig, enableAutoOptimization]);

  return {
    // Device information
    deviceInfo,
    deviceType: deviceInfo.type,
    orientation: deviceInfo.orientation,
    isTouch: deviceInfo.touchSupport,
    isOnline: deviceInfo.isOnline,
    isMobile: deviceInfo.type === 'mobile',
    isTablet: deviceInfo.type === 'tablet',
    isDesktop: deviceInfo.type === 'desktop',
    isTV: deviceInfo.type === 'tv',
    isLandscape: deviceInfo.orientation === 'landscape',
    isPortrait: deviceInfo.orientation === 'portrait',
    
    // Layout configuration
    layoutConfig,
    columns: layoutConfig.columns,
    spacing: responsiveClasses.spacing,
    fontSize: responsiveClasses.fontSize,
    buttonSize: responsiveClasses.buttonSize,
    navigationStyle: layoutConfig.navigationStyle,
    
    // Optimization settings
    optimizationSettings,
    shouldLoadImages: deviceOptimizationService.shouldLoadImages(),
    shouldEnableAnimations: deviceOptimizationService.shouldEnableAnimations(),
    imageQuality: deviceOptimizationService.getImageQuality(),
    updateFrequency: deviceOptimizationService.getUpdateFrequency(),
    
    // CSS classes
    responsiveClasses,
    
    // Utility functions
    getOptimalImageSize,
    getOptimalFontSize,
    shouldShowElement,
    getComponentVariant
  };
}

// Specialized hooks for specific device types
export function useMobileOptimization() {
  const optimization = useDeviceOptimization();
  
  return {
    ...optimization,
    isMobileOptimized: optimization.isMobile,
    mobileSpecificClasses: {
      safeArea: 'pb-safe pt-safe',
      fullScreen: 'h-screen w-screen',
      bottomSheet: 'rounded-t-xl',
      mobileCard: 'mx-4 mb-4 rounded-lg',
      mobileButton: 'w-full h-12 text-lg',
      mobileInput: 'h-12 text-base'
    }
  };
}

export function useTabletOptimization() {
  const optimization = useDeviceOptimization();
  
  return {
    ...optimization,
    isTabletOptimized: optimization.isTablet,
    tabletSpecificClasses: {
      splitView: optimization.isLandscape ? 'grid-cols-2' : 'grid-cols-1',
      sidebar: optimization.isLandscape ? 'flex' : 'hidden',
      modalSize: 'max-w-md mx-auto',
      cardGrid: optimization.isLandscape ? 'grid-cols-3' : 'grid-cols-2'
    }
  };
}

export function useTVOptimization() {
  const optimization = useDeviceOptimization();
  
  return {
    ...optimization,
    isTVOptimized: optimization.isTV,
    tvSpecificClasses: {
      largeText: 'text-2xl leading-relaxed',
      highContrast: 'contrast-125',
      spaciousLayout: 'space-y-8 p-8',
      focusRing: 'focus:ring-4 focus:ring-blue-500',
      navigation: 'text-xl p-4'
    }
  };
}

export default useDeviceOptimization;