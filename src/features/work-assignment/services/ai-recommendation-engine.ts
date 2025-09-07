// AI Recommendation Engine for Work Assignment
// Intelligent work assignment recommendations based on operator skills, performance, and workload

import { 
  WorkItem, 
  OperatorSummary, 
  AssignmentRecommendation,
  WorkloadAnalysis,
  SkillMatchScore 
} from '../types';

export interface RecommendationCriteria {
  workItemId: string;
  requiredSkills: string[];
  machineType: string;
  complexity: number; // 1-10 scale
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration: number; // in minutes
  qualityRequirement: number; // 0-1 scale
}

export interface RecommendationResult {
  operatorId: string;
  operatorName: string;
  confidenceScore: number; // 0-100
  matchReasons: string[];
  warnings: string[];
  estimatedCompletion: Date;
  expectedEfficiency: number;
  expectedQuality: number;
  workloadImpact: 'low' | 'medium' | 'high';
}

export interface LearningData {
  operatorId: string;
  workItemType: string;
  machineType: string;
  actualEfficiency: number;
  actualQuality: number;
  actualDuration: number;
  estimatedDuration: number;
  issuesEncountered: string[];
  completionTime: Date;
}

export class AIRecommendationEngine {
  private learningData: Map<string, LearningData[]> = new Map();
  private operatorPerformanceCache: Map<string, any> = new Map();
  private readonly weights = {
    skillMatch: 0.25,
    efficiency: 0.20,
    quality: 0.20,
    availability: 0.15,
    workload: 0.10,
    experience: 0.10
  };

  constructor() {
    this.initializeLearningData();
  }

  // Main recommendation function
  async getRecommendations(
    criteria: RecommendationCriteria,
    availableOperators: OperatorSummary[],
    maxRecommendations: number = 5
  ): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = [];

    for (const operator of availableOperators) {
      const recommendation = await this.evaluateOperatorForWorkItem(criteria, operator);
      if (recommendation.confidenceScore > 30) { // Minimum threshold
        recommendations.push(recommendation);
      }
    }

    // Sort by confidence score and return top recommendations
    return recommendations
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, maxRecommendations);
  }

  // Evaluate specific operator for work item
  private async evaluateOperatorForWorkItem(
    criteria: RecommendationCriteria,
    operator: OperatorSummary
  ): Promise<RecommendationResult> {
    const skillScore = this.calculateSkillMatchScore(criteria, operator);
    const efficiencyScore = this.calculateEfficiencyScore(operator);
    const qualityScore = this.calculateQualityScore(operator, criteria.qualityRequirement);
    const availabilityScore = this.calculateAvailabilityScore(operator);
    const workloadScore = this.calculateWorkloadScore(operator);
    const experienceScore = this.calculateExperienceScore(operator, criteria.machineType);

    // Calculate weighted confidence score
    const confidenceScore = Math.round(
      skillScore * this.weights.skillMatch +
      efficiencyScore * this.weights.efficiency +
      qualityScore * this.weights.quality +
      availabilityScore * this.weights.availability +
      workloadScore * this.weights.workload +
      experienceScore * this.weights.experience
    );

    // Generate reasons and warnings
    const { matchReasons, warnings } = this.generateReasoningAndWarnings(
      criteria,
      operator,
      {
        skillScore,
        efficiencyScore,
        qualityScore,
        availabilityScore,
        workloadScore,
        experienceScore
      }
    );

    // Estimate completion time and performance
    const { estimatedCompletion, expectedEfficiency, expectedQuality } = 
      this.predictPerformance(criteria, operator);

    return {
      operatorId: operator.id,
      operatorName: operator.name,
      confidenceScore,
      matchReasons,
      warnings,
      estimatedCompletion,
      expectedEfficiency,
      expectedQuality,
      workloadImpact: this.assessWorkloadImpact(operator)
    };
  }

  // Calculate skill match score (0-100)
  private calculateSkillMatchScore(criteria: RecommendationCriteria, operator: OperatorSummary): number {
    let score = 0;
    
    // Machine compatibility
    const machineMatch = operator.machineTypes.includes(criteria.machineType) ||
                        operator.primaryMachine === criteria.machineType;
    if (!machineMatch) return 0; // Must be machine compatible
    
    score += operator.primaryMachine === criteria.machineType ? 30 : 20;

    // Skill level match
    const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const operatorSkillIndex = skillLevels.indexOf(operator.skillLevel);
    const requiredSkillIndex = this.determineRequiredSkillLevel(criteria.complexity);
    
    if (operatorSkillIndex >= requiredSkillIndex) {
      score += 30; // Base score for meeting requirements
      if (operatorSkillIndex === requiredSkillIndex) {
        score += 10; // Perfect match bonus
      } else if (operatorSkillIndex > requiredSkillIndex) {
        score += 5; // Overqualified (slight bonus, but not optimal resource use)
      }
    } else {
      score -= 20; // Penalty for insufficient skill
    }

    // Specialization match
    if (operator.specializations) {
      const hasRelevantSpecialization = operator.specializations.some(spec =>
        criteria.requiredSkills.includes(spec)
      );
      if (hasRelevantSpecialization) {
        score += 15;
      }
    }

    // Experience with similar work (from learning data)
    const operatorHistory = this.learningData.get(operator.id) || [];
    const relevantExperience = operatorHistory.filter(data =>
      data.machineType === criteria.machineType
    );
    
    if (relevantExperience.length > 0) {
      const avgPerformance = relevantExperience.reduce((sum, exp) => 
        sum + exp.actualEfficiency, 0
      ) / relevantExperience.length;
      score += avgPerformance * 25; // Historical performance boost
    }

    return Math.min(100, Math.max(0, score));
  }

  // Calculate efficiency score based on historical performance
  private calculateEfficiencyScore(operator: OperatorSummary): number {
    return operator.efficiency * 100;
  }

  // Calculate quality score with requirement consideration
  private calculateQualityScore(operator: OperatorSummary, qualityRequirement: number): number {
    const operatorQuality = operator.qualityScore;
    
    if (operatorQuality >= qualityRequirement) {
      return operatorQuality * 100;
    } else {
      // Penalty for not meeting quality requirements
      const gap = qualityRequirement - operatorQuality;
      return Math.max(0, operatorQuality * 100 - gap * 50);
    }
  }

  // Calculate availability score based on current status
  private calculateAvailabilityScore(operator: OperatorSummary): number {
    switch (operator.currentStatus) {
      case 'idle':
        return 100;
      case 'working':
        // Check workload - if below capacity, can take more work
        return operator.currentWork ? 60 : 80;
      case 'break':
        return 40;
      case 'offline':
        return 0;
      default:
        return 50;
    }
  }

  // Calculate workload score (lower workload = higher score)
  private calculateWorkloadScore(operator: OperatorSummary): number {
    // This would check current assignments vs capacity
    const assumedCurrentLoad = 2; // Mock data
    const maxCapacity = operator.maxConcurrentWork || 5;
    const utilizationRate = assumedCurrentLoad / maxCapacity;
    
    if (utilizationRate <= 0.5) return 100;
    if (utilizationRate <= 0.7) return 80;
    if (utilizationRate <= 0.9) return 60;
    return 20;
  }

  // Calculate experience score for specific machine type
  private calculateExperienceScore(operator: OperatorSummary, machineType: string): number {
    let score = 0;

    // Primary machine bonus
    if (operator.primaryMachine === machineType) {
      score += 50;
    }

    // General experience (total working days)
    const totalDays = operator.totalWorkingDays || 0;
    if (totalDays > 365) score += 30;
    else if (totalDays > 180) score += 20;
    else if (totalDays > 90) score += 10;
    
    // Machine-specific experience from learning data
    const operatorHistory = this.learningData.get(operator.id) || [];
    const machineExperience = operatorHistory.filter(data =>
      data.machineType === machineType
    ).length;
    
    score += Math.min(20, machineExperience * 2);

    return Math.min(100, score);
  }

  // Generate reasoning and warnings
  private generateReasoningAndWarnings(
    criteria: RecommendationCriteria,
    operator: OperatorSummary,
    scores: any
  ): { matchReasons: string[]; warnings: string[] } {
    const matchReasons: string[] = [];
    const warnings: string[] = [];

    // Skill match reasons
    if (scores.skillScore > 80) {
      matchReasons.push('Excellent skill match for this operation');
    } else if (scores.skillScore > 60) {
      matchReasons.push('Good skill compatibility');
    }

    if (operator.primaryMachine === criteria.machineType) {
      matchReasons.push('Primary machine expertise');
    }

    // Performance reasons
    if (scores.efficiencyScore > 85) {
      matchReasons.push(`High efficiency (${Math.round(operator.efficiency * 100)}%)`);
    }

    if (scores.qualityScore > 90) {
      matchReasons.push(`Excellent quality record (${Math.round(operator.qualityScore * 100)}%)`);
    }

    // Availability reasons
    if (operator.currentStatus === 'idle') {
      matchReasons.push('Currently available');
    } else if (operator.currentStatus === 'working') {
      if (scores.workloadScore > 60) {
        matchReasons.push('Has capacity for additional work');
      } else {
        warnings.push('Currently at high workload capacity');
      }
    }

    // Experience reasons
    const operatorHistory = this.learningData.get(operator.id) || [];
    const relevantExperience = operatorHistory.filter(data =>
      data.machineType === criteria.machineType
    );
    
    if (relevantExperience.length > 10) {
      matchReasons.push('Extensive experience with this machine type');
    } else if (relevantExperience.length === 0) {
      warnings.push('No previous experience with this machine type');
    }

    // Quality warnings
    if (operator.qualityScore < criteria.qualityRequirement) {
      warnings.push(`Quality score below requirement (${Math.round(operator.qualityScore * 100)}% vs ${Math.round(criteria.qualityRequirement * 100)}%)`);
    }

    // Complexity warnings
    const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const operatorSkillIndex = skillLevels.indexOf(operator.skillLevel);
    const requiredSkillIndex = this.determineRequiredSkillLevel(criteria.complexity);
    
    if (operatorSkillIndex < requiredSkillIndex) {
      warnings.push('May be challenging given current skill level');
    }

    // Urgency considerations
    if (criteria.urgency === 'urgent' && scores.efficiencyScore < 70) {
      warnings.push('Lower efficiency may not meet urgent deadline');
    }

    return { matchReasons, warnings };
  }

  // Predict performance based on historical data
  private predictPerformance(criteria: RecommendationCriteria, operator: OperatorSummary): {
    estimatedCompletion: Date;
    expectedEfficiency: number;
    expectedQuality: number;
  } {
    const operatorHistory = this.learningData.get(operator.id) || [];
    const relevantHistory = operatorHistory.filter(data =>
      data.machineType === criteria.machineType
    );

    let efficiencyMultiplier = 1.0;
    let qualityMultiplier = 1.0;
    let timeMultiplier = 1.0;

    if (relevantHistory.length > 0) {
      // Use historical data to adjust predictions
      const avgEfficiency = relevantHistory.reduce((sum, h) => sum + h.actualEfficiency, 0) / relevantHistory.length;
      const avgQuality = relevantHistory.reduce((sum, h) => sum + h.actualQuality, 0) / relevantHistory.length;
      const avgTimeRatio = relevantHistory.reduce((sum, h) => sum + (h.actualDuration / h.estimatedDuration), 0) / relevantHistory.length;

      efficiencyMultiplier = avgEfficiency / operator.efficiency; // Adjust based on machine-specific performance
      qualityMultiplier = avgQuality / operator.qualityScore;
      timeMultiplier = avgTimeRatio;
    }

    // Account for workload impact
    const currentWorkloadImpact = this.assessWorkloadImpact(operator);
    if (currentWorkloadImpact === 'high') {
      efficiencyMultiplier *= 0.9;
      timeMultiplier *= 1.1;
    } else if (currentWorkloadImpact === 'medium') {
      efficiencyMultiplier *= 0.95;
      timeMultiplier *= 1.05;
    }

    const adjustedDuration = criteria.estimatedDuration * timeMultiplier;
    const estimatedCompletion = new Date();
    estimatedCompletion.setMinutes(estimatedCompletion.getMinutes() + adjustedDuration);

    return {
      estimatedCompletion,
      expectedEfficiency: Math.min(1.0, operator.efficiency * efficiencyMultiplier),
      expectedQuality: Math.min(1.0, operator.qualityScore * qualityMultiplier)
    };
  }

  // Assess workload impact
  private assessWorkloadImpact(operator: OperatorSummary): 'low' | 'medium' | 'high' {
    // Mock implementation - would check actual current assignments
    const assumedCurrentLoad = 2;
    const maxCapacity = operator.maxConcurrentWork || 5;
    const utilizationRate = assumedCurrentLoad / maxCapacity;

    if (utilizationRate <= 0.5) return 'low';
    if (utilizationRate <= 0.8) return 'medium';
    return 'high';
  }

  // Determine required skill level based on complexity
  private determineRequiredSkillLevel(complexity: number): number {
    if (complexity <= 3) return 0; // beginner
    if (complexity <= 6) return 1; // intermediate
    if (complexity <= 8) return 2; // advanced
    return 3; // expert
  }

  // Learn from completed assignments
  public learnFromAssignment(data: LearningData): void {
    if (!this.learningData.has(data.operatorId)) {
      this.learningData.set(data.operatorId, []);
    }
    
    const operatorData = this.learningData.get(data.operatorId)!;
    operatorData.push(data);
    
    // Keep only recent data (last 100 assignments per operator)
    if (operatorData.length > 100) {
      operatorData.shift();
    }

    // Update performance cache
    this.updatePerformanceCache(data.operatorId);
  }

  // Update operator performance cache
  private updatePerformanceCache(operatorId: string): void {
    const operatorHistory = this.learningData.get(operatorId) || [];
    
    if (operatorHistory.length === 0) return;

    // Calculate various performance metrics
    const recentHistory = operatorHistory.slice(-20); // Last 20 assignments
    
    const avgEfficiency = recentHistory.reduce((sum, h) => sum + h.actualEfficiency, 0) / recentHistory.length;
    const avgQuality = recentHistory.reduce((sum, h) => sum + h.actualQuality, 0) / recentHistory.length;
    const timeAccuracy = recentHistory.reduce((sum, h) => {
      const ratio = h.estimatedDuration / h.actualDuration;
      return sum + Math.min(1, ratio); // Cap at 1 for early completions
    }, 0) / recentHistory.length;

    // Machine type preferences (where they perform best)
    const machinePerformance = new Map<string, number[]>();
    recentHistory.forEach(h => {
      if (!machinePerformance.has(h.machineType)) {
        machinePerformance.set(h.machineType, []);
      }
      machinePerformance.get(h.machineType)!.push(h.actualEfficiency);
    });

    const bestMachineTypes = Array.from(machinePerformance.entries())
      .map(([type, efficiencies]) => ({
        type,
        avgEfficiency: efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length
      }))
      .sort((a, b) => b.avgEfficiency - a.avgEfficiency)
      .slice(0, 3)
      .map(m => m.type);

    this.operatorPerformanceCache.set(operatorId, {
      avgEfficiency,
      avgQuality,
      timeAccuracy,
      bestMachineTypes,
      totalAssignments: operatorHistory.length,
      recentTrend: this.calculatePerformanceTrend(recentHistory),
      updatedAt: new Date()
    });
  }

  // Calculate performance trend
  private calculatePerformanceTrend(history: LearningData[]): 'improving' | 'stable' | 'declining' {
    if (history.length < 10) return 'stable';

    const firstHalf = history.slice(0, Math.floor(history.length / 2));
    const secondHalf = history.slice(Math.floor(history.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, h) => sum + h.actualEfficiency, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, h) => sum + h.actualEfficiency, 0) / secondHalf.length;

    const improvement = secondHalfAvg - firstHalfAvg;
    
    if (improvement > 0.05) return 'improving';
    if (improvement < -0.05) return 'declining';
    return 'stable';
  }

  // Initialize with mock learning data
  private initializeLearningData(): void {
    // This would typically load from database
    // Mock data for demonstration
    const mockData: LearningData[] = [
      {
        operatorId: 'op_001',
        workItemType: 'seam_stitching',
        machineType: 'sewing',
        actualEfficiency: 0.89,
        actualQuality: 0.94,
        actualDuration: 45,
        estimatedDuration: 50,
        issuesEncountered: [],
        completionTime: new Date()
      }
    ];

    mockData.forEach(data => this.learnFromAssignment(data));
  }

  // Get operator insights for UI
  public getOperatorInsights(operatorId: string): any {
    return this.operatorPerformanceCache.get(operatorId);
  }

  // Bulk recommendation for multiple work items
  public async getBulkRecommendations(
    workItems: RecommendationCriteria[],
    availableOperators: OperatorSummary[]
  ): Promise<Map<string, RecommendationResult[]>> {
    const results = new Map<string, RecommendationResult[]>();

    for (const workItem of workItems) {
      const recommendations = await this.getRecommendations(workItem, availableOperators);
      results.set(workItem.workItemId, recommendations);
    }

    return results;
  }
}

// Singleton instance
export const aiRecommendationEngine = new AIRecommendationEngine();