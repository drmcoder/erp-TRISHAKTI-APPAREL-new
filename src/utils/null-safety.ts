// Null safety utilities for TSA ERP System

/**
 * Safely gets a value from an object, returning undefined if path doesn't exist
 */
export function safeGet<T>(obj: any, path: string, defaultValue?: T): T | undefined {
  try {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely calls a function, catching any errors
 */
export function safeCall<T>(fn: () => T, fallback?: T): T | undefined {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/**
 * Safely converts value to array
 */
export function safeArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Safely converts value to string
 */
export function safeString(value: any, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

/**
 * Safely converts value to number
 */
export function safeNumber(value: any, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  const num = Number(value);
  return isNaN(num) ? fallback : num;
}

/**
 * Safely transforms operator data with null-safe defaults
 */
export function safeOperator(operator: any) {
  if (!operator) return null;
  
  return {
    ...operator,
    name: safeString(operator.name, 'Unknown'),
    employeeId: safeString(operator.employeeId, 'N/A'),
    email: safeString(operator.email, ''),
    phone: safeString(operator.phone, ''),
    address: safeString(operator.address, ''),
    machineTypes: safeArray(operator.machineTypes),
    specializations: safeArray(operator.specializations),
    currentAssignments: safeArray(operator.currentAssignments),
    averageEfficiency: safeNumber(operator.averageEfficiency, 0),
    qualityScore: safeNumber(operator.qualityScore, 85),
    totalPieces: safeNumber(operator.totalPieces, 0),
    completedBundles: safeNumber(operator.completedBundles, 0),
    totalEarnings: safeNumber(operator.totalEarnings, 0),
    maxConcurrentWork: safeNumber(operator.maxConcurrentWork, 1),
    isActive: Boolean(operator.isActive !== false), // Default to true
    availabilityStatus: operator.availabilityStatus || 'available',
    primaryMachine: safeString(operator.primaryMachine, ''),
    skillLevel: operator.skillLevel || 'intermediate'
  };
}