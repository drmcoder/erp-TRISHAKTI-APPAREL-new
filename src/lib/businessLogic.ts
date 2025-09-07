// Core Business Logic Algorithms for TSA ERP
// Implements all calculation formulas and algorithms from BUSINESS_LOGIC_ALGORITHMS.md

export interface PaymentCalculation {
  basePayment: number;
  penalties: number;
  bonuses: number;
  finalPayment: number;
  operatorFaultDamages: number;
  nonOperatorFaultDamages: number;
  details: {
    efficiencyBonus?: number;
    qualityBonus?: number;
    timeBonus?: number;
    damageDeductions?: DamageDeduction[];
  };
}

export interface DamageDeduction {
  damageType: string;
  severity: 'minor' | 'major' | 'severe';
  affectedPieces: number;
  deductionAmount: number;
  deductionPercentage: number;
}

export interface WorkMatchScore {
  totalScore: number;
  machineCompatibilityScore: number;
  skillLevelScore: number;
  workloadScore: number;
  performanceScore: number;
  reasons: string[];
}

export interface QualityMetrics {
  qualityScore: number;
  defectRate: number;
  impactScore: number;
  category: 'minimal' | 'minor' | 'major';
  severityBreakdown: Record<string, number>;
}

export interface EfficiencyMetrics {
  efficiency: number;
  piecesPerHour: number;
  timeUtilization: number;
  productivityIndex: number;
}

// Payment Logic Implementation
export const paymentLogic = {
  // Base payment calculation
  calculateBasePayment: (rate: number, pieces: number): number => {
    const baseRate = parseFloat(rate.toString()) || 0;
    const totalPieces = parseInt(pieces.toString()) || 0;
    return baseRate * totalPieces;
  },

  // Efficiency bonus calculation with progressive rates
  calculateWithEfficiencyBonus: (
    basePayment: number, 
    efficiency: number, 
    bonusThreshold: number = 0.9
  ): number => {
    if (efficiency >= bonusThreshold) {
      // Progressive bonus: 90-95% = 10% bonus, 95-100% = 20% bonus, >100% = up to 50% bonus
      let bonusRate = 0;
      
      if (efficiency >= 1.2) {
        bonusRate = 0.5; // 50% bonus cap for 120% efficiency
      } else if (efficiency >= 1.0) {
        bonusRate = 0.2 + ((efficiency - 1.0) / 0.2) * 0.3; // 20-50% bonus
      } else if (efficiency >= 0.95) {
        bonusRate = 0.1 + ((efficiency - 0.95) / 0.05) * 0.1; // 10-20% bonus
      } else {
        bonusRate = (efficiency - bonusThreshold) * 2; // Up to 10% bonus
      }
      
      return basePayment * (1 + Math.min(bonusRate, 0.5));
    }
    return basePayment;
  },

  // Quality bonus calculation
  calculateQualityBonus: (basePayment: number, qualityScore: number): number => {
    if (qualityScore >= 0.98) {
      return basePayment * 0.15; // 15% bonus for 98%+ quality
    } else if (qualityScore >= 0.95) {
      return basePayment * 0.1; // 10% bonus for 95-98% quality
    } else if (qualityScore >= 0.9) {
      return basePayment * 0.05; // 5% bonus for 90-95% quality
    }
    return 0;
  },

  // Comprehensive damage-aware payment calculation
  calculateDamageAwarePayment: (
    bundleData: { rate: number; totalPieces: number },
    completionData: { piecesCompleted: number; efficiency?: number; qualityScore?: number },
    damageReports: any[] = []
  ): PaymentCalculation => {
    const basePayment = paymentLogic.calculateBasePayment(
      bundleData.rate, 
      completionData.piecesCompleted
    );

    // Categorize damage reports by operator fault
    const operatorFaultDamages = damageReports.filter(report => 
      ['stitching_defect', 'needle_damage', 'tension_issue', 'alignment_error', 'wrong_measurement', 'missing_operation'].includes(report.damageType)
    );

    const nonOperatorFaultDamages = damageReports.filter(report => 
      ['fabric_defect', 'material_issue', 'machine_malfunction', 'design_error'].includes(report.damageType)
    );

    // Calculate damage deductions
    const damageDeductions: DamageDeduction[] = [];
    let totalPenalty = 0;

    operatorFaultDamages.forEach(damage => {
      const deduction = paymentLogic.calculateDamageDeduction(
        damage, 
        basePayment, 
        bundleData.totalPieces
      );
      damageDeductions.push(deduction);
      totalPenalty += deduction.deductionAmount;
    });

    // Calculate bonuses
    let totalBonus = 0;
    const bonusDetails: any = {};

    if (completionData.efficiency) {
      const efficiencyBonus = paymentLogic.calculateWithEfficiencyBonus(basePayment, completionData.efficiency) - basePayment;
      totalBonus += efficiencyBonus;
      bonusDetails.efficiencyBonus = efficiencyBonus;
    }

    if (completionData.qualityScore) {
      const qualityBonus = paymentLogic.calculateQualityBonus(basePayment, completionData.qualityScore);
      totalBonus += qualityBonus;
      bonusDetails.qualityBonus = qualityBonus;
    }

    return {
      basePayment,
      penalties: totalPenalty,
      bonuses: totalBonus,
      finalPayment: Math.max(0, basePayment + totalBonus - totalPenalty),
      operatorFaultDamages: operatorFaultDamages.length,
      nonOperatorFaultDamages: nonOperatorFaultDamages.length,
      details: {
        ...bonusDetails,
        damageDeductions
      }
    };
  },

  // Detailed damage deduction calculation
  calculateDamageDeduction: (
    damageInfo: {
      damageType: string;
      severity: string;
      affectedPieces: number;
      operatorFault?: boolean;
    },
    baseEarnings: number,
    totalPieces: number
  ): DamageDeduction => {
    // If not operator's fault, no deduction
    if (damageInfo.operatorFault === false) {
      return {
        damageType: damageInfo.damageType,
        severity: damageInfo.severity as any,
        affectedPieces: damageInfo.affectedPieces,
        deductionAmount: 0,
        deductionPercentage: 0
      };
    }

    let deductionPercentage = 0;

    // Deduction based on damage type and severity
    const damageRates: Record<string, { minor: number; major: number; severe: number }> = {
      'broken_stitch': { minor: 0.05, major: 0.15, severe: 0.25 },
      'wrong_measurement': { minor: 0.10, major: 0.20, severe: 0.35 },
      'fabric_damage': { minor: 0.10, major: 0.25, severe: 0.40 },
      'missing_operation': { minor: 0.20, major: 0.30, severe: 0.50 },
      'stitching_defect': { minor: 0.08, major: 0.18, severe: 0.30 },
      'needle_damage': { minor: 0.12, major: 0.22, severe: 0.35 },
      'tension_issue': { minor: 0.06, major: 0.16, severe: 0.28 },
      'alignment_error': { minor: 0.10, major: 0.20, severe: 0.32 }
    };

    const damageRate = damageRates[damageInfo.damageType];
    if (damageRate) {
      deductionPercentage = damageRate[damageInfo.severity as keyof typeof damageRate] || damageRate.minor;
    } else {
      // Default deduction for unknown damage types
      deductionPercentage = damageInfo.severity === 'major' ? 0.15 : 
                           damageInfo.severity === 'severe' ? 0.25 : 0.05;
    }

    // Calculate piece-based deduction
    const piecesAffected = damageInfo.affectedPieces || 1;
    const affectedRatio = piecesAffected / totalPieces;
    const deductionAmount = Math.round(baseEarnings * deductionPercentage * affectedRatio);

    return {
      damageType: damageInfo.damageType,
      severity: damageInfo.severity as any,
      affectedPieces: piecesAffected,
      deductionAmount,
      deductionPercentage
    };
  }
};

// Work Assignment Logic Implementation
export const workAssignmentLogic = {
  // Calculate work priority score (0-20 scale)
  calculatePriorityScore: (workItem: {
    priority: string;
    dueDate: string | Date;
    complexity?: number;
    customerImportance?: number;
  }): number => {
    const priorityLevels: Record<string, number> = {
      'urgent': 5,
      'high': 4,
      'normal': 3,
      'low': 2
    };
    
    const urgencyScore = priorityLevels[workItem.priority] || 3;
    
    // Factor in due date urgency
    const dueDate = new Date(workItem.dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let dueDateScore = 0;
    if (daysUntilDue <= 1) dueDateScore = 10;
    else if (daysUntilDue <= 3) dueDateScore = 7;
    else if (daysUntilDue <= 7) dueDateScore = 5;
    else if (daysUntilDue <= 14) dueDateScore = 3;
    else dueDateScore = 1;

    // Factor in complexity (optional)
    const complexityScore = workItem.complexity ? Math.min(workItem.complexity, 3) : 0;
    
    // Factor in customer importance (optional)
    const customerScore = workItem.customerImportance ? workItem.customerImportance : 0;

    return urgencyScore * 2 + dueDateScore + complexityScore + customerScore;
  },

  // Calculate operator-work match score (0-100 scale)
  calculateMatchScore: (
    workItem: {
      machineType: string;
      requiredSkillLevel: string;
      complexity?: number;
      estimatedDuration?: number;
    },
    operator: {
      machineTypes: string[];
      skillLevel: string;
      currentAssignments?: any[];
      averageEfficiency?: number;
      qualityScore?: number;
      maxConcurrentWork?: number;
    }
  ): WorkMatchScore => {
    let totalScore = 0;
    const reasons: string[] = [];

    // Machine type compatibility (50 points max)
    let machineScore = 0;
    if (operator.machineTypes?.includes(workItem.machineType)) {
      machineScore = 50;
      reasons.push('Perfect machine compatibility');
    } else {
      // Check for related machine types
      const relatedMachines = workAssignmentLogic.getRelatedMachineTypes(workItem.machineType);
      const hasRelated = relatedMachines.some(machine => operator.machineTypes?.includes(machine));
      if (hasRelated) {
        machineScore = 25;
        reasons.push('Related machine experience');
      } else {
        machineScore = 0;
        reasons.push('Machine type mismatch');
      }
    }
    totalScore += machineScore;

    // Skill level compatibility (30 points + 10 bonus for exact match)
    let skillScore = 0;
    const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const requiredIndex = skillLevels.indexOf(workItem.requiredSkillLevel || 'beginner');
    const operatorIndex = skillLevels.indexOf(operator.skillLevel || 'beginner');
    
    if (operatorIndex >= requiredIndex) {
      skillScore = 30;
      if (operatorIndex === requiredIndex) {
        skillScore += 10; // Exact match bonus
        reasons.push('Perfect skill level match');
      } else {
        reasons.push('Skill level exceeds requirement');
      }
    } else {
      skillScore = Math.max(0, 20 - (requiredIndex - operatorIndex) * 10);
      reasons.push('Skill level below requirement');
    }
    totalScore += skillScore;

    // Workload consideration (20 points max)
    let workloadScore = 20;
    const currentWorkload = operator.currentAssignments?.length || 0;
    const maxWorkload = operator.maxConcurrentWork || 5;
    const workloadRatio = currentWorkload / maxWorkload;
    
    if (workloadRatio >= 1.0) {
      workloadScore = 0;
      reasons.push('At maximum capacity');
    } else if (workloadRatio >= 0.8) {
      workloadScore = 5;
      reasons.push('Near maximum capacity');
    } else if (workloadRatio >= 0.6) {
      workloadScore = 15;
      reasons.push('Moderate workload');
    } else {
      workloadScore = 20;
      reasons.push('Light workload');
    }
    totalScore += workloadScore;

    // Performance history (15 points max)
    let performanceScore = 0;
    if (operator.averageEfficiency && operator.averageEfficiency > 0.8) {
      performanceScore += 8;
      reasons.push('High efficiency operator');
    }
    if (operator.qualityScore && operator.qualityScore > 0.9) {
      performanceScore += 7;
      reasons.push('High quality operator');
    }
    totalScore += performanceScore;

    return {
      totalScore: Math.min(totalScore, 100),
      machineCompatibilityScore: machineScore,
      skillLevelScore: skillScore,
      workloadScore,
      performanceScore,
      reasons: reasons.slice(0, 3) // Keep top 3 reasons
    };
  },

  // Get related machine types for cross-compatibility
  getRelatedMachineTypes: (machineType: string): string[] => {
    const machineGroups: Record<string, string[]> = {
      'overlock': ['flatlock', 'serger'],
      'flatlock': ['overlock', 'coverstitch'],
      'singleNeedle': ['doubleNeedle', 'straightStitch'],
      'buttonhole': ['buttonAttach', 'bartack'],
      'cutting': ['rotaryCutter', 'bandKnife'],
      'pressing': ['steam', 'ironPress']
    };

    return machineGroups[machineType] || [];
  }
};

// Quality Logic Implementation
export const qualityLogic = {
  // Calculate quality score based on damage reports
  calculateQualityScore: (
    completedPieces: number, 
    damageReports: any[] = []
  ): number => {
    if (completedPieces === 0) return 1.0;
    
    const totalDamaged = damageReports.reduce((sum, report) => 
      sum + (report.affectedPieces || 1), 0
    );
    
    const qualityPieces = Math.max(0, completedPieces - totalDamaged);
    return qualityPieces / completedPieces;
  },

  // Calculate comprehensive quality metrics
  calculateQualityMetrics: (
    completedPieces: number,
    damageReports: any[] = []
  ): QualityMetrics => {
    const qualityScore = qualityLogic.calculateQualityScore(completedPieces, damageReports);
    const defectRate = completedPieces > 0 ? 
      damageReports.reduce((sum, report) => sum + (report.affectedPieces || 1), 0) / completedPieces : 0;

    // Calculate severity breakdown
    const severityBreakdown: Record<string, number> = {
      minor: 0,
      major: 0,
      severe: 0
    };

    damageReports.forEach(report => {
      const severity = report.severity || 'minor';
      severityBreakdown[severity] = (severityBreakdown[severity] || 0) + (report.affectedPieces || 1);
    });

    // Calculate impact score and category
    let impactScore = 0;
    const severityWeights = { minor: 0.3, major: 0.7, severe: 1.0 };
    
    Object.entries(severityBreakdown).forEach(([severity, count]) => {
      impactScore += (count / completedPieces) * (severityWeights[severity as keyof typeof severityWeights] || 0.3);
    });

    const category = impactScore > 0.1 ? 'major' : 
                    impactScore > 0.05 ? 'minor' : 'minimal';

    return {
      qualityScore,
      defectRate,
      impactScore,
      category,
      severityBreakdown
    };
  },

  // Calculate defect severity impact
  calculateDefectImpact: (
    damageType: string, 
    affectedPieces: number, 
    totalPieces: number
  ): { impactScore: number; category: string } => {
    const severityWeights: Record<string, number> = {
      'fabric_hole': 0.9,
      'color_issue': 0.6,
      'stitching_defect': 1.0,
      'size_issue': 0.95,
      'alignment_error': 0.7,
      'broken_stitch': 0.8,
      'wrong_measurement': 0.9,
      'missing_operation': 1.0,
      'needle_damage': 0.75,
      'tension_issue': 0.65
    };

    const weight = severityWeights[damageType] || 0.5;
    const affectedRatio = affectedPieces / totalPieces;
    const impactScore = weight * affectedRatio;
    
    return {
      impactScore,
      category: impactScore > 0.1 ? 'major' : 
               impactScore > 0.05 ? 'minor' : 'minimal'
    };
  }
};

// Efficiency and Metrics Logic Implementation
export const metricsLogic = {
  // Calculate operator efficiency
  calculateEfficiency: (actualTime: number, standardTime: number): number => {
    if (!actualTime || !standardTime || actualTime <= 0) return 0;
    return Math.min(2.0, standardTime / actualTime); // Cap at 200%
  },

  // Calculate comprehensive efficiency metrics
  calculateEfficiencyMetrics: (
    actualTime: number,
    standardTime: number,
    completedPieces: number,
    scheduledTime: number
  ): EfficiencyMetrics => {
    const efficiency = metricsLogic.calculateEfficiency(actualTime, standardTime);
    const piecesPerHour = actualTime > 0 ? (completedPieces / (actualTime / 60)) : 0;
    const timeUtilization = scheduledTime > 0 ? Math.min(1.0, actualTime / scheduledTime) : 0;
    
    // Productivity index combines efficiency and time utilization
    const productivityIndex = (efficiency * 0.7 + timeUtilization * 0.3) * 100;

    return {
      efficiency,
      piecesPerHour,
      timeUtilization,
      productivityIndex: Math.round(productivityIndex)
    };
  },

  // Calculate daily production metrics
  calculateDailyMetrics: (completedWork: any[]): {
    totalPieces: number;
    totalTime: number;
    averageEfficiency: number;
    bundlesCompleted: number;
    piecesPerHour: number;
    qualityScore: number;
  } => {
    const totalPieces = completedWork.reduce((sum, work) => 
      sum + (work.completedPieces || 0), 0
    );
    
    const totalTime = completedWork.reduce((sum, work) => 
      sum + (work.timeSpent || 0), 0
    );
    
    const averageEfficiency = completedWork.length > 0 ? 
      completedWork.reduce((sum, work) => sum + (work.efficiency || 0), 0) / completedWork.length : 0;

    const averageQuality = completedWork.length > 0 ?
      completedWork.reduce((sum, work) => sum + (work.qualityScore || 1), 0) / completedWork.length : 1;

    return {
      totalPieces,
      totalTime,
      averageEfficiency,
      bundlesCompleted: completedWork.length,
      piecesPerHour: totalTime > 0 ? (totalPieces / (totalTime / 60)) : 0,
      qualityScore: averageQuality
    };
  },

  // Calculate line efficiency
  calculateLineEfficiency: (operatorMetrics: any[]): number => {
    if (operatorMetrics.length === 0) return 0;
    
    const totalEfficiency = operatorMetrics.reduce((sum, operator) => 
      sum + (operator.efficiency || 0), 0
    );
    
    return totalEfficiency / operatorMetrics.length;
  }
};

// AI/ML Recommendation Engine
export const recommendationEngine = {
  // Self-assignment recommendation algorithm
  generateRecommendations: (
    workItem: any,
    operator: any
  ): { match: number; reasons: string[] } => {
    let match = 50; // Base score
    const reasons: string[] = [];

    // Machine compatibility check (most critical - 40 points)
    const machineMatch = workAssignmentLogic.calculateMatchScore(workItem, operator);
    
    if (machineMatch.machineCompatibilityScore >= 50) {
      match += 40;
      reasons.push("Perfect machine match");
    } else if (machineMatch.machineCompatibilityScore >= 25) {
      match += 20;
      reasons.push("Related machine experience");
    } else {
      match = 10; // Very low score for incompatible work
      reasons.push("Machine mismatch");
      return { match, reasons };
    }

    // Skill level assessment (15 points)
    if (machineMatch.skillLevelScore >= 30) {
      match += 15;
      reasons.push("Suitable skill level");
    } else if (machineMatch.skillLevelScore >= 20) {
      match += 10;
      reasons.push("Adequate skill level");
    }

    // Workload consideration (10 points)
    if (machineMatch.workloadScore >= 15) {
      match += 10;
      reasons.push("Good availability");
    } else if (machineMatch.workloadScore >= 5) {
      match += 5;
      reasons.push("Limited availability");
    }

    // Priority and urgency bonus (5 points)
    if (workItem.priority === 'urgent' || workItem.priority === 'high') {
      match += 5;
      reasons.push("High priority work");
    }

    // Performance history bonus (10 points)
    if (operator.averageEfficiency > 0.85 && operator.qualityScore > 0.9) {
      match += 10;
      reasons.push("Excellent performer");
    } else if (operator.averageEfficiency > 0.75 || operator.qualityScore > 0.85) {
      match += 5;
      reasons.push("Good performer");
    }

    // Time estimation bonus (5 points)
    const estimatedTime = workItem.estimatedTime || workItem.standardTime || 30;
    if (estimatedTime < 30) {
      match += 5;
      reasons.push("Quick work");
    }

    return {
      match: Math.min(match, 100),
      reasons: reasons.slice(0, 3)
    };
  }
};

// Operation Rate Service
export const operationRateService = {
  // Formula constants
  TIME_MULTIPLIER: 1.9, // time = rate * 1.9 minutes
  
  // Calculate time from rate: time = rate * 1.9
  calculateTimeFromRate: (rate: number): number => {
    return parseFloat((rate * operationRateService.TIME_MULTIPLIER).toFixed(1));
  },
  
  // Calculate rate from time: rate = time / 1.9
  calculateRateFromTime: (time: number): number => {
    return parseFloat((time / operationRateService.TIME_MULTIPLIER).toFixed(2));
  },

  // Calculate standard time based on operation complexity
  calculateStandardTime: (
    baseTime: number, 
    complexity: number, 
    machineType: string
  ): number => {
    const complexityMultiplier = 1 + (complexity - 5) * 0.1; // Base complexity 5
    const machineMultipliers: Record<string, number> = {
      'manual': 1.3,
      'overlock': 1.0,
      'flatlock': 1.1,
      'buttonhole': 1.2,
      'cutting': 0.8,
      'pressing': 0.9
    };

    const machineMultiplier = machineMultipliers[machineType] || 1.0;
    return baseTime * complexityMultiplier * machineMultiplier;
  }
};

export default {
  paymentLogic,
  workAssignmentLogic,
  qualityLogic,
  metricsLogic,
  recommendationEngine,
  operationRateService
};