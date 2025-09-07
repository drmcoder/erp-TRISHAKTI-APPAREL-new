// Business Logic Layer for Supervisor Management
// Handles complex business rules, validations, and workflows for supervisors

import { 
  Supervisor, 
  Operator, 
  Bundle,
  WorkItem,
  SupervisorLevel,
  AssignmentRequest 
} from '../../../types/entities';
import { supervisorService } from '../../../services/entities/supervisor-service';
import { operatorService } from '../../../services/entities/operator-service';

export interface SupervisorBusinessRuleResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface WorkAssignmentDecision {
  canAssign: boolean;
  reason?: string;
  alternativeSuggestions?: string[];
  requiredApprovals?: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface TeamProductivityMetrics {
  teamEfficiency: number;
  averageQuality: number;
  completionRate: number;
  onTimeDelivery: number;
  recommendedActions: string[];
  teamHealthScore: number;
}

export interface ApprovalDecision {
  shouldAutoApprove: boolean;
  reason: string;
  requiredSupervisorLevel: SupervisorLevel;
  additionalValidations: string[];
  riskFactors: string[];
}

export class SupervisorBusinessLogic {
  
  // Business Rules for Supervisor Creation and Management
  static validateSupervisorCreation(data: any): SupervisorBusinessRuleResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Username and basic validation
    if (!data.username || data.username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    // Supervisor level validation based on experience
    if (!data.supervisorLevel || !['junior', 'senior', 'lead'].includes(data.supervisorLevel)) {
      errors.push('Supervisor level must be junior, senior, or lead');
    }

    // Experience requirements for supervisor levels
    const monthsExperience = data.experienceMonths || 0;
    const levelRequirements = {
      'junior': 12,    // At least 1 year experience
      'senior': 36,    // At least 3 years experience
      'lead': 60       // At least 5 years experience
    };

    const requiredMonths = levelRequirements[data.supervisorLevel as keyof typeof levelRequirements];
    if (requiredMonths && monthsExperience < requiredMonths) {
      errors.push(`${data.supervisorLevel} supervisor requires at least ${requiredMonths} months of experience`);
    }

    // Team size validation based on supervisor level
    const maxTeamSizes = {
      'junior': 8,
      'senior': 15,
      'lead': 25
    };

    const maxTeamSize = maxTeamSizes[data.supervisorLevel as keyof typeof maxTeamSizes];
    if (data.teamMembers && data.teamMembers.length > maxTeamSize) {
      warnings.push(`Team size (${data.teamMembers.length}) exceeds recommended maximum for ${data.supervisorLevel} supervisor (${maxTeamSize})`);
    }

    // Line responsibility validation
    if (!data.responsibleLines || !Array.isArray(data.responsibleLines) || data.responsibleLines.length === 0) {
      errors.push('Supervisor must be assigned to at least one production line');
    }

    // Maximum line responsibility based on level
    const maxLines = {
      'junior': 2,
      'senior': 4,
      'lead': 8
    };

    const maxLineCount = maxLines[data.supervisorLevel as keyof typeof maxLines];
    if (data.responsibleLines && data.responsibleLines.length > maxLineCount) {
      warnings.push(`Line responsibility (${data.responsibleLines.length}) exceeds recommended for ${data.supervisorLevel} supervisor (${maxLineCount})`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Work Assignment Decision Logic
  static evaluateWorkAssignment(
    supervisor: Supervisor,
    operator: Operator,
    workItem: WorkItem,
    context: {
      currentWorkload: number;
      operatorSkillLevel: string;
      machineAvailability: boolean;
      deadline: Date;
    }
  ): WorkAssignmentDecision {
    const suggestions: string[] = [];
    const approvals: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Check if supervisor has authority over operator
    if (!supervisor.teamMembers.includes(operator.id!)) {
      return {
        canAssign: false,
        reason: 'Operator is not under your supervision',
        alternativeSuggestions: ['Contact operator\'s direct supervisor'],
        requiredApprovals: [],
        riskLevel: 'high'
      };
    }

    // Check operator workload capacity
    if (context.currentWorkload >= operator.maxConcurrentWork) {
      return {
        canAssign: false,
        reason: 'Operator at maximum workload capacity',
        alternativeSuggestions: [
          'Wait for current work completion',
          'Reassign lower priority work',
          'Find alternative operator'
        ],
        requiredApprovals: [],
        riskLevel: 'medium'
      };
    }

    // Skill level compatibility check
    const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const operatorSkillIndex = skillLevels.indexOf(context.operatorSkillLevel);
    const requiredSkillIndex = skillLevels.indexOf(workItem.requiredSkillLevel || 'beginner');

    if (operatorSkillIndex < requiredSkillIndex) {
      riskLevel = 'high';
      suggestions.push('Consider providing additional supervision');
      suggestions.push('Pair with experienced operator for mentoring');
      
      // Junior supervisors cannot assign high-risk work without approval
      if (supervisor.supervisorLevel === 'junior') {
        approvals.push('Senior supervisor approval required for skill mismatch assignments');
      }
    }

    // Deadline pressure analysis
    const hoursToDeadline = (context.deadline.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursToDeadline < 24) {
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
      suggestions.push('Monitor progress closely due to tight deadline');
      
      if (hoursToDeadline < 4) {
        approvals.push('Management approval required for urgent assignments');
      }
    }

    // Machine availability check
    if (!context.machineAvailability) {
      return {
        canAssign: false,
        reason: 'Required machine type not available',
        alternativeSuggestions: [
          'Schedule when machine becomes available',
          'Find operator with alternative machine skills'
        ],
        requiredApprovals: [],
        riskLevel: 'medium'
      };
    }

    // Quality history check for operator
    if (operator.qualityScore < 0.8 && workItem.priority === 'high') {
      riskLevel = 'high';
      suggestions.push('Implement additional quality checks');
      suggestions.push('Consider assigning to higher quality operator');
      
      if (supervisor.supervisorLevel === 'junior') {
        approvals.push('Senior supervisor approval for high-priority work to low-quality operator');
      }
    }

    return {
      canAssign: true,
      alternativeSuggestions: suggestions,
      requiredApprovals: approvals,
      riskLevel
    };
  }

  // Assignment Request Approval Logic
  static evaluateAssignmentRequest(
    request: AssignmentRequest,
    supervisor: Supervisor,
    operator: Operator,
    workItem: WorkItem
  ): ApprovalDecision {
    const riskFactors: string[] = [];
    const validations: string[] = [];
    let requiredLevel: SupervisorLevel = 'junior';

    // Auto-approval criteria for high-performing operators
    const autoApprovalCriteria = {
      minEfficiency: 0.85,
      minQuality: 0.9,
      maxSkillGap: 0, // No skill gap for auto-approval
      maxWorkloadUtilization: 0.8
    };

    const isHighPerformer = operator.averageEfficiency >= autoApprovalCriteria.minEfficiency &&
                            operator.qualityScore >= autoApprovalCriteria.minQuality;

    // Skill level analysis
    const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const operatorSkillIndex = skillLevels.indexOf(operator.skillLevel);
    const requiredSkillIndex = skillLevels.indexOf(workItem.requiredSkillLevel || 'beginner');
    const skillGap = Math.max(0, requiredSkillIndex - operatorSkillIndex);

    if (skillGap > 0) {
      riskFactors.push(`Skill level gap: operator is ${operator.skillLevel}, work requires ${workItem.requiredSkillLevel}`);
      requiredLevel = skillGap > 1 ? 'senior' : 'junior';
      validations.push('Verify operator training records');
    }

    // Work complexity analysis
    if (workItem.complexity > 7) {
      riskFactors.push('High complexity work item');
      validations.push('Ensure operator has handled similar complexity before');
      requiredLevel = 'senior';
    }

    // Workload analysis
    const currentUtilization = (operator.realtimeStatus?.currentWorkItems || 0) / operator.maxConcurrentWork;
    if (currentUtilization > 0.9) {
      riskFactors.push('Operator near maximum capacity');
      validations.push('Confirm operator can handle additional workload');
    }

    // Machine type compatibility
    if (!operator.machineTypes.includes(workItem.machineType)) {
      riskFactors.push('Machine type not in operator certifications');
      requiredLevel = 'senior';
      validations.push('Verify cross-training completion');
    }

    // Priority and deadline pressure
    if (workItem.priority === 'urgent') {
      riskFactors.push('Urgent priority work assignment');
      validations.push('Confirm deadline feasibility');
      
      if (!isHighPerformer) {
        requiredLevel = 'senior';
      }
    }

    // Determine auto-approval eligibility
    const shouldAutoApprove = isHighPerformer && 
                              skillGap === 0 && 
                              currentUtilization <= autoApprovalCriteria.maxWorkloadUtilization &&
                              operator.machineTypes.includes(workItem.machineType) &&
                              workItem.complexity <= 6 &&
                              workItem.priority !== 'urgent' &&
                              supervisor.supervisorLevel !== 'junior';

    let reason = '';
    if (shouldAutoApprove) {
      reason = 'High-performing operator with perfect skill match and optimal workload';
    } else if (riskFactors.length > 0) {
      reason = `Manual review required due to: ${riskFactors.join(', ')}`;
    } else {
      reason = 'Standard approval process required';
    }

    return {
      shouldAutoApprove,
      reason,
      requiredSupervisorLevel: requiredLevel,
      additionalValidations: validations,
      riskFactors
    };
  }

  // Team Productivity Analysis
  static analyzeTeamProductivity(
    supervisor: Supervisor,
    teamOperators: Operator[],
    periodData: {
      completedWork: any[];
      qualityIncidents: any[];
      onTimeDeliveries: number;
      totalDeliveries: number;
    }
  ): TeamProductivityMetrics {
    const recommendations: string[] = [];
    
    // Calculate team efficiency
    const teamEfficiency = teamOperators.reduce((sum, op) => sum + op.averageEfficiency, 0) / teamOperators.length;
    
    // Calculate average quality
    const averageQuality = teamOperators.reduce((sum, op) => sum + op.qualityScore, 0) / teamOperators.length;
    
    // Calculate completion rate
    const completionRate = periodData.completedWork.length > 0 ? 
      periodData.completedWork.filter(work => work.status === 'completed').length / periodData.completedWork.length : 0;
    
    // Calculate on-time delivery rate
    const onTimeDelivery = periodData.totalDeliveries > 0 ? 
      periodData.onTimeDeliveries / periodData.totalDeliveries : 0;

    // Team health score (composite metric)
    const teamHealthScore = (teamEfficiency * 0.3 + averageQuality * 0.3 + completionRate * 0.2 + onTimeDelivery * 0.2) * 100;

    // Generate recommendations based on metrics
    if (teamEfficiency < 0.7) {
      recommendations.push('Implement efficiency improvement training');
      recommendations.push('Review work allocation strategies');
      recommendations.push('Consider process optimization workshops');
    }

    if (averageQuality < 0.85) {
      recommendations.push('Increase quality control measures');
      recommendations.push('Implement peer review processes');
      recommendations.push('Schedule quality training sessions');
    }

    if (onTimeDelivery < 0.9) {
      recommendations.push('Improve deadline management');
      recommendations.push('Implement better work planning');
      recommendations.push('Review resource allocation');
    }

    if (completionRate < 0.8) {
      recommendations.push('Investigate workflow bottlenecks');
      recommendations.push('Review task complexity assignments');
      recommendations.push('Consider team restructuring');
    }

    // Supervisor-specific recommendations based on level
    if (supervisor.supervisorLevel === 'junior' && teamHealthScore < 70) {
      recommendations.push('Seek senior supervisor mentoring');
      recommendations.push('Attend supervisory skill development training');
    }

    if (teamOperators.length > 10 && supervisor.supervisorLevel === 'junior') {
      recommendations.push('Consider team size reduction or promotion to senior level');
    }

    return {
      teamEfficiency,
      averageQuality,
      completionRate,
      onTimeDelivery,
      recommendedActions: recommendations,
      teamHealthScore: Math.round(teamHealthScore)
    };
  }

  // Supervisor Performance Evaluation
  static evaluateSupervisorPerformance(
    supervisor: Supervisor,
    teamMetrics: TeamProductivityMetrics,
    periodData: {
      decisionsMade: number;
      correctDecisions: number;
      escalationsHandled: number;
      teamSatisfactionScore: number;
      trainingSessionsConducted: number;
    }
  ): {
    overallScore: number;
    strengths: string[];
    improvementAreas: string[];
    promotionEligible: boolean;
    nextLevelRequirements: string[];
  } {
    const strengths: string[] = [];
    const improvementAreas: string[] = [];
    const nextLevelRequirements: string[] = [];

    // Decision-making accuracy
    const decisionAccuracy = periodData.correctDecisions / periodData.decisionsMade;
    if (decisionAccuracy > 0.9) {
      strengths.push('Excellent decision-making skills');
    } else if (decisionAccuracy < 0.7) {
      improvementAreas.push('Improve decision-making accuracy through training');
    }

    // Team performance impact
    if (teamMetrics.teamHealthScore > 80) {
      strengths.push('Strong team leadership and performance management');
    } else if (teamMetrics.teamHealthScore < 60) {
      improvementAreas.push('Focus on team productivity improvement');
    }

    // Training and development
    if (periodData.trainingSessionsConducted > 0) {
      strengths.push('Active in team development and training');
    } else {
      improvementAreas.push('Increase focus on team training and development');
    }

    // Team satisfaction
    if (periodData.teamSatisfactionScore > 4.0) {
      strengths.push('High team satisfaction and morale');
    } else if (periodData.teamSatisfactionScore < 3.0) {
      improvementAreas.push('Improve team communication and relationship building');
    }

    // Calculate overall performance score
    const performanceFactors = {
      decisionAccuracy: decisionAccuracy * 25,
      teamHealth: (teamMetrics.teamHealthScore / 100) * 30,
      teamSatisfaction: (periodData.teamSatisfactionScore / 5) * 25,
      development: Math.min(periodData.trainingSessionsConducted * 5, 20)
    };

    const overallScore = Object.values(performanceFactors).reduce((sum, score) => sum + score, 0);

    // Promotion eligibility based on current level
    let promotionEligible = false;
    if (supervisor.supervisorLevel === 'junior' && overallScore >= 75) {
      promotionEligible = true;
      nextLevelRequirements.push('Complete senior supervisor certification');
      nextLevelRequirements.push('Demonstrate team size management (10+ operators)');
      nextLevelRequirements.push('Lead cross-training initiatives');
    } else if (supervisor.supervisorLevel === 'senior' && overallScore >= 85) {
      promotionEligible = true;
      nextLevelRequirements.push('Complete leadership development program');
      nextLevelRequirements.push('Demonstrate multi-line management capability');
      nextLevelRequirements.push('Mentor junior supervisors');
    } else {
      if (overallScore < 60) {
        nextLevelRequirements.push('Improve overall performance score to 60+');
      }
      if (teamMetrics.teamHealthScore < 70) {
        nextLevelRequirements.push('Achieve team health score of 70+');
      }
      if (decisionAccuracy < 0.8) {
        nextLevelRequirements.push('Improve decision accuracy to 80+');
      }
    }

    return {
      overallScore: Math.round(overallScore),
      strengths,
      improvementAreas,
      promotionEligible,
      nextLevelRequirements
    };
  }

  // Escalation Decision Logic
  static shouldEscalateDecision(
    supervisor: Supervisor,
    decision: {
      type: 'work_assignment' | 'quality_issue' | 'disciplinary' | 'resource_allocation';
      impact: 'low' | 'medium' | 'high';
      cost: number;
      affectedOperators: number;
      customerImpact: boolean;
    }
  ): {
    shouldEscalate: boolean;
    reason: string;
    escalateTo: 'senior_supervisor' | 'management' | 'quality_head';
    timeframe: 'immediate' | 'within_hour' | 'within_day';
  } {
    const { type, impact, cost, affectedOperators, customerImpact } = decision;
    
    // Authority limits based on supervisor level
    const authorityLimits = {
      junior: { maxCost: 5000, maxOperators: 3, canHandleCustomerImpact: false },
      senior: { maxCost: 20000, maxOperators: 10, canHandleCustomerImpact: true },
      lead: { maxCost: 50000, maxOperators: 25, canHandleCustomerImpact: true }
    };

    const limits = authorityLimits[supervisor.supervisorLevel];

    // Cost-based escalation
    if (cost > limits.maxCost) {
      return {
        shouldEscalate: true,
        reason: `Cost (₹${cost}) exceeds supervisor authority limit (₹${limits.maxCost})`,
        escalateTo: 'management',
        timeframe: cost > limits.maxCost * 2 ? 'immediate' : 'within_hour'
      };
    }

    // Operator count based escalation
    if (affectedOperators > limits.maxOperators) {
      return {
        shouldEscalate: true,
        reason: `Number of affected operators (${affectedOperators}) exceeds authority limit (${limits.maxOperators})`,
        escalateTo: 'senior_supervisor',
        timeframe: 'within_hour'
      };
    }

    // Customer impact escalation
    if (customerImpact && !limits.canHandleCustomerImpact) {
      return {
        shouldEscalate: true,
        reason: 'Customer impact decisions require higher authority',
        escalateTo: 'management',
        timeframe: 'immediate'
      };
    }

    // High impact quality issues always escalate
    if (type === 'quality_issue' && impact === 'high') {
      return {
        shouldEscalate: true,
        reason: 'High impact quality issues require specialized expertise',
        escalateTo: 'quality_head',
        timeframe: 'immediate'
      };
    }

    // Disciplinary actions for senior operators
    if (type === 'disciplinary' && impact === 'high') {
      return {
        shouldEscalate: true,
        reason: 'Serious disciplinary actions require management approval',
        escalateTo: 'management',
        timeframe: 'within_day'
      };
    }

    return {
      shouldEscalate: false,
      reason: 'Within supervisor authority limits',
      escalateTo: 'senior_supervisor', // Default, not used when shouldEscalate is false
      timeframe: 'immediate' // Default, not used when shouldEscalate is false
    };
  }

  // Quality Control Decisions
  static evaluateQualityIssue(
    supervisor: Supervisor,
    qualityIssue: {
      bundleId: string;
      operatorId: string;
      defectType: string;
      severity: 'minor' | 'major' | 'critical';
      affectedPieces: number;
      totalPieces: number;
      customerOrder: boolean;
    }
  ): {
    action: 'rework' | 'scrap' | 'accept_with_discount' | 'escalate';
    reasoning: string;
    paymentAction: 'full_pay' | 'partial_pay' | 'hold_payment' | 'no_pay';
    additionalSteps: string[];
  } {
    const { severity, affectedPieces, totalPieces, customerOrder, defectType } = qualityIssue;
    const defectRate = affectedPieces / totalPieces;
    const additionalSteps: string[] = [];

    // Critical defects always require escalation
    if (severity === 'critical') {
      additionalSteps.push('Immediate supervisor notification');
      additionalSteps.push('Document root cause analysis');
      additionalSteps.push('Implement corrective actions');
      
      return {
        action: 'escalate',
        reasoning: 'Critical quality issues require management decision',
        paymentAction: 'hold_payment',
        additionalSteps
      };
    }

    // Major defects with high impact
    if (severity === 'major' && (defectRate > 0.1 || customerOrder)) {
      if (defectType.includes('measurement') || defectType.includes('size')) {
        // Size/measurement issues usually require scrapping
        additionalSteps.push('Quality team verification');
        additionalSteps.push('Check measurement tools calibration');
        
        return {
          action: 'scrap',
          reasoning: 'Size/measurement defects cannot be reworked effectively',
          paymentAction: 'no_pay',
          additionalSteps
        };
      } else {
        // Other major defects can often be reworked
        additionalSteps.push('Assign to experienced operator for rework');
        additionalSteps.push('Additional quality inspection after rework');
        
        return {
          action: 'rework',
          reasoning: 'Major defects can be corrected through rework',
          paymentAction: 'partial_pay',
          additionalSteps
        };
      }
    }

    // Minor defects
    if (severity === 'minor') {
      if (defectRate < 0.05) {
        // Low defect rate, acceptable quality
        return {
          action: 'accept_with_discount',
          reasoning: 'Minor defects with low impact rate',
          paymentAction: 'partial_pay',
          additionalSteps: ['Note quality concern in operator record']
        };
      } else {
        // Higher minor defect rate requires rework
        additionalSteps.push('Provide quality feedback to operator');
        additionalSteps.push('Monitor next few bundles closely');
        
        return {
          action: 'rework',
          reasoning: 'High rate of minor defects needs correction',
          paymentAction: 'partial_pay',
          additionalSteps
        };
      }
    }

    // Default case - should not reach here
    return {
      action: 'escalate',
      reasoning: 'Unable to determine appropriate action',
      paymentAction: 'hold_payment',
      additionalSteps: ['Require senior supervisor review']
    };
  }
}

// Export business logic utilities
export const supervisorBusinessLogic = {
  validateSupervisorCreation: SupervisorBusinessLogic.validateSupervisorCreation,
  evaluateWorkAssignment: SupervisorBusinessLogic.evaluateWorkAssignment,
  evaluateAssignmentRequest: SupervisorBusinessLogic.evaluateAssignmentRequest,
  analyzeTeamProductivity: SupervisorBusinessLogic.analyzeTeamProductivity,
  evaluateSupervisorPerformance: SupervisorBusinessLogic.evaluateSupervisorPerformance,
  shouldEscalateDecision: SupervisorBusinessLogic.shouldEscalateDecision,
  evaluateQualityIssue: SupervisorBusinessLogic.evaluateQualityIssue
};