import React from 'react';
import { cn } from '@/shared/utils';

// Heading Components
export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted';
  children: React.ReactNode;
}

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  as?: 'p' | 'span' | 'div' | 'label';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted';
  align?: 'left' | 'center' | 'right' | 'justify';
  children: React.ReactNode;
}

const headingSizes = {
  'xs': 'text-xs leading-4',      // 12px
  'sm': 'text-sm leading-5',      // 14px
  'md': 'text-base leading-6',    // 16px
  'lg': 'text-lg leading-7',      // 18px
  'xl': 'text-xl leading-7',      // 20px
  '2xl': 'text-2xl leading-8',    // 24px
  '3xl': 'text-3xl leading-9',    // 30px
  '4xl': 'text-4xl leading-10',   // 36px
  '5xl': 'text-5xl leading-none', // 48px
  '6xl': 'text-6xl leading-none', // 60px
};

const textSizes = {
  'xs': 'text-xs leading-4',      // 12px
  'sm': 'text-sm leading-5',      // 14px
  'md': 'text-base leading-6',    // 16px
  'lg': 'text-lg leading-7',      // 18px
  'xl': 'text-xl leading-7',      // 20px
  '2xl': 'text-2xl leading-8',    // 24px
};

const fontWeights = {
  light: 'font-light',      // 300
  normal: 'font-normal',    // 400
  medium: 'font-medium',    // 500
  semibold: 'font-semibold', // 600
  bold: 'font-bold',        // 700
  extrabold: 'font-extrabold', // 800
};

const textColors = {
  primary: 'text-primary-600 dark:text-primary-400',
  secondary: 'text-secondary-900 dark:text-secondary-100',
  success: 'text-success-600 dark:text-success-400',
  warning: 'text-warning-600 dark:text-warning-400',
  danger: 'text-danger-600 dark:text-danger-400',
  muted: 'text-secondary-500 dark:text-secondary-400',
};

const textAlignments = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      as = 'h2',
      size = 'xl',
      weight = 'semibold',
      color = 'secondary',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Component = as;

    return (
      <Component
        ref={ref}
        className={cn(
          // Base styles
          'font-display tracking-tight',
          
          // Size
          headingSizes[size],
          
          // Weight
          fontWeights[weight],
          
          // Color
          textColors[color],
          
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Heading.displayName = 'Heading';

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  (
    {
      as = 'p',
      size = 'md',
      weight = 'normal',
      color = 'secondary',
      align = 'left',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Component = as;

    return (
      <Component
        ref={ref}
        className={cn(
          // Size
          textSizes[size],
          
          // Weight
          fontWeights[weight],
          
          // Color
          textColors[color],
          
          // Alignment
          textAlignments[align],
          
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';

// Predefined heading components
export const H1: React.FC<Omit<HeadingProps, 'as'>> = (props) => (
  <Heading as="h1" size="4xl" {...props} />
);

export const H2: React.FC<Omit<HeadingProps, 'as'>> = (props) => (
  <Heading as="h2" size="3xl" {...props} />
);

export const H3: React.FC<Omit<HeadingProps, 'as'>> = (props) => (
  <Heading as="h3" size="2xl" {...props} />
);

export const H4: React.FC<Omit<HeadingProps, 'as'>> = (props) => (
  <Heading as="h4" size="xl" {...props} />
);

export const H5: React.FC<Omit<HeadingProps, 'as'>> = (props) => (
  <Heading as="h5" size="lg" {...props} />
);

export const H6: React.FC<Omit<HeadingProps, 'as'>> = (props) => (
  <Heading as="h6" size="md" {...props} />
);

// Predefined text components
export const Lead: React.FC<Omit<TextProps, 'size'>> = (props) => (
  <Text size="xl" color="muted" {...props} />
);

export const Body: React.FC<Omit<TextProps, 'size'>> = (props) => (
  <Text size="md" {...props} />
);

export const Small: React.FC<Omit<TextProps, 'size'>> = (props) => (
  <Text size="sm" color="muted" {...props} />
);

export const Caption: React.FC<Omit<TextProps, 'size'>> = (props) => (
  <Text size="xs" color="muted" {...props} />
);

// Code and monospace text
export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  children: React.ReactNode;
}

export const Code: React.FC<CodeProps> = ({ 
  inline = true, 
  className, 
  children, 
  ...props 
}) => {
  if (inline) {
    return (
      <code
        className={cn(
          'px-1.5 py-0.5 text-xs font-mono',
          'bg-secondary-100 text-secondary-800 rounded',
          'dark:bg-secondary-800 dark:text-secondary-200',
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <pre
      className={cn(
        'p-4 text-sm font-mono',
        'bg-secondary-900 text-secondary-100 rounded-lg',
        'overflow-x-auto',
        'dark:bg-secondary-950',
        className
      )}
      {...props}
    >
      <code>{children}</code>
    </pre>
  );
};

// List components
export interface ListProps extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement> {
  ordered?: boolean;
  spacing?: 'tight' | 'normal' | 'loose';
  children: React.ReactNode;
}

export const List: React.FC<ListProps> = ({
  ordered = false,
  spacing = 'normal',
  className,
  children,
  ...props
}) => {
  const Component = ordered ? 'ol' : 'ul';
  
  return (
    <Component
      className={cn(
        // Base styles
        ordered ? 'list-decimal' : 'list-disc',
        'list-inside',
        
        // Spacing
        spacing === 'tight' && 'space-y-1',
        spacing === 'normal' && 'space-y-2',
        spacing === 'loose' && 'space-y-4',
        
        // Colors
        'text-secondary-700 dark:text-secondary-300',
        
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export const ListItem: React.FC<React.HTMLAttributes<HTMLLIElement>> = ({
  className,
  children,
  ...props
}) => (
  <li className={cn('text-sm', className)} {...props}>
    {children}
  </li>
);

// Blockquote
export const Blockquote: React.FC<React.HTMLAttributes<HTMLQuoteElement>> = ({
  className,
  children,
  ...props
}) => (
  <blockquote
    className={cn(
      'pl-4 border-l-4 border-secondary-300 italic',
      'text-secondary-600 dark:text-secondary-400',
      'dark:border-secondary-600',
      className
    )}
    {...props}
  >
    {children}
  </blockquote>
);

// Link component
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'muted';
  underline?: 'none' | 'hover' | 'always';
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({
  variant = 'primary',
  underline = 'hover',
  className,
  children,
  ...props
}) => {
  const linkVariants = {
    primary: 'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300',
    secondary: 'text-secondary-700 hover:text-secondary-900 dark:text-secondary-300 dark:hover:text-secondary-100',
    muted: 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300',
  };

  const underlineStyles = {
    none: 'no-underline',
    hover: 'no-underline hover:underline',
    always: 'underline',
  };

  return (
    <a
      className={cn(
        'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded',
        linkVariants[variant],
        underlineStyles[underline],
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
};