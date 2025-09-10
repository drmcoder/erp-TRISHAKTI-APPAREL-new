// Firebase Data Display Utility
// Handles displaying Firebase data with proper fallbacks and user guidance

export interface DataDisplayOptions {
  showNA?: boolean;
  showHelperText?: boolean;
  fallbackValue?: string | number;
  unit?: string;
  precision?: number;
}

export interface DataStatus {
  hasData: boolean;
  isEmpty: boolean;
  isLoading: boolean;
  error?: string;
  message?: string;
}

/**
 * Formats Firebase data values with proper N/A fallbacks
 */
export function formatFirebaseValue(
  value: any,
  options: DataDisplayOptions = {}
): string {
  const {
    showNA = true,
    fallbackValue = 'N/A',
    unit = '',
    precision = 0
  } = options;

  // Handle null, undefined, or empty values
  if (value === null || value === undefined || value === '') {
    return showNA ? `${fallbackValue}${unit ? ` ${unit}` : ''}` : '';
  }

  // Handle numbers
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) {
      return showNA ? `${fallbackValue}${unit ? ` ${unit}` : ''}` : '';
    }
    
    const formatted = precision > 0 
      ? value.toFixed(precision)
      : Math.round(value).toLocaleString();
    
    return `${formatted}${unit ? ` ${unit}` : ''}`;
  }

  // Handle strings
  if (typeof value === 'string') {
    return value.trim() || (showNA ? String(fallbackValue) : '');
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.length > 0 
      ? value.length.toString() 
      : (showNA ? String(fallbackValue) : '');
  }

  // Handle objects
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    return keys.length > 0 
      ? keys.length.toString()
      : (showNA ? String(fallbackValue) : '');
  }

  return String(value);
}

/**
 * Creates helper messages for empty data states
 */
export function getDataHelperMessage(dataType: string, hasFirebaseData: boolean): string {
  if (!hasFirebaseData) {
    switch (dataType.toLowerCase()) {
      case 'operators':
        return "Add operators to see performance metrics. Go to Management > Operators to add new operators.";
      case 'bundles':
        return "Add production bundles to see tracking data. Go to WIP Entry to create new bundles.";
      case 'assignments':
        return "Create work assignments to see progress. Go to Work Assignment to assign tasks.";
      case 'production':
        return "Start production activities to see metrics. Add operators and bundles first.";
      case 'analytics':
        return "Analytics will appear when you have production data. Start by adding operators and bundles.";
      case 'quality':
        return "Quality metrics will show when operations are completed. Complete some work assignments first.";
      case 'earnings':
        return "Earnings data will appear when work is completed. Complete assignments to see earnings.";
      default:
        return `Add ${dataType} data to see information here. Check the Management section to add data.`;
    }
  }
  
  return `No ${dataType} data available. Data will automatically update when new ${dataType} are added.`;
}

/**
 * Gets appropriate empty state component props
 */
export function getEmptyStateProps(dataType: string, hasFirebaseData: boolean) {
  const message = getDataHelperMessage(dataType, hasFirebaseData);
  
  return {
    title: hasFirebaseData ? `No ${dataType} Data` : 'Getting Started',
    description: message,
    actionText: hasFirebaseData ? 'Refresh' : 'Add Data',
    actionHint: hasFirebaseData 
      ? 'Data will appear automatically when available'
      : 'Start by adding some data to see metrics here'
  };
}

/**
 * Checks if Firebase data is available and valid
 */
export function validateFirebaseData(data: any): DataStatus {
  if (!data) {
    return {
      hasData: false,
      isEmpty: true,
      isLoading: false,
      message: 'No data available'
    };
  }

  if (data.error) {
    return {
      hasData: false,
      isEmpty: true,
      isLoading: false,
      error: data.error,
      message: data.message || 'Failed to load data'
    };
  }

  if (Array.isArray(data)) {
    return {
      hasData: data.length > 0,
      isEmpty: data.length === 0,
      isLoading: false
    };
  }

  if (typeof data === 'object' && data.data !== undefined) {
    if (Array.isArray(data.data)) {
      return {
        hasData: data.data.length > 0,
        isEmpty: data.data.length === 0,
        isLoading: false,
        message: data.message
      };
    }
    
    if (typeof data.data === 'object') {
      const hasValidValues = Object.values(data.data).some(value => 
        value !== null && value !== undefined && value !== ''
      );
      
      return {
        hasData: hasValidValues,
        isEmpty: !hasValidValues,
        isLoading: false,
        message: data.message
      };
    }
  }

  return {
    hasData: true,
    isEmpty: false,
    isLoading: false
  };
}

/**
 * Creates a React component props object for displaying Firebase data
 */
export function createDataDisplayProps(
  value: any,
  dataType: string,
  options: DataDisplayOptions = {}
) {
  const formattedValue = formatFirebaseValue(value, options);
  const status = validateFirebaseData(value);
  const emptyState = getEmptyStateProps(dataType, status.hasData);
  
  return {
    value: formattedValue,
    hasData: status.hasData,
    isEmpty: status.isEmpty,
    isLoading: status.isLoading,
    error: status.error,
    message: status.message,
    emptyState,
    className: status.isEmpty ? 'text-gray-400' : 'text-gray-900'
  };
}

/**
 * Format currency values with proper locale support
 */
export function formatCurrency(amount: any, currency: string = 'NPR'): string {
  const numAmount = Number(amount);
  
  if (isNaN(numAmount) || !isFinite(numAmount)) {
    return 'N/A';
  }
  
  // Format in Nepali Rupees
  if (currency === 'NPR') {
    return `Rs. ${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
  }
  
  // Format in Indian Rupees  
  if (currency === 'INR') {
    return `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
  }
  
  // Default USD formatting
  return `$${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

/**
 * Format percentage values
 */
export function formatPercentage(value: any, precision: number = 1): string {
  const numValue = Number(value);
  
  if (isNaN(numValue) || !isFinite(numValue)) {
    return 'N/A';
  }
  
  return `${numValue.toFixed(precision)}%`;
}

/**
 * Format time duration
 */
export function formatDuration(minutes: any): string {
  const numMinutes = Number(minutes);
  
  if (isNaN(numMinutes) || !isFinite(numMinutes)) {
    return 'N/A';
  }
  
  if (numMinutes < 60) {
    return `${Math.round(numMinutes)}m`;
  }
  
  const hours = Math.floor(numMinutes / 60);
  const remainingMinutes = Math.round(numMinutes % 60);
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format count values with appropriate suffixes
 */
export function formatCount(count: any): string {
  const numCount = Number(count);
  
  if (isNaN(numCount) || !isFinite(numCount)) {
    return 'N/A';
  }
  
  if (numCount < 1000) {
    return numCount.toString();
  }
  
  if (numCount < 1000000) {
    return `${(numCount / 1000).toFixed(1)}K`;
  }
  
  return `${(numCount / 1000000).toFixed(1)}M`;
}

// Export all utilities as default object for easy importing
export default {
  formatFirebaseValue,
  getDataHelperMessage,
  getEmptyStateProps,
  validateFirebaseData,
  createDataDisplayProps,
  formatCurrency,
  formatPercentage,
  formatDuration,
  formatCount
};