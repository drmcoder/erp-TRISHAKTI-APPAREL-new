// Operator utility functions

import type { Operator, OperatorSummary } from '@/types/operator-types';
import { MACHINE_TYPES, SKILL_LEVELS, STATUS_CONFIG } from '@/types/operator-types';

// Generate operator display name
export function getOperatorDisplayName(operator: Operator | OperatorSummary): string {
  return `${operator.name} (${operator.employeeId})`;
}

// Get machine display name
export function getMachineDisplayName(machineType: string): string {
  const machine = MACHINE_TYPES.find(m => m.machineType === machineType);
  return machine ? `${machine.displayName} (${machine.nepaliName})` : machineType;
}

// Get skill level display
export function getSkillLevelDisplay(skillLevel: string): string {
  const skill = SKILL_LEVELS.find(s => s.value === skillLevel);
  return skill ? `${skill.label} (${skill.nepaliLabel})` : skillLevel;
}

// Get status badge color
export function getStatusColor(status: string): string {
  const statusConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  return statusConfig?.color || 'gray';
}

// Format efficiency percentage
export function formatEfficiency(efficiency: number): string {
  return `${Math.round(efficiency * 100)}%`;
}

// Format currency (Nepali Rupees)
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString()}`;
}

// Generate avatar initials
export function generateInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Check if operator is available for work
export function isOperatorAvailable(operator: Operator | OperatorSummary): boolean {
  if ('realtimeStatus' in operator) {
    return operator.realtimeStatus?.status === 'idle' && operator.realtimeStatus?.machineStatus === 'operational';
  }
  return operator.currentStatus === 'idle';
}

// Check if operator can work on machine
export function canOperateOnMachine(operator: Operator | OperatorSummary, machineType: string): boolean {
  return operator.machineTypes?.includes(machineType) || operator.primaryMachine === machineType;
}

// Calculate operator utilization
export function calculateUtilization(
  totalHours: number,
  workingHours: number
): number {
  return totalHours > 0 ? workingHours / totalHours : 0;
}

// Get operator performance level
export function getPerformanceLevel(efficiency: number, qualityScore: number): 'excellent' | 'good' | 'average' | 'needs_improvement' {
  const avgScore = (efficiency + qualityScore) / 2;
  
  if (avgScore >= 0.9) return 'excellent';
  if (avgScore >= 0.8) return 'good';
  if (avgScore >= 0.7) return 'average';
  return 'needs_improvement';
}

// Filter operators by criteria
export function filterOperators(
  operators: (Operator | OperatorSummary)[],
  criteria: {
    search?: string;
    status?: string;
    machineType?: string;
    skillLevel?: string;
    shift?: string;
  }
): (Operator | OperatorSummary)[] {
  return operators.filter(operator => {
    // Search filter
    if (criteria.search) {
      const searchTerm = criteria.search.toLowerCase();
      const matchesSearch = 
        operator.name.toLowerCase().includes(searchTerm) ||
        operator.employeeId.toLowerCase().includes(searchTerm) ||
        operator.username.toLowerCase().includes(searchTerm);
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (criteria.status && criteria.status !== 'all') {
      const operatorStatus = 'realtimeStatus' in operator ? 
        operator.realtimeStatus?.status : 
        operator.currentStatus;
      
      if (operatorStatus !== criteria.status) return false;
    }

    // Machine type filter
    if (criteria.machineType && criteria.machineType !== 'all') {
      if (!canOperateOnMachine(operator, criteria.machineType)) return false;
    }

    // Skill level filter
    if (criteria.skillLevel && criteria.skillLevel !== 'all') {
      if (operator.skillLevel !== criteria.skillLevel) return false;
    }

    // Shift filter
    if (criteria.shift && criteria.shift !== 'all') {
      if (operator.shift !== criteria.shift) return false;
    }

    return true;
  });
}

// Sort operators by various criteria
export function sortOperators(
  operators: (Operator | OperatorSummary)[],
  sortBy: 'name' | 'efficiency' | 'quality' | 'earnings' | 'recent',
  order: 'asc' | 'desc' = 'asc'
): (Operator | OperatorSummary)[] {
  return [...operators].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'name':
        compareValue = a.name.localeCompare(b.name);
        break;
      case 'efficiency':
        compareValue = (a.averageEfficiency || a.efficiency || 0) - (b.averageEfficiency || b.efficiency || 0);
        break;
      case 'quality':
        compareValue = a.qualityScore - b.qualityScore;
        break;
      case 'earnings':
        const aEarnings = 'totalEarnings' in a ? a.totalEarnings || 0 : 0;
        const bEarnings = 'totalEarnings' in b ? b.totalEarnings || 0 : 0;
        compareValue = aEarnings - bEarnings;
        break;
      case 'recent':
        const aDate = 'realtimeStatus' in a ? 
          new Date(a.realtimeStatus?.lastActivity || 0).getTime() : 
          new Date(a.lastSeen || 0).getTime();
        const bDate = 'realtimeStatus' in b ? 
          new Date(b.realtimeStatus?.lastActivity || 0).getTime() : 
          new Date(b.lastSeen || 0).getTime();
        compareValue = aDate - bDate;
        break;
    }

    return order === 'desc' ? -compareValue : compareValue;
  });
}

// Validate operator data
export function validateOperatorData(data: Partial<Operator>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!data.username || data.username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (!data.employeeId || data.employeeId.trim().length === 0) {
    errors.push('Employee ID is required');
  }

  if (!data.primaryMachine) {
    errors.push('Primary machine is required');
  }

  if (!data.machineTypes || data.machineTypes.length === 0) {
    errors.push('At least one machine type must be selected');
  }

  if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.skillLevel || !['beginner', 'intermediate', 'advanced', 'expert'].includes(data.skillLevel)) {
    errors.push('Valid skill level is required');
  }

  if (!data.shift || !['morning', 'afternoon', 'night'].includes(data.shift)) {
    errors.push('Valid shift is required');
  }

  if (typeof data.maxConcurrentWork === 'number' && (data.maxConcurrentWork < 1 || data.maxConcurrentWork > 10)) {
    errors.push('Max concurrent work must be between 1 and 10');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Get time greeting based on shift
export function getShiftGreeting(shift: string): string {
  switch (shift) {
    case 'morning':
      return 'नमस्कार! शुभ बिहान';
    case 'afternoon':
      return 'नमस्कार! शुभ दिन';
    case 'night':
      return 'नमस्कार! शुभ राती';
    default:
      return 'नमस्कार!';
  }
}

// Export utility functions collection
export const operatorUtils = {
  getOperatorDisplayName,
  getMachineDisplayName,
  getSkillLevelDisplay,
  getStatusColor,
  formatEfficiency,
  formatCurrency,
  generateInitials,
  isOperatorAvailable,
  canOperateOnMachine,
  calculateUtilization,
  getPerformanceLevel,
  filterOperators,
  sortOperators,
  validateOperatorData,
  getShiftGreeting
};