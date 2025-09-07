// Production Tracking Business Logic
// Handles complex business rules for work tracking, breaks, and performance calculations

import type {
  WorkAssignment,
  WorkSession,
  Break,
  QualityIssue,
  OperatorSummary
} from '../types';

export interface ProductionRule {
  id: string;
  name: string;
  type: 'efficiency' | 'quality' | 'break' | 'overtime' | 'safety';
  condition: (context: ProductionContext) => boolean;
  action: (context: ProductionContext) => ProductionAction;
  priority: number;
  isActive: boolean;
}

export interface ProductionContext {
  operator: OperatorSummary;
  assignment: WorkAssignment;
  currentSession: WorkSession;
  breaks: Break[];
  qualityIssues: QualityIssue[];
  shift: {
    start: Date;
    end: Date;
    type: 'morning' | 'afternoon' | 'night';
  };
}

export interface ProductionAction {
  type: 'alert' | 'auto_break' | 'efficiency_warning' | 'quality_check' | 'supervisor_notification';
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  autoExecute: boolean;
  metadata?: any;
}

export interface ProductionMetrics {
  efficiency: {
    current: number;
    target: number;
    trend: 'improving' | 'stable' | 'declining';
    factors: EfficiencyFactor[];
  };
  quality: {
    current: number;
    target: number;
    issues: number;
    severity: 'good' | 'warning' | 'critical';
  };
  productivity: {
    piecesPerHour: number;
    targetPiecesPerHour: number;
    variance: number;
  };
  breaks: {
    total: number;
    duration: number;
    compliance: boolean;
    overdue: boolean;
  };
}

export interface EfficiencyFactor {
  factor: string;
  impact: number; // -1 to 1
  description: string;
}

export interface BreakCompliance {
  required: Break[];
  taken: Break[];
  missing: Break[];
  excess: Break[];
  compliance: number; // 0-1
}

export class ProductionTrackingLogic {
  private rules: ProductionRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  // Main business logic evaluation
  evaluateProduction(context: ProductionContext): {
    metrics: ProductionMetrics;
    actions: ProductionAction[];
    compliance: BreakCompliance;
    recommendations: string[];
  } {
    const metrics = this.calculateProductionMetrics(context);
    const compliance = this.evaluateBreakCompliance(context);
    const actions = this.evaluateRules(context);
    const recommendations = this.generateRecommendations(context, metrics);

    return {
      metrics,
      actions,
      compliance,
      recommendations
    };
  }

  // Calculate comprehensive production metrics
  private calculateProductionMetrics(context: ProductionContext): ProductionMetrics {
    const { operator, assignment, currentSession, breaks } = context;

    // Efficiency calculation
    const efficiency = this.calculateEfficiency(context);
    const efficiencyTrend = this.analyzeEfficiencyTrend(operator);
    const efficiencyFactors = this.identifyEfficiencyFactors(context);

    // Quality metrics
    const quality = this.calculateQualityMetrics(context);

    // Productivity metrics
    const productivity = this.calculateProductivityMetrics(context);

    // Break analysis
    const breakAnalysis = this.analyzeBreaks(context);

    return {
      efficiency: {
        current: efficiency,
        target: this.getEfficiencyTarget(operator),
        trend: efficiencyTrend,
        factors: efficiencyFactors
      },
      quality: {
        current: quality.score,
        target: 0.95,
        issues: quality.issues,
        severity: quality.severity
      },
      productivity,
      breaks: breakAnalysis
    };
  }

  // Calculate current efficiency with multiple factors
  private calculateEfficiency(context: ProductionContext): number {
    const { assignment, currentSession } = context;
    
    if (!currentSession.piecesCompleted || currentSession.totalDuration === 0) {
      return 0;
    }

    // Base efficiency: actual vs expected production rate
    const expectedRate = assignment.targetPieces / (assignment.estimatedDuration || 1);
    const actualRate = currentSession.piecesCompleted / (currentSession.totalDuration / 60);
    const baseEfficiency = actualRate / expectedRate;

    // Apply adjustment factors
    const adjustmentFactors = this.getEfficiencyAdjustments(context);
    const adjustedEfficiency = adjustmentFactors.reduce(
      (eff, factor) => eff * (1 + factor.impact),
      baseEfficiency
    );

    return Math.max(0, Math.min(1.5, adjustedEfficiency)); // Cap between 0 and 150%
  }

  // Identify factors affecting efficiency
  private identifyEfficiencyFactors(context: ProductionContext): EfficiencyFactor[] {
    const factors: EfficiencyFactor[] = [];
    const { operator, currentSession, breaks } = context;

    // Machine familiarity factor
    const isPrimaryMachine = operator.primaryMachine === context.assignment.machineType;
    factors.push({
      factor: 'Machine Familiarity',
      impact: isPrimaryMachine ? 0.1 : -0.05,
      description: isPrimaryMachine ? 'Working on primary machine' : 'Working on secondary machine'
    });

    // Break pattern factor
    const totalBreakTime = breaks.reduce((sum, b) => sum + (b.duration || 0), 0);
    const workDuration = currentSession.totalDuration - totalBreakTime;
    const breakRatio = totalBreakTime / workDuration;
    
    if (breakRatio > 0.2) {
      factors.push({
        factor: 'Excessive Breaks',
        impact: -0.15,
        description: 'Too many or too long breaks'
      });
    } else if (breakRatio < 0.05) {
      factors.push({
        factor: 'Insufficient Breaks',
        impact: -0.1,
        description: 'May be overworked, needs proper breaks'
      });
    }

    // Time of day factor
    const hour = new Date().getHours();
    if (hour >= 14 && hour <= 16) { // Post-lunch dip
      factors.push({
        factor: 'Post-lunch Period',
        impact: -0.08,
        description: 'Natural productivity decline after lunch'
      });
    }

    // Quality issues factor
    if (context.qualityIssues.length > 0) {
      factors.push({
        factor: 'Quality Issues',
        impact: -0.2,
        description: 'Quality problems affecting productivity'
      });
    }

    return factors;
  }

  // Get efficiency adjustment factors
  private getEfficiencyAdjustments(context: ProductionContext): EfficiencyFactor[] {
    return this.identifyEfficiencyFactors(context);
  }

  // Analyze efficiency trend
  private analyzeEfficiencyTrend(operator: OperatorSummary): 'improving' | 'stable' | 'declining' {
    // This would analyze historical data
    // For now, simple logic based on current vs average efficiency
    const currentEfficiency = operator.efficiency;
    const avgEfficiency = 0.8; // This would be historical average

    if (currentEfficiency > avgEfficiency + 0.05) return 'improving';
    if (currentEfficiency < avgEfficiency - 0.05) return 'declining';
    return 'stable';
  }

  // Calculate quality metrics
  private calculateQualityMetrics(context: ProductionContext): {
    score: number;
    issues: number;
    severity: 'good' | 'warning' | 'critical';
  } {
    const { qualityIssues, currentSession } = context;
    
    const totalPieces = currentSession.piecesCompleted;
    const defectivePieces = qualityIssues.reduce((sum, issue) => sum + issue.affectedPieces, 0);
    
    const qualityScore = totalPieces > 0 ? 1 - (defectivePieces / totalPieces) : 1;
    
    let severity: 'good' | 'warning' | 'critical' = 'good';
    if (qualityScore < 0.8) severity = 'critical';
    else if (qualityScore < 0.9) severity = 'warning';

    return {
      score: qualityScore,
      issues: qualityIssues.length,
      severity
    };
  }

  // Calculate productivity metrics
  private calculateProductivityMetrics(context: ProductionContext): {
    piecesPerHour: number;
    targetPiecesPerHour: number;
    variance: number;
  } {
    const { assignment, currentSession } = context;
    
    const workingHours = currentSession.totalDuration / 3600;
    const piecesPerHour = workingHours > 0 ? currentSession.piecesCompleted / workingHours : 0;
    const targetPiecesPerHour = assignment.targetPieces / ((assignment.estimatedDuration || 60) / 60);
    const variance = ((piecesPerHour - targetPiecesPerHour) / targetPiecesPerHour) * 100;

    return {
      piecesPerHour,
      targetPiecesPerHour,
      variance
    };
  }

  // Analyze break patterns
  private analyzeBreaks(context: ProductionContext): {
    total: number;
    duration: number;
    compliance: boolean;
    overdue: boolean;
  } {
    const { breaks, shift } = context;
    
    const totalBreaks = breaks.length;
    const totalDuration = breaks.reduce((sum, b) => sum + (b.duration || 0), 0);
    
    // Break compliance rules
    const workingHours = (shift.end.getTime() - shift.start.getTime()) / (1000 * 60 * 60);
    const requiredBreaks = this.getRequiredBreaks(workingHours);
    const compliance = this.checkBreakComplianceInternal(breaks, requiredBreaks);
    
    // Check if overdue for break
    const lastBreak = breaks[breaks.length - 1];
    const timeSinceLastBreak = lastBreak 
      ? (Date.now() - (lastBreak.endTime?.getTime() || lastBreak.startTime.getTime())) / (1000 * 60)
      : 0;
    const overdue = timeSinceLastBreak > 120; // 2 hours without break

    return {
      total: totalBreaks,
      duration: totalDuration,
      compliance,
      overdue
    };
  }

  // Public method for simple break compliance check (used by BreakManagementSystem)
  checkBreakCompliance(params: {
    workDuration: number;
    breaks: Break[];
    sessionStartTime: Date;
    operatorId: string;
  }): boolean {
    try {
      const { workDuration, breaks } = params;
      
      // Calculate working hours from duration
      const workingHours = workDuration / (1000 * 60 * 60);
      
      // Get required breaks for this duration
      const requiredBreaks = this.getRequiredBreaks(workingHours);
      
      // Check compliance using private method
      return this.checkBreakComplianceInternal(breaks || [], requiredBreaks || []);
    } catch (error) {
      console.error('Error in checkBreakCompliance:', error);
      return false;
    }
  }

  // Evaluate break compliance
  evaluateBreakCompliance(context: ProductionContext): BreakCompliance {
    const { breaks, shift } = context;
    
    const workingHours = (shift.end.getTime() - shift.start.getTime()) / (1000 * 60 * 60);
    const required = this.getRequiredBreaks(workingHours);
    const taken = breaks;
    
    const missing = required.filter(req => 
      !taken.some(t => t.breakType === req.breakType)
    );
    
    const excess = taken.filter(t => 
      !required.some(req => req.breakType === t.breakType)
    );

    const compliance = Math.max(0, 1 - (missing.length * 0.2) - (excess.length * 0.1));

    return {
      required,
      taken,
      missing,
      excess,
      compliance
    };
  }

  // Get required breaks based on working hours
  private getRequiredBreaks(workingHours: number): Break[] {
    const required: Partial<Break>[] = [];
    
    if (workingHours >= 4) {
      required.push({
        breakType: 'tea',
        duration: 15,
        isPaid: true,
        reason: 'Morning tea break (required)'
      });
    }
    
    if (workingHours >= 6) {
      required.push({
        breakType: 'lunch',
        duration: 60,
        isPaid: false,
        reason: 'Lunch break (required)'
      });
    }
    
    if (workingHours >= 8) {
      required.push({
        breakType: 'tea',
        duration: 15,
        isPaid: true,
        reason: 'Afternoon tea break (required)'
      });
    }

    return required as Break[];
  }

  // Check break compliance (private helper method)
  private checkBreakComplianceInternal(actual: Break[], required: Break[]): boolean {
    if (!required || !Array.isArray(required)) {
      console.warn('checkBreakCompliance: required breaks array is undefined or invalid');
      return true; // Return true to avoid blocking when required breaks are not defined
    }
    
    if (!actual || !Array.isArray(actual)) {
      console.warn('checkBreakCompliance: actual breaks array is undefined or invalid');
      return false;
    }
    
    return required.every(req => 
      actual.some(act => act.breakType === req.breakType)
    );
  }

  // Evaluate business rules
  private evaluateRules(context: ProductionContext): ProductionAction[] {
    const actions: ProductionAction[] = [];

    this.rules
      .filter(rule => rule.isActive)
      .sort((a, b) => b.priority - a.priority)
      .forEach(rule => {
        try {
          if (rule.condition(context)) {
            const action = rule.action(context);
            actions.push(action);
          }
        } catch (error) {
          console.error(`Rule evaluation failed for ${rule.name}:`, error);
        }
      });

    return actions;
  }

  // Generate recommendations
  private generateRecommendations(
    context: ProductionContext,
    metrics: ProductionMetrics
  ): string[] {
    const recommendations: string[] = [];

    // Efficiency recommendations
    if (metrics.efficiency.current < metrics.efficiency.target) {
      recommendations.push('Consider reviewing work technique to improve efficiency');
      
      if (metrics.efficiency.factors.some(f => f.factor === 'Machine Familiarity' && f.impact < 0)) {
        recommendations.push('Request additional training on this machine type');
      }
    }

    // Quality recommendations
    if (metrics.quality.severity === 'warning') {
      recommendations.push('Focus on quality control - slow down if necessary');
    } else if (metrics.quality.severity === 'critical') {
      recommendations.push('Stop work and consult supervisor about quality issues');
    }

    // Break recommendations
    if (metrics.breaks.overdue) {
      recommendations.push('Take a break - you\'ve been working for over 2 hours');
    } else if (!metrics.breaks.compliance) {
      recommendations.push('Ensure you take all required breaks for optimal performance');
    }

    // Productivity recommendations
    if (metrics.productivity.variance < -20) {
      recommendations.push('Consider breaking down the work into smaller tasks');
    } else if (metrics.productivity.variance > 20) {
      recommendations.push('Great work! Consider helping other team members');
    }

    return recommendations;
  }

  // Initialize default business rules
  private initializeDefaultRules(): void {
    this.rules = [
      // Efficiency rules
      {
        id: 'low_efficiency_alert',
        name: 'Low Efficiency Alert',
        type: 'efficiency',
        condition: (ctx) => ctx.currentSession.efficiency < 0.6,
        action: (ctx) => ({
          type: 'efficiency_warning',
          message: `Efficiency is ${Math.round(ctx.currentSession.efficiency * 100)}% - below target`,
          severity: 'warning',
          autoExecute: true
        }),
        priority: 80,
        isActive: true
      },

      // Break rules
      {
        id: 'mandatory_break_overdue',
        name: 'Mandatory Break Overdue',
        type: 'break',
        condition: (ctx) => {
          const lastBreak = ctx.breaks[ctx.breaks.length - 1];
          const timeSinceBreak = lastBreak 
            ? (Date.now() - (lastBreak.endTime?.getTime() || lastBreak.startTime.getTime())) / (1000 * 60)
            : ctx.currentSession.totalDuration / 60;
          return timeSinceBreak > 120; // 2 hours
        },
        action: () => ({
          type: 'auto_break',
          message: 'Mandatory break time - you\'ve been working for over 2 hours',
          severity: 'warning',
          autoExecute: false
        }),
        priority: 90,
        isActive: true
      },

      // Quality rules
      {
        id: 'quality_issues_critical',
        name: 'Critical Quality Issues',
        type: 'quality',
        condition: (ctx) => ctx.qualityIssues.some(issue => issue.severity === 'critical'),
        action: () => ({
          type: 'supervisor_notification',
          message: 'Critical quality issues detected - supervisor notification sent',
          severity: 'critical',
          autoExecute: true
        }),
        priority: 100,
        isActive: true
      },

      // Overtime rules
      {
        id: 'overtime_warning',
        name: 'Overtime Warning',
        type: 'overtime',
        condition: (ctx) => {
          const shiftDuration = (ctx.shift.end.getTime() - ctx.shift.start.getTime()) / (1000 * 60 * 60);
          const worked = ctx.currentSession.totalDuration / 3600;
          return worked > shiftDuration * 0.9; // 90% of shift completed
        },
        action: (ctx) => ({
          type: 'alert',
          message: 'Approaching end of shift - prepare to complete current work',
          severity: 'info',
          autoExecute: true
        }),
        priority: 70,
        isActive: true
      }
    ];
  }

  // Get efficiency target for operator
  private getEfficiencyTarget(operator: OperatorSummary): number {
    const skillTargets = {
      'beginner': 0.70,
      'intermediate': 0.80,
      'advanced': 0.85,
      'expert': 0.90
    };

    return skillTargets[operator.skillLevel as keyof typeof skillTargets] || 0.75;
  }

  // Calculate piece rate earnings
  calculateEarnings(
    assignment: WorkAssignment,
    completedPieces: number,
    efficiency: number,
    quality: number
  ): {
    baseEarnings: number;
    efficiencyBonus: number;
    qualityBonus: number;
    penalty: number;
    totalEarnings: number;
  } {
    const baseRate = assignment.workItem?.ratePerPiece || 0;
    const baseEarnings = completedPieces * baseRate;

    // Efficiency bonus (5% for efficiency > 90%)
    const efficiencyBonus = efficiency > 0.9 ? baseEarnings * 0.05 : 0;

    // Quality bonus (3% for quality > 95%)
    const qualityBonus = quality > 0.95 ? baseEarnings * 0.03 : 0;

    // Quality penalty (10% for quality < 80%)
    const penalty = quality < 0.8 ? baseEarnings * 0.1 : 0;

    const totalEarnings = baseEarnings + efficiencyBonus + qualityBonus - penalty;

    return {
      baseEarnings,
      efficiencyBonus,
      qualityBonus,
      penalty,
      totalEarnings: Math.max(0, totalEarnings)
    };
  }

  // Validate work session data
  validateWorkSession(session: Partial<WorkSession>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!session.assignmentId) {
      errors.push('Assignment ID is required');
    }

    if (!session.operatorId) {
      errors.push('Operator ID is required');
    }

    if (session.piecesCompleted && session.piecesCompleted < 0) {
      errors.push('Pieces completed cannot be negative');
    }

    if (session.efficiency && (session.efficiency < 0 || session.efficiency > 2)) {
      warnings.push('Efficiency seems unusually high or low');
    }

    if (session.totalDuration && session.totalDuration > 12 * 60 * 60) { // 12 hours
      warnings.push('Work session exceeds 12 hours');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Add custom business rule
  addRule(rule: ProductionRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  // Remove business rule
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }

  // Get all active rules
  getActiveRules(): ProductionRule[] {
    return this.rules.filter(rule => rule.isActive);
  }
}

// Singleton instance
export const productionTrackingLogic = new ProductionTrackingLogic();