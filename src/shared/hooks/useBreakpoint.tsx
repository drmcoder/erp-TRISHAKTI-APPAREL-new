import React, { useState, useEffect } from 'react';

// Tailwind CSS breakpoints
export const breakpoints = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
  // ERP-specific breakpoints
  'tablet-portrait': 768,
  'tablet-landscape': 1024,
  'desktop': 1280,
  'desktop-wide': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Hook to get the current breakpoint based on window width
 */
export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('md');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= breakpoints['3xl']) {
        setBreakpoint('3xl');
      } else if (width >= breakpoints['2xl']) {
        setBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setBreakpoint('md');
      } else if (width >= breakpoints.sm) {
        setBreakpoint('sm');
      } else if (width >= breakpoints.xs) {
        setBreakpoint('xs');
      } else {
        setBreakpoint('xs');
      }
    };

    // Set initial breakpoint
    updateBreakpoint();

    // Add event listener
    window.addEventListener('resize', updateBreakpoint);

    // Cleanup
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
};

/**
 * Hook to check if the current screen size matches a specific breakpoint
 */
export const useMatchBreakpoint = (targetBreakpoint: Breakpoint): boolean => {
  const currentBreakpoint = useBreakpoint();
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const width = window.innerWidth;
    const targetWidth = breakpoints[targetBreakpoint];
    setMatches(width >= targetWidth);
  }, [currentBreakpoint, targetBreakpoint]);

  return matches;
};

/**
 * Hook to check if the current screen is mobile (below md breakpoint)
 */
export const useIsMobile = (): boolean => {
  return !useMatchBreakpoint('md');
};

/**
 * Hook to check if the current screen is tablet (between md and lg breakpoints)
 */
export const useIsTablet = (): boolean => {
  const currentBreakpoint = useBreakpoint();
  return currentBreakpoint === 'md' || currentBreakpoint === 'tablet-portrait';
};

/**
 * Hook to check if the current screen is desktop (lg and above)
 */
export const useIsDesktop = (): boolean => {
  return useMatchBreakpoint('lg');
};

/**
 * Hook to get responsive values based on current breakpoint
 */
export const useResponsiveValue = <T,>(
  values: Partial<Record<Breakpoint, T>>
): T | undefined => {
  const currentBreakpoint = useBreakpoint();
  
  // Try to find the exact breakpoint match first
  if (values[currentBreakpoint]) {
    return values[currentBreakpoint];
  }
  
  // Fall back to the largest breakpoint that's smaller than current
  const sortedBreakpoints = Object.keys(breakpoints)
    .filter(bp => breakpoints[bp as Breakpoint] <= breakpoints[currentBreakpoint])
    .sort((a, b) => breakpoints[b as Breakpoint] - breakpoints[a as Breakpoint]);
  
  for (const bp of sortedBreakpoints) {
    if (values[bp as Breakpoint]) {
      return values[bp as Breakpoint];
    }
  }
  
  return undefined;
};

/**
 * Utility function to get breakpoint-specific classes
 */
export const getResponsiveClass = (
  classes: Partial<Record<Breakpoint, string>>,
  currentBreakpoint?: Breakpoint
): string => {
  if (!currentBreakpoint) {
    currentBreakpoint = 'md'; // Default fallback
  }
  
  // Return exact match if available
  if (classes[currentBreakpoint]) {
    return classes[currentBreakpoint]!;
  }
  
  // Fall back to largest smaller breakpoint
  const sortedBreakpoints = Object.keys(breakpoints)
    .filter(bp => breakpoints[bp as Breakpoint] <= breakpoints[currentBreakpoint!])
    .sort((a, b) => breakpoints[b as Breakpoint] - breakpoints[a as Breakpoint]);
  
  for (const bp of sortedBreakpoints) {
    if (classes[bp as Breakpoint]) {
      return classes[bp as Breakpoint]!;
    }
  }
  
  return '';
};

/**
 * React component for conditional rendering based on breakpoints
 */
interface ShowProps {
  above?: Breakpoint;
  below?: Breakpoint;
  only?: Breakpoint | Breakpoint[];
  children: React.ReactNode;
}

export const Show: React.FC<ShowProps> = ({ 
  above, 
  below, 
  only, 
  children 
}) => {
  const currentBreakpoint = useBreakpoint();
  const currentWidth = breakpoints[currentBreakpoint];
  
  let shouldShow = true;
  
  if (above) {
    shouldShow = shouldShow && currentWidth >= breakpoints[above];
  }
  
  if (below) {
    shouldShow = shouldShow && currentWidth < breakpoints[below];
  }
  
  if (only) {
    const onlyArray = Array.isArray(only) ? only : [only];
    shouldShow = shouldShow && onlyArray.includes(currentBreakpoint);
  }
  
  return shouldShow ? <>{children}</> : null;
};

/**
 * React component for hiding content at specific breakpoints
 */
interface HideProps {
  above?: Breakpoint;
  below?: Breakpoint;
  only?: Breakpoint | Breakpoint[];
  children: React.ReactNode;
}

export const Hide: React.FC<HideProps> = ({ 
  above, 
  below, 
  only, 
  children 
}) => {
  const currentBreakpoint = useBreakpoint();
  const currentWidth = breakpoints[currentBreakpoint];
  
  let shouldHide = false;
  
  if (above) {
    shouldHide = shouldHide || currentWidth >= breakpoints[above];
  }
  
  if (below) {
    shouldHide = shouldHide || currentWidth < breakpoints[below];
  }
  
  if (only) {
    const onlyArray = Array.isArray(only) ? only : [only];
    shouldHide = shouldHide || onlyArray.includes(currentBreakpoint);
  }
  
  return shouldHide ? null : <>{children}</>;
};