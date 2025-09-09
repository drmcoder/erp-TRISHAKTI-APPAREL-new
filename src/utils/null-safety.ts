// Null Safety Utilities - Comprehensive null/undefined error prevention
// Provides safe data access patterns for Firebase and React components

// Safe data access with default values
export const safeGet = <T>(obj: any, path: string | string[], defaultValue: T): T => {
  try {
    if (!obj) return defaultValue;
    
    const keys = Array.isArray(path) ? path : path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result != null ? result : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Safe string operations
export const safeString = (value: any, defaultValue = ''): string => {
  if (value == null) return defaultValue;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value.toString();
  return defaultValue;
};

// Safe number operations
export const safeNumber = (value: any, defaultValue = 0): number => {
  if (value == null) return defaultValue;
  if (typeof value === 'number' && !isNaN(value)) return value;
  
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Safe array operations
export const safeArray = <T>(value: any, defaultValue: T[] = []): T[] => {
  if (Array.isArray(value)) return value;
  if (value == null) return defaultValue;
  return defaultValue;
};

// Safe object operations
export const safeObject = <T extends Record<string, any>>(value: any, defaultValue: T): T => {
  if (value != null && typeof value === 'object' && !Array.isArray(value)) {
    return value as T;
  }
  return defaultValue;
};

// Safe date operations
export const safeDate = (value: any, defaultValue: Date = new Date()): Date => {
  if (value instanceof Date) return value;
  if (value?.toDate && typeof value.toDate === 'function') return value.toDate();
  if (value?.seconds) return new Date(value.seconds * 1000);
  
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? defaultValue : parsed;
};

// Safe boolean operations
export const safeBoolean = (value: any, defaultValue = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (value == null) return defaultValue;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  if (typeof value === 'number') return value !== 0;
  return defaultValue;
};

// Firebase document safe access
export const safeFirebaseDoc = <T extends Record<string, any>>(
  doc: any,
  defaultValue: T
): T & { id: string } => {
  if (!doc) return { ...defaultValue, id: '' };
  
  const data = doc.data ? doc.data() : doc;
  const id = doc.id || safeGet(doc, 'id', '');
  
  return {
    ...defaultValue,
    ...safeObject(data, {}),
    id: safeString(id)
  };
};

// Safe Firebase array mapping
export const safeFirebaseArray = <T>(
  snapshot: any,
  mapper: (doc: any) => T,
  defaultValue: T[] = []
): T[] => {
  try {
    if (!snapshot) return defaultValue;
    
    const docs = snapshot.docs || snapshot;
    if (!Array.isArray(docs)) return defaultValue;
    
    return docs
      .filter(doc => doc != null)
      .map(doc => {
        try {
          return mapper(doc);
        } catch (error) {
          console.warn('Error mapping Firebase document:', error);
          return null;
        }
      })
      .filter(item => item != null) as T[];
  } catch (error) {
    console.error('Error processing Firebase array:', error);
    return defaultValue;
  }
};

// Component prop safety
export const safeProps = <T extends Record<string, any>>(
  props: Partial<T>,
  defaults: T
): T => {
  const result: any = { ...defaults };
  
  Object.keys(defaults).forEach(key => {
    const propValue = props[key];
    const defaultValue = defaults[key];
    
    if (propValue != null) {
      // Type-safe assignment based on default value type
      if (typeof defaultValue === 'string') {
        result[key] = safeString(propValue, defaultValue);
      } else if (typeof defaultValue === 'number') {
        result[key] = safeNumber(propValue, defaultValue);
      } else if (typeof defaultValue === 'boolean') {
        result[key] = safeBoolean(propValue, defaultValue);
      } else if (Array.isArray(defaultValue)) {
        result[key] = safeArray(propValue, defaultValue);
      } else if (typeof defaultValue === 'object') {
        result[key] = safeObject(propValue, defaultValue);
      } else {
        result[key] = propValue;
      }
    }
  });
  
  return result;
};

// Safe event handler
export const safeEventHandler = <T extends any[]>(
  handler: ((...args: T) => void) | undefined,
  ...args: T
): void => {
  try {
    if (typeof handler === 'function') {
      handler(...args);
    }
  } catch (error) {
    console.error('Error in event handler:', error);
  }
};

// Safe async operation with error handling
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  defaultValue: T,
  errorMessage = 'Operation failed'
): Promise<T> => {
  try {
    const result = await operation();
    return result != null ? result : defaultValue;
  } catch (error) {
    console.error(errorMessage, error);
    return defaultValue;
  }
};

// Safe localStorage operations
export const safeLocalStorage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (item == null) return defaultValue;
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  },
  
  set: (key: string, value: any): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

// Safe component state updater
export const safeStateUpdate = <T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  newValue: T | ((prev: T) => T),
  errorValue: T
): void => {
  try {
    setState(newValue);
  } catch (error) {
    console.error('Error updating state:', error);
    setState(errorValue);
  }
};

// Operator-specific safe access patterns
export const safeOperator = (operator: any) => ({
  id: safeString(operator?.id),
  name: safeString(operator?.name, 'Unknown Operator'),
  employeeId: safeString(operator?.employeeId, 'N/A'),
  email: safeString(operator?.email, ''),
  phone: safeString(operator?.phone, ''),
  machineTypes: safeArray(operator?.machineTypes, []),
  specializations: safeArray(operator?.specializations, []),
  isActive: safeBoolean(operator?.isActive, true),
  availabilityStatus: safeString(operator?.availabilityStatus, 'unknown'),
  averageEfficiency: safeNumber(operator?.averageEfficiency, 0),
  qualityScore: safeNumber(operator?.qualityScore, 0),
  currentAssignments: safeArray(operator?.currentAssignments, []),
  avatar: safeObject(operator?.avatar, {
    type: 'initials',
    value: 'OP',
    backgroundColor: '#3B82F6'
  }),
  createdAt: safeDate(operator?.createdAt),
  updatedAt: safeDate(operator?.updatedAt)
});

// Bundle-specific safe access patterns
export const safeBundle = (bundle: any) => ({
  id: safeString(bundle?.id),
  batchNumber: safeString(bundle?.batchNumber, 'Unknown Batch'),
  status: safeString(bundle?.status, 'pending'),
  operations: safeArray(bundle?.operations, []),
  totalPieces: safeNumber(bundle?.totalPieces, 0),
  completedPieces: safeNumber(bundle?.completedPieces, 0),
  assignedOperatorId: safeString(bundle?.assignedOperatorId),
  priority: safeString(bundle?.priority, 'medium'),
  createdAt: safeDate(bundle?.createdAt),
  updatedAt: safeDate(bundle?.updatedAt)
});

// Validation helpers
export const validateRequired = <T>(value: T, fieldName: string): T => {
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    throw new Error(`${fieldName} is required`);
  }
  return value;
};

export const validateEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  return email;
};

export const validatePhoneNumber = (phone: string): string => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(phone)) {
    throw new Error('Invalid phone number format');
  }
  return phone;
};

// Error boundary helper
export const withErrorBoundary = <T>(
  operation: () => T,
  fallback: T,
  errorMessage = 'Operation failed'
): T => {
  try {
    return operation();
  } catch (error) {
    console.error(errorMessage, error);
    return fallback;
  }
};