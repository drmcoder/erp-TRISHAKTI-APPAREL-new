// Smart Assignment Service - Decision Support (NOT Auto Assignment)
// Provides data and insights to help supervisors make better assignment decisions
// Focus: Information + Analysis, NOT automated decisions

interface WorkAnalysis {
  workItem: WorkItem;
  complexity: 'simple' | 'moderate' | 'complex' | 'expert-only';
  riskFactors: string[];
  timeConstraints: {
    isUrgent: boolean;
    deadline: Date;
    estimatedHours: number;
  };
  skillRequirements: {
    minimumLevel: number;
    preferredLevel: number;
    criticalSkills: string[];
  };
}

interface OperatorAnalysis {
  operator: Operator;
  suitability: 'excellent' | 'good' | 'acceptable' | 'poor' | 'not-suitable';
  matchScore: number; // 0-100
  strengths: string[];
  concerns: string[];
  recommendation: string;
  riskAssessment: {
    qualityRisk: 'low' | 'medium' | 'high';
    timeRisk: 'low' | 'medium' | 'high';
    overloadRisk: 'low' | 'medium' | 'high';
  };
  currentContext: {
    workload: number;
    recentPerformance: string;
    availability: string;
    mood?: string; // if trackable
  };
}

interface AssignmentRecommendation {
  workAnalysis: WorkAnalysis;
  operatorOptions: OperatorAnalysis[];
  bestOptions: OperatorAnalysis[];
  warningFlags: string[];
  supervisorNotes: string[];
  alternativeStrategies?: string[];
}

export class SmartAssignmentService {
  private operators: Map<string, Operator> = new Map();
  private workHistory: Map<string, any[]> = new Map();
  private performanceData: Map<string, any> = new Map();

  /**
   * Analyze work item to understand complexity and requirements
   */
  analyzeWork(workItem: WorkItem): WorkAnalysis {
    // Real analysis based on work characteristics
    const complexity = this.assessComplexity(workItem);
    const riskFactors = this.identifyRiskFactors(workItem);
    const timeConstraints = this.assessTimeConstraints(workItem);
    const skillRequirements = this.determineSkillRequirements(workItem);

    return {
      workItem,
      complexity,
      riskFactors,
      timeConstraints,
      skillRequirements
    };
  }

  /**
   * Analyze each operator's suitability for specific work
   */
  analyzeOperatorFit(workAnalysis: WorkAnalysis, operator: Operator): OperatorAnalysis {
    const matchScore = this.calculateMatchScore(workAnalysis, operator);
    const suitability = this.determineSuitability(matchScore, workAnalysis, operator);
    const strengths = this.identifyStrengths(workAnalysis, operator);
    const concerns = this.identifyConcerns(workAnalysis, operator);
    const recommendation = this.generateRecommendation(workAnalysis, operator, matchScore);
    const riskAssessment = this.assessRisks(workAnalysis, operator);
    const currentContext = this.getOperatorContext(operator);

    return {
      operator,
      suitability,
      matchScore,
      strengths,
      concerns,
      recommendation,
      riskAssessment,
      currentContext
    };
  }

  /**
   * Get comprehensive assignment recommendations
   */
  getAssignmentRecommendations(workItem: WorkItem, availableOperators: Operator[]): AssignmentRecommendation {
    const workAnalysis = this.analyzeWork(workItem);
    
    const operatorOptions = availableOperators.map(operator => 
      this.analyzeOperatorFit(workAnalysis, operator)
    );

    // Sort by match score and filter best options
    operatorOptions.sort((a, b) => b.matchScore - a.matchScore);
    const bestOptions = operatorOptions.filter(op => op.suitability === 'excellent' || op.suitability === 'good');

    const warningFlags = this.generateWarningFlags(workAnalysis, operatorOptions);
    const supervisorNotes = this.generateSupervisorNotes(workAnalysis, operatorOptions);
    const alternativeStrategies = this.suggestAlternatives(workAnalysis, operatorOptions);

    return {
      workAnalysis,
      operatorOptions,
      bestOptions,
      warningFlags,
      supervisorNotes,
      alternativeStrategies
    };
  }

  private assessComplexity(workItem: WorkItem): 'simple' | 'moderate' | 'complex' | 'expert-only' {
    // Real complexity assessment based on operation type and difficulty
    if (workItem.difficulty >= 5) return 'expert-only';
    if (workItem.difficulty >= 4) return 'complex';
    if (workItem.difficulty >= 3) return 'moderate';
    return 'simple';
  }

  private identifyRiskFactors(workItem: WorkItem): string[] {
    const risks: string[] = [];
    
    if (workItem.priority === 'urgent') {
      risks.push('Tight deadline - quality vs speed pressure');
    }
    
    if (workItem.pieces > 200) {
      risks.push('Large batch - consistency important');
    }
    
    if (workItem.difficulty >= 4) {
      risks.push('High skill requirement - mistakes costly');
    }
    
    if (workItem.operationType === 'quality') {
      risks.push('Quality control - cannot afford errors');
    }

    return risks;
  }

  private assessTimeConstraints(workItem: WorkItem): any {
    const now = new Date();
    const deadline = new Date(workItem.deadline);
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return {
      isUrgent: hoursUntilDeadline < 8, // Less than one work day
      deadline,
      estimatedHours: workItem.estimatedHours
    };
  }

  private determineSkillRequirements(workItem: WorkItem): any {
    return {
      minimumLevel: Math.max(1, workItem.difficulty - 1),
      preferredLevel: workItem.difficulty,
      criticalSkills: workItem.requiredSkills
    };
  }

  private calculateMatchScore(workAnalysis: WorkAnalysis, operator: Operator): number {
    let score = 0;
    
    // Skill match (40% weight)
    const operatorSkill = operator.skills[workAnalysis.workItem.operationType] || 0;
    const skillMatch = Math.min(operatorSkill / workAnalysis.skillRequirements.preferredLevel, 1) * 40;
    score += skillMatch;
    
    // Availability (20% weight) 
    const availabilityScore = (100 - operator.currentWorkload) / 100 * 20;
    score += availabilityScore;
    
    // Quality track record (20% weight)
    score += (operator.performance.quality / 100) * 20;
    
    // Efficiency (10% weight)
    score += Math.min(operator.efficiency / 100, 1.5) * 10; // Cap at 150%
    
    // Experience bonus (10% weight)
    const hasRecentExperience = operator.recentWork?.includes(workAnalysis.workItem.operation);
    if (hasRecentExperience) score += 10;
    
    return Math.round(score);
  }

  private determineSuitability(score: number, workAnalysis: WorkAnalysis, operator: Operator): any {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'acceptable';
    if (score >= 20) return 'poor';
    return 'not-suitable';
  }

  private identifyStrengths(workAnalysis: WorkAnalysis, operator: Operator): string[] {
    const strengths: string[] = [];
    
    const operatorSkill = operator.skills[workAnalysis.workItem.operationType] || 0;
    if (operatorSkill >= workAnalysis.skillRequirements.preferredLevel) {
      strengths.push('Skill level matches requirements perfectly');
    }
    
    if (operator.currentWorkload < 50) {
      strengths.push('Good availability - can focus on quality');
    }
    
    if (operator.performance.quality >= 95) {
      strengths.push('Excellent quality track record');
    }
    
    if (operator.efficiency >= 120) {
      strengths.push('High efficiency - will complete faster');
    }
    
    if (operator.recentWork?.includes(workAnalysis.workItem.operation)) {
      strengths.push('Recent experience with this exact operation');
    }

    return strengths;
  }

  private identifyConcerns(workAnalysis: WorkAnalysis, operator: Operator): string[] {
    const concerns: string[] = [];
    
    const operatorSkill = operator.skills[workAnalysis.workItem.operationType] || 0;
    if (operatorSkill < workAnalysis.skillRequirements.minimumLevel) {
      concerns.push('Skill level below minimum requirement');
    }
    
    if (operator.currentWorkload > 80) {
      concerns.push('Currently overloaded - may rush the work');
    }
    
    if (operator.performance.quality < 85) {
      concerns.push('Quality scores below standard');
    }
    
    if (workAnalysis.timeConstraints.isUrgent && operator.efficiency < 100) {
      concerns.push('Urgent deadline but operator works slower than average');
    }

    return concerns;
  }

  private generateRecommendation(workAnalysis: WorkAnalysis, operator: Operator, score: number): string {
    if (score >= 80) {
      return `Excellent choice! ${operator.name} has the right skills and availability for this work.`;
    } else if (score >= 60) {
      return `Good option. ${operator.name} can handle this work well with proper monitoring.`;
    } else if (score >= 40) {
      return `Acceptable if no better options. Consider providing extra support or guidance.`;
    } else {
      return `Not recommended. High risk of quality issues or delays.`;
    }
  }

  private assessRisks(workAnalysis: WorkAnalysis, operator: Operator): any {
    return {
      qualityRisk: operator.performance.quality < 85 ? 'high' : 
                   operator.performance.quality < 90 ? 'medium' : 'low',
      timeRisk: workAnalysis.timeConstraints.isUrgent && operator.efficiency < 100 ? 'high' :
                operator.currentWorkload > 80 ? 'medium' : 'low',
      overloadRisk: operator.currentWorkload > 90 ? 'high' :
                    operator.currentWorkload > 70 ? 'medium' : 'low'
    };
  }

  private getOperatorContext(operator: Operator): any {
    return {
      workload: operator.currentWorkload,
      recentPerformance: operator.performance.quality >= 90 ? 'Good' : 'Needs attention',
      availability: operator.availability,
      // Could add mood tracking, health status, etc.
    };
  }

  private generateWarningFlags(workAnalysis: WorkAnalysis, operatorOptions: OperatorAnalysis[]): string[] {
    const warnings: string[] = [];
    
    const suitableOperators = operatorOptions.filter(op => 
      op.suitability === 'excellent' || op.suitability === 'good'
    );
    
    if (suitableOperators.length === 0) {
      warnings.push('⚠️ No operators with good skill match available');
    }
    
    if (workAnalysis.timeConstraints.isUrgent) {
      warnings.push('🕐 Urgent deadline - consider overtime or priority reassignment');
    }
    
    if (workAnalysis.complexity === 'expert-only') {
      warnings.push('👨‍🎓 Expert-level work - only assign to most skilled operators');
    }

    return warnings;
  }

  private generateSupervisorNotes(workAnalysis: WorkAnalysis, operatorOptions: OperatorAnalysis[]): string[] {
    const notes: string[] = [];
    
    if (workAnalysis.workItem.priority === 'urgent') {
      notes.push('💡 Consider checking progress hourly for urgent work');
    }
    
    if (workAnalysis.workItem.difficulty >= 4) {
      notes.push('💡 Provide quality check midway through complex work');
    }
    
    const overloadedOperators = operatorOptions.filter(op => op.currentContext.workload > 80);
    if (overloadedOperators.length > 0) {
      notes.push('💡 Several operators overloaded - consider redistributing existing work');
    }

    return notes;
  }

  private suggestAlternatives(workAnalysis: WorkAnalysis, operatorOptions: OperatorAnalysis[]): string[] {
    const alternatives: string[] = [];
    
    const goodOptions = operatorOptions.filter(op => op.suitability === 'good' || op.suitability === 'excellent');
    
    if (goodOptions.length === 0) {
      alternatives.push('Split work between 2 operators with supervision');
      alternatives.push('Wait for skilled operator to become available');
      alternatives.push('Assign to best available with extra quality checks');
    }
    
    if (workAnalysis.timeConstraints.isUrgent) {
      alternatives.push('Consider overtime assignment');
      alternatives.push('Reassign non-urgent work to free up skilled operator');
    }

    return alternatives;
  }

  /**
   * Record assignment outcome for learning
   */
  recordAssignmentOutcome(workId: string, operatorId: string, outcome: {
    completedOnTime: boolean;
    qualityScore: number;
    actualHours: number;
    supervisorRating: number;
    issues?: string[];
  }): void {
    // Store for future decision-making improvements
    const record = {
      workId,
      operatorId,
      outcome,
      timestamp: new Date()
    };
    
    // This would help refine the matching algorithm over time
    console.log('📊 Recording assignment outcome for learning:', record);
  }
}

// Singleton instance
export const smartAssignmentService = new SmartAssignmentService();