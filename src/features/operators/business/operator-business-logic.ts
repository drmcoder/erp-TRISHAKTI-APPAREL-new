// Business Logic Layer for Operator Management
// Handles complex business rules, validations, and workflows

import { 
  Operator, 
  OperatorSummary, 
  OperatorStatus, 
  CreateOperatorData, 
  UpdateOperatorData,
  MACHINE_TYPES,
  SKILL_LEVELS 
} from '../types/operator-interfaces';
import { operatorService } from '../services';

export interface BusinessRuleResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface WorkAssignmentRule {
  canAssign: boolean;
  reason?: string;
  maxConcurrentExceeded?: boolean;
  skillMismatch?: boolean;
  machineIncompatible?: boolean;
}

export interface PerformanceMetrics {
  efficiencyTrend: 'improving' | 'declining' | 'stable';
  qualityTrend: 'improving' | 'declining' | 'stable';
  productivityScore: number;
  recommendedActions: string[];
}

export class OperatorBusinessLogic {
  
  // Business Rules for Operator Creation
  static validateOperatorCreation(data: CreateOperatorData): BusinessRuleResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Username uniqueness (would check against database in real implementation)
    if (data.username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    // Employee ID format validation (TSA specific format)
    const employeeIdPattern = /^TSA-\d{4}$/;
    if (!employeeIdPattern.test(data.employeeId)) {
      errors.push('Employee ID must follow format: TSA-XXXX (e.g., TSA-0001)');
    }

    // Machine compatibility validation
    if (!data.machineTypes.includes(data.primaryMachine)) {
      errors.push('Primary machine must be included in machine types list');
    }

    // Skill level vs machine type validation
    const primaryMachineConfig = MACHINE_TYPES.find(m => m.machineType === data.primaryMachine);
    if (primaryMachineConfig) {
      const skillIndex = SKILL_LEVELS.findIndex(s => s.value === data.skillLevel);
      const requiredSkillIndex = SKILL_LEVELS.findIndex(s => s.value === primaryMachineConfig.requiredSkillLevel);
      
      if (skillIndex < requiredSkillIndex) {
        errors.push(`Operator skill level (${data.skillLevel}) is insufficient for primary machine ${primaryMachineConfig.displayName}`);
      }
    }

    // Age and experience validation (if hiredDate suggests inexperience)
    const monthsSinceHired = (Date.now() - new Date(data.hiredDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSinceHired < 3 && data.skillLevel === 'expert') {
      warnings.push('Expert skill level assigned to recently hired operator (< 3 months)');
    }

    // Max concurrent work validation based on skill level
    const skillLevelConfig = SKILL_LEVELS.find(s => s.value === data.skillLevel);
    const maxRecommended = skillLevelConfig?.value === 'beginner' ? 2 : 
                          skillLevelConfig?.value === 'intermediate' ? 4 : 
                          skillLevelConfig?.value === 'advanced' ? 6 : 8;
    
    if (data.maxConcurrentWork > maxRecommended) {
      warnings.push(`Max concurrent work (${data.maxConcurrentWork}) exceeds recommended for skill level (${maxRecommended})`);
    }

    // Email domain validation for TSA organization
    if (data.email && !data.email.endsWith('@tsa.com') && !data.email.endsWith('@contractor.tsa.com')) {
      warnings.push('Email domain should be @tsa.com for employees or @contractor.tsa.com for contractors');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Business Rules for Work Assignment
  static validateWorkAssignment(
    operator: Operator | OperatorSummary, 
    workItem: {
      machineType: string;
      estimatedDuration: number;
      skillRequired: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
    }
  ): WorkAssignmentRule {
    // Check if operator can work on required machine
    const machineCompatible = operator.machineTypes.includes(workItem.machineType) || 
                             operator.primaryMachine === workItem.machineType;

    if (!machineCompatible) {
      return {
        canAssign: false,
        reason: `Operator cannot work on ${workItem.machineType}`,
        machineIncompatible: true
      };
    }

    // Check skill level compatibility
    const operatorSkillIndex = SKILL_LEVELS.findIndex(s => s.value === operator.skillLevel);
    const requiredSkillIndex = SKILL_LEVELS.findIndex(s => s.value === workItem.skillRequired);
    
    if (operatorSkillIndex < requiredSkillIndex) {
      return {
        canAssign: false,
        reason: `Operator skill level insufficient for required work`,
        skillMismatch: true
      };
    }

    // Check current workload
    const currentWorkCount = 'realtimeStatus' in operator ? 
      operator.realtimeStatus?.currentWorkItems || 0 : 0;
    
    if (currentWorkCount >= operator.maxConcurrentWork) {
      return {
        canAssign: false,
        reason: `Operator at maximum concurrent work capacity (${operator.maxConcurrentWork})`,
        maxConcurrentExceeded: true
      };
    }

    // Check operator availability
    const isAvailable = 'realtimeStatus' in operator ? 
      operator.realtimeStatus?.status === 'idle' || operator.realtimeStatus?.status === 'working' :
      operator.currentStatus === 'idle' || operator.currentStatus === 'working';

    if (!isAvailable) {
      return {
        canAssign: false,
        reason: `Operator not available (status: ${('realtimeStatus' in operator ? operator.realtimeStatus?.status : operator.currentStatus)})`
      };
    }

    return { canAssign: true };
  }

  // Performance Analysis Business Logic
  static analyzePerformance(operator: Operator): PerformanceMetrics {
    const recommendations: string[] = [];
    let productivityScore = 0;

    // Analyze efficiency trend (would use historical data in real implementation)
    const efficiency = operator.averageEfficiency;
    let efficiencyTrend: 'improving' | 'declining' | 'stable' = 'stable';
    
    if (efficiency < 0.7) {
      efficiencyTrend = 'declining';
      recommendations.push('Consider additional training or mentoring');
      recommendations.push('Review current work assignments for complexity');
    } else if (efficiency > 0.9) {
      efficiencyTrend = 'improving';
      recommendations.push('Consider for advanced projects');
      recommendations.push('Potential candidate for team lead role');
    }

    // Analyze quality trend
    const quality = operator.qualityScore;
    let qualityTrend: 'improving' | 'declining' | 'stable' = 'stable';
    
    if (quality < 0.8) {
      qualityTrend = 'declining';
      recommendations.push('Quality control training needed');
      recommendations.push('Implement peer review process');
    } else if (quality > 0.95) {
      qualityTrend = 'improving';
      recommendations.push('Consider for quality assurance role');
    }

    // Calculate productivity score (0-100)
    productivityScore = Math.round((efficiency * 0.6 + quality * 0.4) * 100);

    // Experience-based recommendations
    const monthsExperience = operator.totalWorkingDays / 22; // Approximate months
    if (monthsExperience > 12 && operator.skillLevel === 'intermediate') {
      recommendations.push('Consider promotion to advanced skill level');
    }

    // Workload analysis
    if (operator.completedBundles > 100 && efficiency > 0.85) {
      recommendations.push('High performer - consider for complex assignments');
    }

    return {
      efficiencyTrend,
      qualityTrend,
      productivityScore,
      recommendedActions: recommendations
    };
  }

  // Shift Management Business Logic
  static validateShiftAssignment(
    operator: Operator,
    requestedShift: 'morning' | 'afternoon' | 'night',
    date: Date
  ): BusinessRuleResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if operator is changing from their regular shift
    if (operator.shift !== requestedShift) {
      warnings.push(`Operator regular shift is ${operator.shift}, requesting ${requestedShift}`);
    }

    // Night shift restrictions
    if (requestedShift === 'night') {
      const monthsExperience = operator.totalWorkingDays / 22;
      if (monthsExperience < 6) {
        errors.push('Operators with less than 6 months experience cannot work night shifts');
      }
    }

    // Weekend restrictions (if applicable)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
      if (operator.skillLevel === 'beginner') {
        warnings.push('Beginner operators should avoid weekend shifts without supervision');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Machine Assignment Business Logic
  static validateMachineAssignment(
    operator: Operator,
    machineId: string,
    machineType: string
  ): BusinessRuleResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check machine compatibility
    if (!operator.machineTypes.includes(machineType)) {
      errors.push(`Operator not certified for machine type: ${machineType}`);
    }

    // Check if it's primary machine
    if (operator.primaryMachine === machineType) {
      warnings.push('Assigning to primary machine - optimal performance expected');
    } else {
      warnings.push('Assigning to secondary machine - monitor performance closely');
    }

    // Skill level check for complex machines
    const machineConfig = MACHINE_TYPES.find(m => m.machineType === machineType);
    if (machineConfig) {
      const skillIndex = SKILL_LEVELS.findIndex(s => s.value === operator.skillLevel);
      const requiredSkillIndex = SKILL_LEVELS.findIndex(s => s.value === machineConfig.requiredSkillLevel);
      
      if (skillIndex < requiredSkillIndex) {
        errors.push(`Insufficient skill level for machine type: ${machineType}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Attendance and Leave Business Logic
  static validateLeaveRequest(
    operator: Operator,
    leaveType: 'sick' | 'annual' | 'emergency' | 'maternity',
    startDate: Date,
    endDate: Date
  ): BusinessRuleResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const leaveDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Maximum leave duration validation
    const maxLeaveDays = {
      sick: 15,
      annual: 21,
      emergency: 7,
      maternity: 98
    };

    if (leaveDays > maxLeaveDays[leaveType]) {
      errors.push(`${leaveType} leave cannot exceed ${maxLeaveDays[leaveType]} days`);
    }

    // Advance notice requirements
    const daysNotice = Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (leaveType === 'annual' && daysNotice < 7) {
      warnings.push('Annual leave should be requested at least 7 days in advance');
    }

    // Check current assignments
    if ('realtimeStatus' in operator && operator.realtimeStatus?.currentWorkItems > 0) {
      warnings.push('Operator has pending work assignments - consider reassignment');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Training and Certification Business Logic
  static recommendTraining(operator: Operator): string[] {
    const recommendations: string[] = [];

    // Based on performance
    if (operator.averageEfficiency < 0.7) {
      recommendations.push('Efficiency Improvement Workshop');
      recommendations.push('Time Management Training');
    }

    if (operator.qualityScore < 0.8) {
      recommendations.push('Quality Control Certification');
      recommendations.push('Attention to Detail Training');
    }

    // Based on skill level progression
    const monthsExperience = operator.totalWorkingDays / 22;
    if (monthsExperience > 6 && operator.skillLevel === 'beginner') {
      recommendations.push('Intermediate Skills Certification');
    }

    if (monthsExperience > 18 && operator.skillLevel === 'intermediate') {
      recommendations.push('Advanced Operations Training');
      recommendations.push('Leadership Skills Workshop');
    }

    // Machine-specific training
    const availableMachines = MACHINE_TYPES.filter(m => !operator.machineTypes.includes(m.machineType));
    if (availableMachines.length > 0) {
      recommendations.push(`Cross-training on ${availableMachines[0].displayName}`);
    }

    // Safety training (mandatory annual)
    recommendations.push('Annual Safety Refresher Course');

    return recommendations;
  }

  // Promotion Eligibility Business Logic
  static evaluatePromotion(operator: Operator): {
    eligible: boolean;
    nextLevel: string;
    requirements: string[];
    blockers: string[];
  } {
    const requirements: string[] = [];
    const blockers: string[] = [];

    const currentSkillIndex = SKILL_LEVELS.findIndex(s => s.value === operator.skillLevel);
    const nextLevel = SKILL_LEVELS[currentSkillIndex + 1];

    if (!nextLevel) {
      return {
        eligible: false,
        nextLevel: 'Maximum level reached',
        requirements: [],
        blockers: ['Already at highest skill level']
      };
    }

    // Experience requirements
    const monthsExperience = operator.totalWorkingDays / 22;
    const minExperience = {
      'intermediate': 6,
      'advanced': 18,
      'expert': 36
    };

    const requiredMonths = minExperience[nextLevel.value as keyof typeof minExperience];
    if (monthsExperience < requiredMonths) {
      blockers.push(`Need ${requiredMonths - monthsExperience} more months of experience`);
    }

    // Performance requirements
    if (operator.averageEfficiency < 0.8) {
      blockers.push('Efficiency must be at least 80%');
    }

    if (operator.qualityScore < 0.85) {
      blockers.push('Quality score must be at least 85%');
    }

    // Bundle completion requirements
    const minBundles = {
      'intermediate': 50,
      'advanced': 200,
      'expert': 500
    };

    const requiredBundles = minBundles[nextLevel.value as keyof typeof minBundles];
    if (operator.completedBundles < requiredBundles) {
      blockers.push(`Need ${requiredBundles - operator.completedBundles} more completed bundles`);
    }

    // Training requirements
    requirements.push(`Complete ${nextLevel.label} certification course`);
    requirements.push('Pass practical skill assessment');
    requirements.push('Supervisor evaluation');

    return {
      eligible: blockers.length === 0,
      nextLevel: nextLevel.label,
      requirements,
      blockers
    };
  }
}

// Export business logic utilities
export const operatorBusinessLogic = {
  validateOperatorCreation: OperatorBusinessLogic.validateOperatorCreation,
  validateWorkAssignment: OperatorBusinessLogic.validateWorkAssignment,
  analyzePerformance: OperatorBusinessLogic.analyzePerformance,
  validateShiftAssignment: OperatorBusinessLogic.validateShiftAssignment,
  validateMachineAssignment: OperatorBusinessLogic.validateMachineAssignment,
  validateLeaveRequest: OperatorBusinessLogic.validateLeaveRequest,
  recommendTraining: OperatorBusinessLogic.recommendTraining,
  evaluatePromotion: OperatorBusinessLogic.evaluatePromotion
};