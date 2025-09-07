import type { WorkItem, Operator, WorkAssignmentRecommendation, SkillMatch, WorkloadAnalysis } from '@/types/work-assignment-types';
import { format, differenceInHours, addHours } from 'date-fns';

export interface RecommendationContext {
  operator: Operator;
  workItem: WorkItem;
  currentWorkload: WorkloadAnalysis;
  historicalPerformance: OperatorPerformance;
  machinePriority: MachinePriority;
}

export interface OperatorPerformance {
  operatorId: string;
  averageCompletionTime: number;
  qualityScore: number;
  efficiencyRating: number;
  recentDefectRate: number;
  completionRate: number;
  specialtyBonus: number;
  workTypeExperience: { [workType: string]: number };
}

export interface MachinePriority {
  workType: string;
  requiredMachines: string[];
  preferredMachines: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface RecommendationWeights {
  skillMatch: number;          // 35%
  workloadBalance: number;     // 20%
  qualityHistory: number;      // 20%
  efficiency: number;          // 15%
  machineCompatibility: number; // 10%
}

const DEFAULT_WEIGHTS: RecommendationWeights = {
  skillMatch: 0.35,
  workloadBalance: 0.20,
  qualityHistory: 0.20,
  efficiency: 0.15,
  machineCompatibility: 0.10
};

// Machine compatibility matrix
const MACHINE_COMPATIBILITY = {
  'overlock': ['overlock', 'ओभरलक', 'Overlock', 'OVERLOCK'],
  'flatlock': ['flatlock', 'फ्ल्यालक', 'Flatlock', 'FLATLOCK'],
  'single_needle': ['singleNeedle', 'single_needle', 'एकल सुई', 'Single Needle'],
  'buttonhole': ['buttonhole', 'बटनहोल', 'Buttonhole', 'BUTTONHOLE'],
  'button_attach': ['buttonAttach', 'button_attach', 'बटन जोड्ने'],
  'iron_press': ['iron', 'pressing', 'इस्त्री प्रेस'],
  'cutting': ['cutting', 'काट्ने मेसिन'],
  'embroidery': ['embroidery', 'कसिदाकारी मेसिन'],
  'manual': ['manual', 'हस्तकला काम'],
  'quality_check': ['quality', 'inspection', 'गुणस्तर जाँच']
};

// Skill level requirements for different work types
const WORK_TYPE_SKILL_REQUIREMENTS = {
  'cutting': { minExperience: 6, skillLevel: 'intermediate' },
  'overlock': { minExperience: 3, skillLevel: 'beginner' },
  'flatlock': { minExperience: 4, skillLevel: 'intermediate' },
  'buttonhole': { minExperience: 8, skillLevel: 'advanced' },
  'embroidery': { minExperience: 12, skillLevel: 'expert' },
  'quality_check': { minExperience: 24, skillLevel: 'expert' },
  'finishing': { minExperience: 6, skillLevel: 'intermediate' },
  'pressing': { minExperience: 2, skillLevel: 'beginner' }
};

export class AIRecommendationEngine {
  private weights: RecommendationWeights;
  
  constructor(customWeights?: Partial<RecommendationWeights>) {
    this.weights = { ...DEFAULT_WEIGHTS, ...customWeights };
  }

  /**
   * Generate AI-powered work assignment recommendations
   */
  public generateRecommendations(
    workItem: WorkItem,
    availableOperators: Operator[],
    performanceData: { [operatorId: string]: OperatorPerformance },
    workloadData: { [operatorId: string]: WorkloadAnalysis }
  ): WorkAssignmentRecommendation[] {
    const recommendations: WorkAssignmentRecommendation[] = [];

    for (const operator of availableOperators) {
      const performance = performanceData[operator.id];
      const workload = workloadData[operator.id];
      
      if (!performance || !workload) continue;

      const context: RecommendationContext = {
        operator,
        workItem,
        currentWorkload: workload,
        historicalPerformance: performance,
        machinePriority: this.analyzeMachinePriority(workItem)
      };

      const recommendation = this.calculateRecommendation(context);
      
      if (recommendation.confidenceScore >= 0.3) { // Only include viable recommendations
        recommendations.push(recommendation);
      }
    }

    // Sort by confidence score (highest first)
    return recommendations.sort((a, b) => b.confidenceScore - a.confidenceScore);
  }

  /**
   * Calculate recommendation score for a specific operator-work combination
   */
  private calculateRecommendation(context: RecommendationContext): WorkAssignmentRecommendation {
    const skillMatchScore = this.calculateSkillMatch(context);
    const workloadBalanceScore = this.calculateWorkloadBalance(context);
    const qualityScore = this.calculateQualityScore(context);
    const efficiencyScore = this.calculateEfficiencyScore(context);
    const machineCompatibilityScore = this.calculateMachineCompatibility(context);

    // Weighted score calculation
    const confidenceScore = 
      (skillMatchScore * this.weights.skillMatch) +
      (workloadBalanceScore * this.weights.workloadBalance) +
      (qualityScore * this.weights.qualityHistory) +
      (efficiencyScore * this.weights.efficiency) +
      (machineCompatibilityScore * this.weights.machineCompatibility);

    const reasons = this.generateRecommendationReasons(context, {
      skillMatch: skillMatchScore,
      workloadBalance: workloadBalanceScore,
      quality: qualityScore,
      efficiency: efficiencyScore,
      machineCompatibility: machineCompatibilityScore
    });

    const estimatedCompletion = this.estimateCompletionTime(context);
    const riskFactors = this.identifyRiskFactors(context);

    return {
      operatorId: context.operator.id,
      operatorName: context.operator.name,
      confidenceScore: Math.min(1.0, Math.max(0.0, confidenceScore)),
      reasons,
      estimatedCompletionTime: estimatedCompletion,
      qualityPrediction: qualityScore,
      efficiencyPrediction: efficiencyScore,
      riskFactors,
      priority: this.calculatePriority(confidenceScore, riskFactors),
      skillMatch: this.buildSkillMatchDetails(context, skillMatchScore)
    };
  }

  /**
   * Calculate skill match score between operator and work item
   */
  private calculateSkillMatch(context: RecommendationContext): number {
    const { operator, workItem, historicalPerformance } = context;
    let score = 0.5; // Base score

    // Machine speciality match
    const machineMatch = this.checkMachineCompatibility(operator.machine, workItem.workType);
    if (machineMatch.isCompatible) {
      score += machineMatch.isExact ? 0.3 : 0.2;
    } else {
      score -= 0.4; // Heavy penalty for incompatible machine
    }

    // Experience with this work type
    const workTypeExperience = historicalPerformance.workTypeExperience[workItem.workType] || 0;
    const experienceBonus = Math.min(0.2, workTypeExperience / 100); // Max 20% bonus
    score += experienceBonus;

    // Skill level match
    const requiredSkill = WORK_TYPE_SKILL_REQUIREMENTS[workItem.workType];
    if (requiredSkill) {
      const operatorExperience = operator.experienceMonths || 0;
      if (operatorExperience >= requiredSkill.minExperience) {
        score += 0.1;
      } else {
        score -= 0.2; // Penalty for insufficient experience
      }
    }

    // Quality bonus for consistent high-quality work
    if (historicalPerformance.qualityScore >= 90) {
      score += 0.1;
    } else if (historicalPerformance.qualityScore < 70) {
      score -= 0.1;
    }

    return Math.min(1.0, Math.max(0.0, score));
  }

  /**
   * Calculate workload balance score
   */
  private calculateWorkloadBalance(context: RecommendationContext): number {
    const { currentWorkload, workItem } = context;
    
    const currentUtilization = currentWorkload.utilizationPercentage / 100;
    const estimatedAdditionalLoad = workItem.estimatedHours / 8; // Assuming 8-hour workday
    const projectedUtilization = currentUtilization + estimatedAdditionalLoad;

    // Optimal utilization is around 85%
    const optimalUtilization = 0.85;
    const utilizationDifference = Math.abs(projectedUtilization - optimalUtilization);

    // Score decreases as we move away from optimal utilization
    let score = 1.0 - (utilizationDifference * 2);
    
    // Bonus for operators with lower current workload
    if (currentUtilization < 0.7) {
      score += 0.1;
    }

    // Penalty for overloading
    if (projectedUtilization > 1.0) {
      score -= 0.3;
    }

    return Math.min(1.0, Math.max(0.0, score));
  }

  /**
   * Calculate quality score based on historical performance
   */
  private calculateQualityScore(context: RecommendationContext): number {
    const { historicalPerformance, workItem } = context;
    
    let score = historicalPerformance.qualityScore / 100;

    // Recent defect rate impact
    const defectPenalty = historicalPerformance.recentDefectRate * 0.5;
    score -= defectPenalty;

    // Work type specific quality history
    const workTypeExperience = historicalPerformance.workTypeExperience[workItem.workType] || 0;
    if (workTypeExperience > 50) {
      score += 0.1; // Experience bonus
    }

    // Completion rate impact
    score *= historicalPerformance.completionRate / 100;

    return Math.min(1.0, Math.max(0.0, score));
  }

  /**
   * Calculate efficiency score
   */
  private calculateEfficiencyScore(context: RecommendationContext): number {
    const { historicalPerformance, workItem } = context;
    
    let score = historicalPerformance.efficiencyRating / 100;

    // Average completion time factor
    const standardTime = this.getStandardCompletionTime(workItem.workType, workItem.difficulty);
    if (standardTime > 0) {
      const timeRatio = historicalPerformance.averageCompletionTime / standardTime;
      if (timeRatio < 1.2) {
        score += 0.1; // Bonus for faster completion
      } else if (timeRatio > 1.5) {
        score -= 0.1; // Penalty for slow completion
      }
    }

    // Specialty bonus
    score += historicalPerformance.specialtyBonus / 100;

    return Math.min(1.0, Math.max(0.0, score));
  }

  /**
   * Calculate machine compatibility score
   */
  private calculateMachineCompatibility(context: RecommendationContext): number {
    const { operator, machinePriority } = context;
    
    const compatibility = this.checkMachineCompatibility(operator.machine, machinePriority.workType);
    
    if (!compatibility.isCompatible) {
      return 0.0;
    }

    let score = compatibility.isExact ? 1.0 : 0.7;

    // Preferred machine bonus
    if (machinePriority.preferredMachines.includes(operator.machine || '')) {
      score = Math.min(1.0, score + 0.2);
    }

    return score;
  }

  /**
   * Check machine compatibility
   */
  private checkMachineCompatibility(operatorMachine: string | undefined, workType: string): { isCompatible: boolean; isExact: boolean } {
    if (!operatorMachine) {
      return { isCompatible: false, isExact: false };
    }

    const compatibleMachines = MACHINE_COMPATIBILITY[workType as keyof typeof MACHINE_COMPATIBILITY] || [];
    
    const isExact = compatibleMachines.includes(operatorMachine);
    const isCompatible = isExact || operatorMachine.toLowerCase().includes(workType.toLowerCase());

    return { isCompatible, isExact };
  }

  /**
   * Analyze machine priority for work item
   */
  private analyzeMachinePriority(workItem: WorkItem): MachinePriority {
    const workType = workItem.workType.toLowerCase();
    const compatibleMachines = MACHINE_COMPATIBILITY[workType as keyof typeof MACHINE_COMPATIBILITY] || [];
    
    const skillRequirement = WORK_TYPE_SKILL_REQUIREMENTS[workType];
    const skillLevel = skillRequirement?.skillLevel || 'beginner';

    return {
      workType: workItem.workType,
      requiredMachines: compatibleMachines,
      preferredMachines: compatibleMachines.slice(0, 2), // Top 2 as preferred
      skillLevel: skillLevel as 'beginner' | 'intermediate' | 'advanced' | 'expert'
    };
  }

  /**
   * Generate human-readable recommendation reasons
   */
  private generateRecommendationReasons(
    context: RecommendationContext, 
    scores: { [key: string]: number }
  ): string[] {
    const reasons: string[] = [];
    const { operator, workItem, historicalPerformance } = context;

    // Machine compatibility
    if (scores.machineCompatibility >= 0.8) {
      reasons.push(`Perfect machine match for ${workItem.workType}`);
    } else if (scores.machineCompatibility >= 0.6) {
      reasons.push(`Compatible machine for ${workItem.workType}`);
    }

    // Quality history
    if (scores.quality >= 0.85) {
      reasons.push(`Excellent quality history (${historicalPerformance.qualityScore.toFixed(1)}%)`);
    } else if (scores.quality >= 0.70) {
      reasons.push(`Good quality record (${historicalPerformance.qualityScore.toFixed(1)}%)`);
    }

    // Efficiency
    if (scores.efficiency >= 0.85) {
      reasons.push(`High efficiency rating (${historicalPerformance.efficiencyRating.toFixed(1)}%)`);
    }

    // Workload balance
    if (scores.workloadBalance >= 0.80) {
      reasons.push('Good workload balance');
    } else if (scores.workloadBalance < 0.40) {
      reasons.push('May be overloaded');
    }

    // Experience
    const workTypeExp = historicalPerformance.workTypeExperience[workItem.workType] || 0;
    if (workTypeExp >= 50) {
      reasons.push(`Extensive experience with ${workItem.workType}`);
    } else if (workTypeExp >= 20) {
      reasons.push(`Good experience with ${workItem.workType}`);
    }

    // Special conditions
    if (workItem.priority === 'high' && historicalPerformance.completionRate >= 95) {
      reasons.push('Reliable for high-priority work');
    }

    return reasons;
  }

  /**
   * Estimate completion time
   */
  private estimateCompletionTime(context: RecommendationContext): Date {
    const { operator, workItem, historicalPerformance, currentWorkload } = context;
    
    const standardTime = this.getStandardCompletionTime(workItem.workType, workItem.difficulty);
    const operatorTimeAdjustment = historicalPerformance.averageCompletionTime / standardTime;
    const estimatedHours = standardTime * operatorTimeAdjustment;
    
    // Factor in current workload
    const workloadDelay = currentWorkload.utilizationPercentage > 80 ? 1.2 : 1.0;
    const adjustedHours = estimatedHours * workloadDelay;
    
    return addHours(new Date(), adjustedHours);
  }

  /**
   * Identify risk factors
   */
  private identifyRiskFactors(context: RecommendationContext): string[] {
    const risks: string[] = [];
    const { historicalPerformance, currentWorkload, operator, workItem } = context;

    if (historicalPerformance.recentDefectRate > 0.05) {
      risks.push('Recent quality issues');
    }

    if (currentWorkload.utilizationPercentage > 90) {
      risks.push('High current workload');
    }

    if (historicalPerformance.completionRate < 85) {
      risks.push('Lower completion rate');
    }

    const compatibility = this.checkMachineCompatibility(operator.machine, workItem.workType);
    if (!compatibility.isCompatible) {
      risks.push('Machine incompatibility');
    }

    const workTypeExp = historicalPerformance.workTypeExperience[workItem.workType] || 0;
    if (workTypeExp < 10) {
      risks.push('Limited experience with this work type');
    }

    return risks;
  }

  /**
   * Calculate priority level
   */
  private calculatePriority(confidenceScore: number, riskFactors: string[]): 'high' | 'medium' | 'low' {
    if (confidenceScore >= 0.8 && riskFactors.length === 0) {
      return 'high';
    } else if (confidenceScore >= 0.6 && riskFactors.length <= 1) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Build detailed skill match information
   */
  private buildSkillMatchDetails(context: RecommendationContext, score: number): SkillMatch {
    const { operator, workItem, historicalPerformance } = context;
    
    const compatibility = this.checkMachineCompatibility(operator.machine, workItem.workType);
    const workTypeExp = historicalPerformance.workTypeExperience[workItem.workType] || 0;
    
    return {
      machineCompatibility: compatibility.isCompatible,
      skillLevel: this.getOperatorSkillLevel(operator, workItem.workType),
      experienceMatch: workTypeExp,
      overallScore: score
    };
  }

  /**
   * Get standard completion time for work type and difficulty
   */
  private getStandardCompletionTime(workType: string, difficulty?: string): number {
    const baseHours: { [key: string]: number } = {
      'cutting': 2,
      'overlock': 1.5,
      'flatlock': 2,
      'buttonhole': 3,
      'embroidery': 4,
      'quality_check': 0.5,
      'finishing': 1,
      'pressing': 0.5
    };

    let hours = baseHours[workType] || 2;

    // Difficulty adjustment
    if (difficulty === 'easy') {
      hours *= 0.8;
    } else if (difficulty === 'hard') {
      hours *= 1.5;
    } else if (difficulty === 'expert') {
      hours *= 2.0;
    }

    return hours;
  }

  /**
   * Determine operator skill level for specific work type
   */
  private getOperatorSkillLevel(operator: Operator, workType: string): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    const experience = operator.experienceMonths || 0;
    const speciality = operator.speciality || '';
    
    if (speciality.toLowerCase().includes(workType.toLowerCase())) {
      if (experience >= 24) return 'expert';
      if (experience >= 12) return 'advanced';
      if (experience >= 6) return 'intermediate';
    }

    if (experience >= 36) return 'expert';
    if (experience >= 18) return 'advanced';
    if (experience >= 6) return 'intermediate';
    
    return 'beginner';
  }

  /**
   * Update algorithm weights
   */
  public updateWeights(newWeights: Partial<RecommendationWeights>): void {
    this.weights = { ...this.weights, ...newWeights };
  }

  /**
   * Get current weights
   */
  public getWeights(): RecommendationWeights {
    return { ...this.weights };
  }
}

// Factory function for creating recommendation engine
export const createRecommendationEngine = (weights?: Partial<RecommendationWeights>): AIRecommendationEngine => {
  return new AIRecommendationEngine(weights);
};

export default AIRecommendationEngine;