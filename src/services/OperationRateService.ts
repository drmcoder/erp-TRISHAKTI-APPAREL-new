// Operation Rate Service
// Implements TIME_MULTIPLIER = 1.9 formula and advanced pricing calculations

export interface EfficiencyBonusConfig {
  threshold: number;
  rate: number;
  maxBonus: number;
}

export interface QualityBonusConfig {
  threshold: number;
  rate: number;
}

export interface OvertimeConfig {
  regularHours: number;
  overtimeMultiplier: number;
  holidayMultiplier: number;
}

export interface PricingConfig {
  efficiencyBonus: EfficiencyBonusConfig;
  qualityBonus: QualityBonusConfig;
  qualityPenalty: QualityBonusConfig;
  overtime: OvertimeConfig;
  skillMultipliers: Record<string, number>;
}

export interface DamageReport {
  id: string;
  faultType: 'operator_error' | 'material_defect' | 'machine_issue' | 'design_issue';
  severity: 'minor' | 'major' | 'critical';
  affectedPieces: number;
  operatorId: string;
  description: string;
}

export interface PaymentBreakdown {
  basePayment: number;
  efficiencyBonus: number;
  qualityBonus: number;
  skillBonus: number;
  overtimePayment: number;
  damagePenalty: number;
  finalPayment: number;
  details: string[];
}

export class OperationRateService {
  // Core formula: TIME_MULTIPLIER = 1.9 (industry standard)
  static readonly TIME_MULTIPLIER = 1.9;
  
  // Default pricing configuration
  static readonly DEFAULT_CONFIG: PricingConfig = {
    efficiencyBonus: {
      threshold: 0.9, // 90% efficiency threshold
      rate: 0.05, // 5% bonus per efficiency point above threshold
      maxBonus: 0.5 // Maximum 50% bonus
    },
    qualityBonus: {
      threshold: 0.95, // 95% quality threshold
      rate: 0.03 // 3% bonus
    },
    qualityPenalty: {
      threshold: 0.8, // Below 80% quality
      rate: 0.1 // 10% penalty
    },
    overtime: {
      regularHours: 8,
      overtimeMultiplier: 1.5, // 150% for overtime
      holidayMultiplier: 2.0 // 200% for holidays
    },
    skillMultipliers: {
      beginner: 1.0,
      intermediate: 1.1,
      advanced: 1.2,
      expert: 1.3
    }
  };

  // Primary formula: Calculate time from rate
  static calculateTimeFromRate(rate: number): number {
    return parseFloat((rate * this.TIME_MULTIPLIER).toFixed(1));
  }

  // Inverse formula: Calculate rate from time
  static calculateRateFromTime(time: number): number {
    return parseFloat((time / this.TIME_MULTIPLIER).toFixed(2));
  }

  // Calculate SAM (Standard Allowed Minutes) from rate
  static calculateSAMFromRate(rate: number): number {
    return this.calculateTimeFromRate(rate);
  }

  // Bundle total calculation
  static calculateBundleTotal(operations: Array<{rate: number}>, pieces: number): number {
    const totalRate = operations.reduce((sum, op) => sum + op.rate, 0);
    return parseFloat((totalRate * pieces).toFixed(2));
  }

  // Base payment calculation
  static calculateBasePayment(rate: number, pieces: number): number {
    return parseFloat((rate * pieces).toFixed(2));
  }

  // Efficiency bonus calculation
  static calculateEfficiencyBonus(
    basePayment: number, 
    efficiency: number, 
    config: EfficiencyBonusConfig = this.DEFAULT_CONFIG.efficiencyBonus
  ): number {
    if (efficiency < config.threshold) return 0;
    
    const bonusRate = Math.min(
      (efficiency - config.threshold) * config.rate, 
      config.maxBonus
    );
    
    return parseFloat((basePayment * bonusRate).toFixed(2));
  }

  // Quality bonus calculation
  static calculateQualityBonus(
    basePayment: number, 
    qualityScore: number, 
    config: QualityBonusConfig = this.DEFAULT_CONFIG.qualityBonus
  ): number {
    if (qualityScore >= config.threshold) {
      return parseFloat((basePayment * config.rate).toFixed(2));
    }
    return 0;
  }

  // Quality penalty calculation
  static calculateQualityPenalty(
    basePayment: number, 
    qualityScore: number, 
    config: QualityBonusConfig = this.DEFAULT_CONFIG.qualityPenalty
  ): number {
    if (qualityScore < config.threshold) {
      return parseFloat((basePayment * config.rate).toFixed(2));
    }
    return 0;
  }

  // Skill level bonus calculation
  static calculateSkillBonus(
    basePayment: number, 
    operatorSkill: string, 
    requiredSkill: string,
    skillMultipliers: Record<string, number> = this.DEFAULT_CONFIG.skillMultipliers
  ): number {
    const operatorLevel = skillMultipliers[operatorSkill] || 1.0;
    const requiredLevel = skillMultipliers[requiredSkill] || 1.0;
    
    if (operatorLevel > requiredLevel) {
      const bonus = (operatorLevel - requiredLevel) * 0.05; // 5% per skill level
      return parseFloat((basePayment * bonus).toFixed(2));
    }
    return 0;
  }

  // Damage penalty calculation
  static calculateDamagePenalty(
    basePayment: number, 
    damageReports: DamageReport[]
  ): number {
    let penalty = 0;
    
    damageReports.forEach(report => {
      if (report.faultType === 'operator_error') {
        let penaltyRate = 0;
        
        switch (report.severity) {
          case 'minor':
            penaltyRate = 0.05; // 5%
            break;
          case 'major':
            penaltyRate = 0.15; // 15%
            break;
          case 'critical':
            penaltyRate = 0.30; // 30%
            break;
        }
        
        // Penalty based on affected pieces ratio
        const affectedRatio = report.affectedPieces / 100; // Assuming 100 total pieces
        penalty += basePayment * penaltyRate * Math.min(affectedRatio, 1);
      }
    });
    
    // Maximum penalty: 50% of base payment
    return Math.min(penalty, basePayment * 0.5);
  }

  // Overtime payment calculation
  static calculateOvertimePayment(
    regularPayment: number, 
    hoursWorked: number,
    isHoliday: boolean = false,
    config: OvertimeConfig = this.DEFAULT_CONFIG.overtime
  ): number {
    if (hoursWorked <= config.regularHours) return 0;
    
    const overtimeHours = hoursWorked - config.regularHours;
    const hourlyRate = regularPayment / config.regularHours;
    const multiplier = isHoliday ? config.holidayMultiplier : config.overtimeMultiplier;
    
    return parseFloat((overtimeHours * hourlyRate * multiplier).toFixed(2));
  }

  // Comprehensive payment calculation
  static calculateAdvancedPayment(params: {
    rate: number;
    pieces: number;
    efficiency: number;
    qualityScore: number;
    operatorSkill: string;
    requiredSkill: string;
    hoursWorked: number;
    isHoliday?: boolean;
    damageReports?: DamageReport[];
    config?: Partial<PricingConfig>;
  }): PaymentBreakdown {
    const config = { ...this.DEFAULT_CONFIG, ...params.config };
    const details: string[] = [];
    
    // Base payment
    const basePayment = this.calculateBasePayment(params.rate, params.pieces);
    details.push(`Base: ₹${params.rate} × ${params.pieces} pieces = ₹${basePayment}`);
    
    // Efficiency bonus
    const efficiencyBonus = this.calculateEfficiencyBonus(basePayment, params.efficiency, config.efficiencyBonus);
    if (efficiencyBonus > 0) {
      details.push(`Efficiency Bonus (${(params.efficiency * 100).toFixed(1)}%): +₹${efficiencyBonus}`);
    }
    
    // Quality bonus
    const qualityBonus = this.calculateQualityBonus(basePayment, params.qualityScore, config.qualityBonus);
    if (qualityBonus > 0) {
      details.push(`Quality Bonus (${(params.qualityScore * 100).toFixed(1)}%): +₹${qualityBonus}`);
    }
    
    // Quality penalty
    const qualityPenalty = this.calculateQualityPenalty(basePayment, params.qualityScore, config.qualityPenalty);
    if (qualityPenalty > 0) {
      details.push(`Quality Penalty (${(params.qualityScore * 100).toFixed(1)}%): -₹${qualityPenalty}`);
    }
    
    // Skill bonus
    const skillBonus = this.calculateSkillBonus(
      basePayment, 
      params.operatorSkill, 
      params.requiredSkill, 
      config.skillMultipliers
    );
    if (skillBonus > 0) {
      details.push(`Skill Bonus (${params.operatorSkill} > ${params.requiredSkill}): +₹${skillBonus}`);
    }
    
    // Overtime payment
    const overtimePayment = this.calculateOvertimePayment(
      basePayment, 
      params.hoursWorked, 
      params.isHoliday, 
      config.overtime
    );
    if (overtimePayment > 0) {
      details.push(`Overtime (${params.hoursWorked - config.overtime.regularHours}h): +₹${overtimePayment}`);
    }
    
    // Damage penalty
    const damagePenalty = this.calculateDamagePenalty(basePayment, params.damageReports || []);
    if (damagePenalty > 0) {
      details.push(`Damage Penalty: -₹${damagePenalty}`);
    }
    
    // Final calculation
    const finalPayment = Math.max(0, 
      basePayment + 
      efficiencyBonus + 
      qualityBonus + 
      skillBonus + 
      overtimePayment - 
      qualityPenalty - 
      damagePenalty
    );
    
    return {
      basePayment,
      efficiencyBonus,
      qualityBonus,
      skillBonus,
      overtimePayment,
      damagePenalty: qualityPenalty + damagePenalty,
      finalPayment: parseFloat(finalPayment.toFixed(2)),
      details
    };
  }

  // Efficiency calculation from time
  static calculateEfficiency(actualTime: number, standardTime: number): number {
    return parseFloat((standardTime / actualTime).toFixed(3));
  }

  // Productivity calculation
  static calculateProductivity(completedPieces: number, timeSpent: number): number {
    // Pieces per hour
    return parseFloat((completedPieces / (timeSpent / 60)).toFixed(2));
  }

  // Estimate completion time for bundle
  static estimateBundleCompletionTime(
    operations: Array<{SAM: number}>, 
    pieces: number, 
    operatorEfficiency: number = 1.0
  ): number {
    const totalSAM = operations.reduce((sum, op) => sum + op.SAM, 0);
    const standardTime = totalSAM * pieces;
    return Math.round(standardTime / operatorEfficiency);
  }

  // Cost analysis for article template
  static analyzeCosts(template: {
    operations: Array<{SAM: number, rate: number}>,
    estimatedPieces: number
  }) {
    const totalSAM = template.operations.reduce((sum, op) => sum + op.SAM, 0);
    const totalRate = template.operations.reduce((sum, op) => sum + op.rate, 0);
    const bundleCost = totalRate * template.estimatedPieces;
    const costPerMinute = bundleCost / totalSAM;
    
    return {
      totalSAM,
      totalRate,
      bundleCost,
      costPerMinute: parseFloat(costPerMinute.toFixed(3)),
      estimatedTime: totalSAM * template.estimatedPieces,
      operationsCount: template.operations.length
    };
  }
}