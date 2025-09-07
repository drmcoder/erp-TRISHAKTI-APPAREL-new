// UI/UX Configuration
// Comprehensive configuration for mobile responsiveness, performance, and user experience

export const UI_CONFIG = {
  // Mobile Responsiveness Configuration
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    widescreen: '1440px'
  },

  // Touch Interface Configuration
  touch: {
    // Minimum touch target sizes (44px iOS, 48dp Android)
    minTouchTarget: 44,
    touchPadding: 8,
    
    // Gesture thresholds
    swipeThreshold: 50, // pixels
    longPressDelay: 500, // milliseconds
    doubleTapDelay: 300, // milliseconds
    
    // Drag and drop for mobile
    dragStartDelay: 150, // delay before drag starts on touch
    dragScrollThreshold: 20, // pixels
    
    // Mobile-specific spacing
    mobileSpacing: {
      xs: '4px',
      sm: '8px', 
      md: '16px',
      lg: '24px',
      xl: '32px'
    }
  },

  // Performance Configuration
  performance: {
    // Lazy loading thresholds
    lazyLoading: {
      rootMargin: '50px',
      threshold: 0.1,
      maxRetries: 3
    },
    
    // Virtual scrolling
    virtualScroll: {
      itemHeight: 80,
      bufferSize: 5,
      threshold: 100 // items before virtualizing
    },
    
    // Code splitting
    codeSplitting: {
      chunkSize: 250000, // 250KB chunks
      maxChunks: 10,
      cacheGroups: {
        vendor: true,
        common: true,
        features: true
      }
    },
    
    // Image optimization
    images: {
      lazyLoad: true,
      webpSupport: true,
      placeholder: 'blur',
      sizes: {
        thumbnail: 150,
        small: 300,
        medium: 600,
        large: 1200
      },
      quality: {
        thumbnail: 70,
        standard: 85,
        high: 95
      }
    },
    
    // Caching strategies
    cache: {
      images: '7d',
      api: '5m',
      static: '1y',
      sw: '24h' // service worker
    }
  },

  // Internationalization Configuration
  i18n: {
    defaultLocale: 'en',
    supportedLocales: ['en', 'ne'],
    fallbackLocale: 'en',
    
    // Nepali localization
    nepali: {
      dateFormat: 'ne-NP',
      numberFormat: 'ne-NP',
      currency: 'NPR',
      calendar: 'nepali',
      direction: 'ltr'
    },
    
    // Translation keys structure
    namespaces: [
      'common',
      'navigation',
      'operators',
      'work-assignment',
      'production',
      'quality',
      'reports',
      'settings'
    ],
    
    // Dynamic loading
    loadPath: '/locales/{{lng}}/{{ns}}.json',
    interpolation: {
      escapeValue: false
    }
  },

  // Notification System Configuration
  notifications: {
    // Push notification settings
    push: {
      vapidKey: process.env.REACT_APP_VAPID_KEY,
      serviceWorkerPath: '/sw.js',
      maxNotifications: 10,
      defaultIcon: '/icons/notification-192x192.png',
      badge: '/icons/badge-72x72.png'
    },
    
    // Toast notification settings
    toast: {
      position: 'top-right',
      duration: 5000,
      maxToasts: 5,
      animation: 'slide-down',
      closeButton: true,
      pauseOnHover: true
    },
    
    // In-app notification settings
    inApp: {
      maxVisible: 3,
      grouping: true,
      sound: true,
      vibration: [200, 100, 200],
      priority: {
        critical: 1,
        high: 2,
        medium: 3,
        low: 4
      }
    },
    
    // Notification types
    types: {
      system: {
        icon: 'bell',
        color: 'blue',
        sound: 'notification.mp3'
      },
      assignment: {
        icon: 'briefcase',
        color: 'green', 
        sound: 'assignment.mp3'
      },
      quality: {
        icon: 'shield-check',
        color: 'orange',
        sound: 'alert.mp3'
      },
      break: {
        icon: 'coffee',
        color: 'purple',
        sound: 'gentle.mp3'
      },
      achievement: {
        icon: 'trophy',
        color: 'gold',
        sound: 'success.mp3'
      }
    }
  },

  // PWA Configuration
  pwa: {
    // App manifest
    manifest: {
      name: 'TSA ERP - Work Management',
      shortName: 'TSA ERP',
      description: 'Complete work management system for TSA garment factory',
      startUrl: '/',
      display: 'standalone',
      orientation: 'portrait-primary',
      themeColor: '#2563eb',
      backgroundColor: '#ffffff',
      categories: ['productivity', 'business', 'utilities']
    },
    
    // Icons configuration
    icons: [
      { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    
    // Offline configuration
    offline: {
      cacheStrategy: 'NetworkFirst',
      cacheName: 'tsa-erp-v1',
      maxEntries: 100,
      maxAgeSeconds: 86400, // 24 hours
      
      // Routes to cache
      precacheRoutes: [
        '/',
        '/operators',
        '/work-assignments',
        '/dashboard'
      ],
      
      // Runtime caching
      runtimeCaching: {
        api: 'NetworkFirst',
        images: 'CacheFirst',
        static: 'StaleWhileRevalidate'
      }
    },
    
    // Update handling
    updates: {
      checkInterval: 3600000, // 1 hour
      showUpdatePrompt: true,
      autoUpdate: false,
      skipWaiting: false
    }
  },

  // Accessibility Configuration
  accessibility: {
    // Keyboard navigation
    keyboard: {
      enabled: true,
      trapFocus: true,
      skipLinks: true,
      shortcuts: {
        search: ['ctrl+k', 'cmd+k'],
        home: ['ctrl+h', 'cmd+h'],
        assignments: ['ctrl+a', 'cmd+a'],
        operators: ['ctrl+o', 'cmd+o'],
        settings: ['ctrl+,', 'cmd+,'],
        help: ['?', 'f1']
      }
    },
    
    // Screen reader support
    screenReader: {
      announcements: true,
      liveRegions: true,
      skipToContent: true,
      labelledBy: true,
      describedBy: true
    },
    
    // Color and contrast
    colorBlind: {
      highContrast: false,
      reducedMotion: false,
      alternativeColors: true,
      patterns: true // use patterns in addition to colors
    },
    
    // Text scaling
    textScaling: {
      minSize: 12,
      maxSize: 24,
      lineHeight: 1.5,
      letterSpacing: 0.1
    }
  },

  // Animation Configuration
  animations: {
    // Reduced motion preference
    respectReducedMotion: true,
    
    // Default durations
    durations: {
      fast: 150,
      normal: 300,
      slow: 500,
      verySlow: 800
    },
    
    // Easing functions
    easings: {
      easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
      easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    },
    
    // Gesture animations
    gestures: {
      swipe: {
        threshold: 50,
        velocity: 0.3,
        duration: 200
      },
      drag: {
        damping: 0.9,
        stiffness: 300,
        mass: 1
      }
    }
  },

  // Layout Configuration
  layout: {
    // Container sizes
    containers: {
      xs: '100%',
      sm: '540px',
      md: '720px', 
      lg: '960px',
      xl: '1140px',
      xxl: '1320px'
    },
    
    // Grid system
    grid: {
      columns: 12,
      gutter: '24px',
      mobileGutter: '16px'
    },
    
    // Header/navigation
    header: {
      height: '64px',
      mobileHeight: '56px',
      sticky: true,
      shadow: true
    },
    
    // Sidebar
    sidebar: {
      width: '280px',
      mobileWidth: '100%',
      collapsedWidth: '72px',
      breakpoint: 'md'
    },
    
    // Content area
    content: {
      padding: '24px',
      mobilePadding: '16px',
      maxWidth: '1200px'
    }
  },

  // Theme Configuration
  theme: {
    // Color modes
    colorModes: ['light', 'dark', 'auto'],
    defaultMode: 'light',
    
    // Brand colors
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    
    // Typography
    typography: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        nepali: ['Noto Sans Devanagari', 'sans-serif']
      },
      
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    }
  },

  // Search Configuration
  search: {
    // Search behavior
    debounceDelay: 300,
    minQueryLength: 2,
    maxResults: 50,
    highlightMatches: true,
    
    // Search scopes
    scopes: [
      { id: 'all', label: 'All', icon: 'search' },
      { id: 'operators', label: 'Operators', icon: 'users' },
      { id: 'work-items', label: 'Work Items', icon: 'briefcase' },
      { id: 'bundles', label: 'Bundles', icon: 'package' },
      { id: 'reports', label: 'Reports', icon: 'chart-bar' }
    ],
    
    // Filters
    filters: {
      dateRange: true,
      status: true,
      priority: true,
      tags: true
    },
    
    // Recent searches
    recentSearches: {
      enabled: true,
      maxItems: 10,
      storageKey: 'tsa-erp-recent-searches'
    }
  },

  // Loading States Configuration
  loading: {
    // Skeleton loading
    skeletons: {
      enabled: true,
      animation: 'pulse', // pulse, wave, none
      baseColor: '#f3f4f6',
      highlightColor: '#e5e7eb',
      borderRadius: '4px'
    },
    
    // Spinner configuration
    spinners: {
      size: {
        small: '16px',
        medium: '24px',
        large: '32px'
      },
      strokeWidth: 2,
      color: 'primary'
    },
    
    // Progress indicators
    progress: {
      height: '4px',
      color: 'primary',
      backgroundColor: '#e5e7eb',
      animation: true
    }
  }
} as const;

// Type-safe configuration access
export type UIConfigType = typeof UI_CONFIG;

// Helper functions for UI configuration
export const getUIConfig = () => UI_CONFIG;

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < parseInt(UI_CONFIG.breakpoints.tablet);
};

export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= parseInt(UI_CONFIG.breakpoints.tablet) && 
         width < parseInt(UI_CONFIG.breakpoints.desktop);
};

export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= parseInt(UI_CONFIG.breakpoints.desktop);
};

export const getTouchTargetSize = (size?: 'small' | 'medium' | 'large'): number => {
  const baseSize = UI_CONFIG.touch.minTouchTarget;
  switch (size) {
    case 'small': return baseSize;
    case 'medium': return baseSize + 8;
    case 'large': return baseSize + 16;
    default: return baseSize;
  }
};

export const getResponsiveValue = <T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}): T => {
  if (isMobile() && values.mobile !== undefined) return values.mobile;
  if (isTablet() && values.tablet !== undefined) return values.tablet;
  if (isDesktop() && values.desktop !== undefined) return values.desktop;
  return values.default;
};

export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const getAnimationDuration = (speed: keyof typeof UI_CONFIG.animations.durations): number => {
  if (shouldReduceMotion()) return 0;
  return UI_CONFIG.animations.durations[speed];
};

export default UI_CONFIG;