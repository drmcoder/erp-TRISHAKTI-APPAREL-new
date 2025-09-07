// Business Logic Layer for Management/Admin Operations
// Handles strategic decisions, resource allocation, performance analysis, and system-wide optimizations

import { 
  Supervisor, 
  Operator, 
  Bundle,
  WorkItem,
  ProductionLine,
  ManagementUser 
} from '../../../types/entities';
import { supervisorService } from '../../../services/entities/supervisor-service';
import { operatorService } from '../../../services/entities/operator-service';
import { bundleService } from '../../../services/entities/bundle-service';

export interface ManagementBusinessRuleResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations?: string[];
}

export interface ResourceAllocationDecision {
  canAllocate: boolean;
  optimizedDistribution: {
    lineId: string;
    allocatedOperators: number;
    expectedEfficiency: number;
    predictedOutput: number;
  }[];
  riskFactors: string[];
  expectedROI: number;
  timeToBreakeven?: number;
}

export interface StrategicMetrics {
  overallProductivity: number;
  profitability: number;
  customerSatisfactionScore: number;
  operatorRetentionRate: number;
  qualityTrendAnalysis: 'improving' | 'declining' | 'stable';
  recommendedInvestments: string[];
  criticalIssues: string[];
  opportunityAreas: string[];
}

export interface BudgetApprovalDecision {
  approved: boolean;
  approvedAmount: number;
  conditions: string[];
  paybackPeriod: number;
  riskAssessment: 'low' | 'medium' | 'high';
  alternatives?: string[];
}

export interface CompanyPerformanceAnalysis {
  financialHealth: number;
  operationalEfficiency: number;
  marketPosition: number;
  growthPotential: number;
  recommendedActions: string[];
  criticalMetrics: {
    metric: string;
    current: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
  }[];
}

export class ManagementBusinessLogic {
  
  // Strategic Resource Allocation Logic
  static evaluateResourceAllocation(
    availableOperators: Operator[],
    productionLines: ProductionLine[],
    pendingBundles: Bundle[],
    marketDemand: {
      articleTypes: string[];
      urgency: number;
      profitMargin: number;
    }[]
  ): ResourceAllocationDecision {
    const riskFactors: string[] = [];
    const optimizedDistribution: any[] = [];
    let totalExpectedROI = 0;

    // Sort bundles by profitability and urgency
    const prioritizedBundles = pendingBundles.sort((a, b) => {
      const aPriority = this.calculateBundlePriority(a, marketDemand);
      const bPriority = this.calculateBundlePriority(b, marketDemand);
      return bPriority - aPriority;
    });

    // Analyze operator utilization across lines
    const operatorsBySkill = this.groupOperatorsBySkill(availableOperators);
    
    for (const line of productionLines) {
      const suitableOperators = availableOperators.filter(op => 
        op.machineTypes.includes(line.machineType) && 
        op.currentStatus === 'idle'
      );

      if (suitableOperators.length === 0) {
        riskFactors.push(`No available operators for ${line.name}`);
        continue;
      }

      // Calculate optimal operator count based on line capacity
      const optimalOperatorCount = Math.min(
        suitableOperators.length,
        line.maxOperators,
        Math.ceil(line.targetEfficiency * line.maxOperators)
      );

      // Select best operators for this line
      const selectedOperators = suitableOperators
        .sort((a, b) => (b.averageEfficiency * b.qualityScore) - (a.averageEfficiency * a.qualityScore))
        .slice(0, optimalOperatorCount);

      // Calculate expected performance
      const avgEfficiency = selectedOperators.reduce((sum, op) => sum + op.averageEfficiency, 0) / selectedOperators.length;
      const predictedOutput = optimalOperatorCount * avgEfficiency * line.hoursPerDay * line.averageRatePerHour;
      
      optimizedDistribution.push({
        lineId: line.id!,
        allocatedOperators: optimalOperatorCount,
        expectedEfficiency: avgEfficiency,
        predictedOutput
      });

      totalExpectedROI += predictedOutput * line.profitMarginPerPiece;
    }

    // Risk assessment
    const underutilizedLines = optimizedDistribution.filter(dist => dist.allocatedOperators < 3);
    if (underutilizedLines.length > 0) {
      riskFactors.push(`${underutilizedLines.length} production lines under-utilized`);
    }

    const overutilizedOperators = availableOperators.filter(op => 
      op.realtimeStatus?.currentWorkItems > op.maxConcurrentWork * 0.9
    );
    if (overutilizedOperators.length > availableOperators.length * 0.3) {
      riskFactors.push('Over 30% of operators at maximum capacity');
    }

    return {
      canAllocate: optimizedDistribution.length > 0,
      optimizedDistribution,
      riskFactors,
      expectedROI: totalExpectedROI,
      timeToBreakeven: totalExpectedROI > 0 ? 30 : undefined // Simplified calculation
    };
  }

  // Budget Approval Decision Logic
  static evaluateBudgetRequest(
    request: {
      category: 'equipment' | 'training' | 'infrastructure' | 'technology' | 'expansion';
      amount: number;
      justification: string;
      expectedBenefits: string[];
      timeline: number; // months
      departmentId: string;
    },
    currentBudget: {
      total: number;
      allocated: number;
      remaining: number;
    },
    historicalPerformance: {
      previousRequestsROI: number[];
      departmentEfficiency: number;
      pastBudgetUtilization: number;
    }
  ): BudgetApprovalDecision {
    const conditions: string[] = [];
    const alternatives: string[] = [];
    let riskAssessment: 'low' | 'medium' | 'high' = 'medium';

    // Budget availability check
    if (request.amount > currentBudget.remaining) {
      return {
        approved: false,
        approvedAmount: 0,
        conditions: [`Request exceeds available budget by ₹${request.amount - currentBudget.remaining}`],
        paybackPeriod: 0,
        riskAssessment: 'high',
        alternatives: [
          'Request budget reallocation from other departments',
          'Phase the investment over multiple quarters',
          'Seek partial approval for critical components only'
        ]
      };
    }

    // Category-specific evaluation
    let baseApprovalThreshold = 0.7;
    let expectedPayback = 12; // months

    switch (request.category) {
      case 'equipment':
        // Equipment typically has good ROI
        baseApprovalThreshold = 0.6;
        expectedPayback = 8;
        if (request.amount > 100000) {
          conditions.push('Requires detailed equipment ROI analysis');
          conditions.push('Must include maintenance cost projections');
        }
        break;
        
      case 'training':
        // Training has long-term benefits
        baseApprovalThreshold = 0.8;
        expectedPayback = 18;
        conditions.push('Must track skill improvement metrics');
        conditions.push('Require training completion certificates');
        break;
        
      case 'technology':
        // Technology can have high impact but also high risk
        baseApprovalThreshold = 0.7;
        expectedPayback = 10;
        if (request.amount > 200000) {
          conditions.push('Pilot implementation required first');
          conditions.push('Vendor support agreement mandatory');
        }
        break;
        
      case 'infrastructure':
        // Infrastructure is long-term investment
        baseApprovalThreshold = 0.5;
        expectedPayback = 24;
        conditions.push('Must improve overall facility efficiency');
        break;
        
      case 'expansion':
        // Expansion requires careful market analysis
        baseApprovalThreshold = 0.8;
        expectedPayback = 15;
        conditions.push('Market demand analysis required');
        conditions.push('Gradual rollout plan mandatory');
        break;
    }

    // Historical performance assessment
    const avgHistoricalROI = historicalPerformance.previousRequestsROI.length > 0 ?
      historicalPerformance.previousRequestsROI.reduce((a, b) => a + b, 0) / historicalPerformance.previousRequestsROI.length : 0.5;

    if (avgHistoricalROI < 0.3) {
      riskAssessment = 'high';
      baseApprovalThreshold += 0.2;
      conditions.push('Enhanced monitoring and reporting required due to low historical ROI');
    } else if (avgHistoricalROI > 0.8) {
      riskAssessment = 'low';
      baseApprovalThreshold -= 0.1;
    }

    // Department efficiency factor
    if (historicalPerformance.departmentEfficiency < 0.7) {
      conditions.push('Department must improve efficiency metrics before additional investment');
      baseApprovalThreshold += 0.15;
    }

    // Budget utilization history
    if (historicalPerformance.pastBudgetUtilization < 0.8) {
      conditions.push('Must improve budget utilization (currently ' + 
        Math.round(historicalPerformance.pastBudgetUtilization * 100) + '%)');
      riskAssessment = 'medium';
    }

    // Amount-based risk assessment
    const budgetPercentage = request.amount / currentBudget.total;
    if (budgetPercentage > 0.3) {
      riskAssessment = 'high';
      conditions.push('Large investment requires board approval');
      conditions.push('Phased implementation plan required');
    } else if (budgetPercentage < 0.05) {
      riskAssessment = 'low';
    }

    // Final approval decision
    const approvalScore = (avgHistoricalROI + historicalPerformance.departmentEfficiency + 
                          historicalPerformance.pastBudgetUtilization) / 3;
    
    const approved = approvalScore >= baseApprovalThreshold;
    const approvedAmount = approved ? request.amount : 
                          Math.min(request.amount * 0.5, currentBudget.remaining * 0.2);

    if (!approved && approvedAmount > 0) {
      alternatives.push(`Partial approval of ₹${approvedAmount} available`);
      alternatives.push('Resubmit with improved justification and reduced scope');
    }

    return {
      approved,
      approvedAmount: approved ? request.amount : approvedAmount,
      conditions,
      paybackPeriod: expectedPayback,
      riskAssessment,
      alternatives: !approved ? alternatives : undefined
    };
  }

  // Strategic Performance Analysis
  static analyzeCompanyPerformance(
    operationalData: {
      totalOperators: number;
      activeOperators: number;
      averageEfficiency: number;
      qualityScore: number;
      onTimeDelivery: number;
      customerSatisfactionScore: number;
    },
    financialData: {
      revenue: number;
      costs: number;
      profitMargin: number;
      budgetUtilization: number;
    },
    marketData: {
      marketShare: number;
      competitorAnalysis: number;
      growthRate: number;
      customerRetentionRate: number;
    },
    trends: {
      efficiencyTrend: 'up' | 'down' | 'stable';
      qualityTrend: 'up' | 'down' | 'stable';
      profitabilityTrend: 'up' | 'down' | 'stable';
    }
  ): CompanyPerformanceAnalysis {
    const recommendedActions: string[] = [];
    const criticalMetrics: any[] = [];

    // Financial Health Score (0-100)
    const profitabilityScore = Math.min(financialData.profitMargin * 100, 100);
    const budgetEfficiencyScore = financialData.budgetUtilization * 100;
    const financialHealth = (profitabilityScore + budgetEfficiencyScore) / 2;

    // Operational Efficiency Score (0-100)
    const operatorUtilization = (operationalData.activeOperators / operationalData.totalOperators) * 100;
    const efficiencyScore = operationalData.averageEfficiency * 100;
    const qualityScore = operationalData.qualityScore * 100;
    const deliveryScore = operationalData.onTimeDelivery * 100;
    const operationalEfficiency = (operatorUtilization + efficiencyScore + qualityScore + deliveryScore) / 4;

    // Market Position Score (0-100)
    const marketPositionScore = marketData.marketShare * 100;
    const competitiveScore = marketData.competitorAnalysis * 100;
    const customerScore = (operationalData.customerSatisfactionScore / 5) * 100;
    const retentionScore = marketData.customerRetentionRate * 100;
    const marketPosition = (marketPositionScore + competitiveScore + customerScore + retentionScore) / 4;

    // Growth Potential Score (0-100)
    const growthScore = Math.min(marketData.growthRate * 10, 100);
    const trendBonus = this.calculateTrendScore(trends);
    const growthPotential = Math.min(growthScore + trendBonus, 100);

    // Generate recommendations based on scores
    if (financialHealth < 60) {
      recommendedActions.push('Implement cost reduction strategies');
      recommendedActions.push('Review pricing strategy and profit margins');
      recommendedActions.push('Optimize resource allocation');
      
      criticalMetrics.push({
        metric: 'Financial Health',
        current: Math.round(financialHealth),
        target: 75,
        trend: trends.profitabilityTrend
      });
    }

    if (operationalEfficiency < 70) {
      recommendedActions.push('Invest in operator training and development');
      recommendedActions.push('Upgrade equipment and technology');
      recommendedActions.push('Implement lean manufacturing principles');
      
      criticalMetrics.push({
        metric: 'Operational Efficiency',
        current: Math.round(operationalEfficiency),
        target: 85,
        trend: trends.efficiencyTrend
      });
    }

    if (marketPosition < 65) {
      recommendedActions.push('Enhance customer relationship management');
      recommendedActions.push('Improve product quality and delivery times');
      recommendedActions.push('Develop competitive market strategies');
      
      criticalMetrics.push({
        metric: 'Market Position',
        current: Math.round(marketPosition),
        target: 80,
        trend: 'stable'
      });
    }

    if (growthPotential < 50) {
      recommendedActions.push('Explore new market opportunities');
      recommendedActions.push('Invest in innovation and product development');
      recommendedActions.push('Consider strategic partnerships or acquisitions');
    }

    // Specific operational recommendations
    if (operationalData.averageEfficiency < 0.75) {
      recommendedActions.push('Conduct efficiency improvement workshops');
    }

    if (operationalData.qualityScore < 0.85) {
      recommendedActions.push('Implement comprehensive quality management system');
    }

    if (operationalData.onTimeDelivery < 0.9) {
      recommendedActions.push('Improve production planning and scheduling');
    }

    return {
      financialHealth: Math.round(financialHealth),
      operationalEfficiency: Math.round(operationalEfficiency),
      marketPosition: Math.round(marketPosition),
      growthPotential: Math.round(growthPotential),
      recommendedActions,
      criticalMetrics
    };
  }

  // Expansion Decision Logic
  static evaluateExpansionOpportunity(
    opportunity: {
      type: 'new_location' | 'new_product_line' | 'market_expansion' | 'capacity_expansion';
      investmentRequired: number;
      expectedRevenue: number;
      timeToMarket: number; // months
      riskFactors: string[];
      marketDemand: number; // 0-1 scale
    },
    currentCapacity: {
      utilizationRate: number;
      maxCapacity: number;
      currentOutput: number;
    },
    financialPosition: {
      availableCapital: number;
      debtToEquityRatio: number;
      cashFlow: number;
    }
  ): {
    recommendation: 'approve' | 'reject' | 'modify' | 'postpone';
    reasoning: string[];
    modifiedProposal?: any;
    alternativeOptions: string[];
    riskMitigation: string[];
  } {
    const reasoning: string[] = [];
    const alternativeOptions: string[] = [];
    const riskMitigation: string[] = [];
    
    // Financial feasibility check
    if (opportunity.investmentRequired > financialPosition.availableCapital * 0.8) {
      reasoning.push('Investment exceeds 80% of available capital');
      alternativeOptions.push('Seek external financing');
      alternativeOptions.push('Phase the expansion over multiple periods');
      
      return {
        recommendation: 'modify',
        reasoning,
        alternativeOptions,
        riskMitigation: ['Secure financing before proceeding', 'Reduce initial investment scope']
      };
    }

    // Market demand assessment
    if (opportunity.marketDemand < 0.6) {
      reasoning.push('Market demand below acceptable threshold (60%)');
      alternativeOptions.push('Conduct additional market research');
      alternativeOptions.push('Consider different market segments');
      
      return {
        recommendation: 'postpone',
        reasoning,
        alternativeOptions,
        riskMitigation: ['Wait for market conditions to improve', 'Develop demand creation strategies']
      };
    }

    // Capacity utilization check
    if (opportunity.type === 'capacity_expansion' && currentCapacity.utilizationRate < 0.85) {
      reasoning.push('Current capacity not optimally utilized (less than 85%)');
      alternativeOptions.push('Focus on improving current utilization first');
      alternativeOptions.push('Optimize existing operations');
      
      return {
        recommendation: 'postpone',
        reasoning,
        alternativeOptions,
        riskMitigation: ['Achieve 85% utilization before expanding', 'Implement efficiency improvements']
      };
    }

    // ROI calculation
    const expectedROI = (opportunity.expectedRevenue - opportunity.investmentRequired) / opportunity.investmentRequired;
    const annualizedROI = expectedROI / (opportunity.timeToMarket / 12);
    
    if (annualizedROI < 0.15) { // Less than 15% annual ROI
      reasoning.push('Expected ROI below minimum threshold (15% annually)');
      alternativeOptions.push('Revise revenue projections');
      alternativeOptions.push('Reduce investment costs');
      
      return {
        recommendation: 'modify',
        reasoning,
        alternativeOptions,
        riskMitigation: ['Improve cost-benefit analysis', 'Seek higher-margin opportunities']
      };
    }

    // Risk assessment
    const highRiskFactors = opportunity.riskFactors.filter(risk => 
      risk.includes('high') || risk.includes('critical') || risk.includes('uncertain')
    );
    
    if (highRiskFactors.length > 2) {
      reasoning.push('Multiple high-risk factors identified');
      riskMitigation.push('Develop comprehensive risk mitigation plan');
      riskMitigation.push('Create contingency strategies');
      riskMitigation.push('Consider insurance coverage');
    }

    // Debt position check
    if (financialPosition.debtToEquityRatio > 0.6) {
      reasoning.push('High debt-to-equity ratio may limit financing options');
      riskMitigation.push('Consider equity financing over debt');
      riskMitigation.push('Improve debt position before expansion');
    }

    // Final recommendation logic
    reasoning.push(`Strong market demand (${Math.round(opportunity.marketDemand * 100)}%)`);
    reasoning.push(`Good expected ROI (${Math.round(annualizedROI * 100)}% annually)`);
    reasoning.push('Financial position supports investment');
    
    return {
      recommendation: 'approve',
      reasoning,
      alternativeOptions: [],
      riskMitigation
    };
  }

  // Helper Methods
  private static calculateBundlePriority(bundle: Bundle, marketDemand: any[]): number {
    const demandMatch = marketDemand.find(d => d.articleTypes.includes(bundle.articleNumber));
    const urgencyScore = bundle.priority === 'urgent' ? 1.0 : 
                        bundle.priority === 'high' ? 0.8 : 
                        bundle.priority === 'normal' ? 0.5 : 0.2;
    const demandScore = demandMatch ? demandMatch.urgency * demandMatch.profitMargin : 0.3;
    
    return urgencyScore * 0.4 + demandScore * 0.6;
  }

  private static groupOperatorsBySkill(operators: Operator[]): Record<string, Operator[]> {
    return operators.reduce((groups, operator) => {
      const skill = operator.skillLevel;
      if (!groups[skill]) groups[skill] = [];
      groups[skill].push(operator);
      return groups;
    }, {} as Record<string, Operator[]>);
  }

  private static calculateTrendScore(trends: any): number {
    let score = 0;
    Object.values(trends).forEach((trend: any) => {
      if (trend === 'up') score += 10;
      else if (trend === 'down') score -= 5;
      // 'stable' adds 0
    });
    return score;
  }
}

// Export business logic utilities
export const managementBusinessLogic = {
  evaluateResourceAllocation: ManagementBusinessLogic.evaluateResourceAllocation,
  evaluateBudgetRequest: ManagementBusinessLogic.evaluateBudgetRequest,
  analyzeCompanyPerformance: ManagementBusinessLogic.analyzeCompanyPerformance,
  evaluateExpansionOpportunity: ManagementBusinessLogic.evaluateExpansionOpportunity
};