import React from 'react';
import { cn } from '@/shared/utils';

// Container Component
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  centered?: boolean;
  children: React.ReactNode;
}

const containerSizes = {
  sm: 'max-w-screen-sm',      // 640px
  md: 'max-w-screen-md',      // 768px
  lg: 'max-w-screen-lg',      // 1024px
  xl: 'max-w-screen-xl',      // 1280px
  '2xl': 'max-w-screen-2xl',  // 1536px
  full: 'max-w-none',
};

export const Container: React.FC<ContainerProps> = ({
  size = 'xl',
  padding = true,
  centered = true,
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      // Base styles
      'w-full',
      
      // Size
      containerSizes[size],
      
      // Centering
      centered && 'mx-auto',
      
      // Padding
      padding && 'px-4 sm:px-6 lg:px-8',
      
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// Stack Component (Vertical Layout)
export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
  align?: 'start' | 'center' | 'end' | 'stretch';
  children: React.ReactNode;
}

const stackSpacing = {
  0: 'space-y-0',
  1: 'space-y-1',
  2: 'space-y-2',
  3: 'space-y-3',
  4: 'space-y-4',
  5: 'space-y-5',
  6: 'space-y-6',
  8: 'space-y-8',
  10: 'space-y-10',
  12: 'space-y-12',
  16: 'space-y-16',
  20: 'space-y-20',
  24: 'space-y-24',
};

const stackAlign = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

export const Stack: React.FC<StackProps> = ({
  spacing = 4,
  align = 'stretch',
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'flex flex-col',
      stackSpacing[spacing],
      stackAlign[align],
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// Flex Component (Horizontal Layout)
export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  wrap?: boolean;
  children: React.ReactNode;
}

const flexDirections = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  col: 'flex-col',
  'col-reverse': 'flex-col-reverse',
};

const flexAlign = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
};

const flexJustify = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const flexGap = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
};

export const Flex: React.FC<FlexProps> = ({
  direction = 'row',
  align = 'center',
  justify = 'start',
  gap = 0,
  wrap = false,
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'flex',
      flexDirections[direction],
      flexAlign[align],
      flexJustify[justify],
      flexGap[gap],
      wrap && 'flex-wrap',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// Grid Component
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  colsMd?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  colsLg?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  children: React.ReactNode;
}

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
};

const gridColsMd = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  12: 'md:grid-cols-12',
};

const gridColsLg = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
  12: 'lg:grid-cols-12',
};

const gridGap = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
};

export const Grid: React.FC<GridProps> = ({
  cols = 1,
  colsMd,
  colsLg,
  gap = 4,
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'grid',
      gridCols[cols],
      colsMd && gridColsMd[colsMd],
      colsLg && gridColsLg[colsLg],
      gridGap[gap],
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// Spacer Component
export interface SpacerProps {
  size?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 32;
  axis?: 'x' | 'y' | 'both';
}

const spacerSizes = {
  1: 1 * 0.25,   // 4px
  2: 2 * 0.25,   // 8px
  3: 3 * 0.25,   // 12px
  4: 4 * 0.25,   // 16px
  5: 5 * 0.25,   // 20px
  6: 6 * 0.25,   // 24px
  8: 8 * 0.25,   // 32px
  10: 10 * 0.25, // 40px
  12: 12 * 0.25, // 48px
  16: 16 * 0.25, // 64px
  20: 20 * 0.25, // 80px
  24: 24 * 0.25, // 96px
  32: 32 * 0.25, // 128px
};

export const Spacer: React.FC<SpacerProps> = ({
  size = 4,
  axis = 'both'
}) => {
  const spacing = spacerSizes[size];
  
  return (
    <div
      style={{
        width: axis === 'y' ? undefined : `${spacing}rem`,
        height: axis === 'x' ? undefined : `${spacing}rem`,
      }}
      aria-hidden="true"
    />
  );
};

// Divider Component
export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  color?: 'light' | 'medium' | 'dark';
  spacing?: 'tight' | 'normal' | 'loose';
}

const dividerVariants = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
};

const dividerColors = {
  light: 'border-secondary-200 dark:border-secondary-700',
  medium: 'border-secondary-300 dark:border-secondary-600',
  dark: 'border-secondary-400 dark:border-secondary-500',
};

const dividerSpacing = {
  tight: 'my-2',
  normal: 'my-4',
  loose: 'my-8',
};

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  color = 'light',
  spacing = 'normal',
  className,
  ...props
}) => (
  <div
    className={cn(
      orientation === 'horizontal' ? 'border-t' : 'border-l h-full',
      dividerVariants[variant],
      dividerColors[color],
      orientation === 'horizontal' && dividerSpacing[spacing],
      className
    )}
    {...props}
  />
);

// Center Component
export const Center: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn('flex items-center justify-center', className)}
    {...props}
  >
    {children}
  </div>
);

// Aspect Ratio Component
export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: '1:1' | '16:9' | '4:3' | '3:2' | '3:4' | '2:3';
  children: React.ReactNode;
}

const aspectRatios = {
  '1:1': 'aspect-square',
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '3:2': 'aspect-[3/2]',
  '3:4': 'aspect-[3/4]',
  '2:3': 'aspect-[2/3]',
};

export const AspectRatio: React.FC<AspectRatioProps> = ({
  ratio = '16:9',
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'relative w-full',
      aspectRatios[ratio],
      className
    )}
    {...props}
  >
    <div className="absolute inset-0">
      {children}
    </div>
  </div>
);