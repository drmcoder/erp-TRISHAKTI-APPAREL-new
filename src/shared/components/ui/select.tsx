import * as React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/shared/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none" />
    </div>
  )
);
Select.displayName = 'Select';

// Additional Select component exports for compatibility
export const SelectContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <>{children}</>
);

export const SelectItem: React.FC<{ value: string; children: React.ReactNode; className?: string }> = ({ 
  value, 
  children, 
  className 
}) => (
  <option value={value} className={className}>
    {children}
  </option>
);

export const SelectTrigger = Select;

export const SelectValue: React.FC<{ placeholder?: string; className?: string }> = ({ placeholder }) => (
  <>{placeholder}</>
);

export { Select };