// Integrated Business Service - Connects all business logic layers with data processing
// This is the main service layer that applications should use

import { firebaseIntegration } from './firebase-integration';
import { workflowEngine } from './workflow-engine';
import type { WorkflowDefinition } from './workflow-engine';
import businessLogic from '@/lib/businessLogic';
import { operatorBusinessLogic } from '@/features/operators/business/operator-business-logic';
import { supervisorBusinessLogic } from '@/features/supervisors/business/supervisor-business-logic';
import { managementBusinessLogic } from '@/features/management/business/management-business-logic';

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  metadata?: any;
  workflowId?: string;
}

export interface OperatorWorkflowContext {
  operatorData: any;
  assignmentRequest?: any;
  workItem?: any;
  supervisor?: any;
}

export interface QualityWorkflowContext {
  damageReport: any;
  workItem: any;
  operator: any;
  supervisor: any;
}

// Main Integrated Business Service
export class IntegratedBusinessService {

  // === OPERATOR MANAGEMENT ===

  // Create operator with full workflow
  static async createOperator(operatorData: any): Promise<ServiceResponse<any>> {
    try {
      // Start operator onboarding workflow
      const workflowResult = await workflowEngine.startWorkflow(
        'operator_onboarding',
        { operatorData },
        'normal'
      );

      if (!workflowResult.success) {
        return {
          success: false,
          error: workflowResult.error,
          code: 'WORKFLOW_START_FAILED'
        };
      }

      // Wait for workflow completion (in production, this might be async)
      return await this.waitForWorkflowCompletion(workflowResult.workflowId!);

    } catch (error) {
      console.error('Error in createOperator:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create operator',
        code: 'OPERATOR_CREATION_FAILED'
      };
    }
  }

  // Get operator with performance analysis
  static async getOperatorWithAnalysis(operatorId: string): Promise<ServiceResponse<any>> {
    try {
      // Get basic operator data
      const operatorResult = await firebaseIntegration.operator.getOperatorPerformance(operatorId);
      
      if (!operatorResult.success) {
        return operatorResult;
      }

      const operator = operatorResult.data?.operator;
      const performance = operatorResult.data?.performance;

      // Get promotion eligibility
      const promotionEligibility = operatorBusinessLogic.evaluatePromotion(operator);

      // Get training recommendations
      const trainingRecommendations = operatorBusinessLogic.recommendTraining(operator);

      // Get recent work assignments
      // (This would query Firebase for recent assignments)

      return {
        success: true,
        data: {
          operator,
          performance,
          promotionEligibility,
          trainingRecommendations,
          analysisTimestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Error getting operator analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get operator analysis',
        code: 'OPERATOR_ANALYSIS_FAILED'
      };
    }
  }

  // Update operator with business validation
  static async updateOperator(
    operatorId: string, 
    updates: any, 
    userId?: string
  ): Promise<ServiceResponse<any>> {
    try {
      // Validate updates using business logic
      if (updates.skillLevel || updates.machineTypes || updates.maxConcurrentWork) {
        // Create a temporary operator object for validation
        const tempOperator = { id: operatorId, ...updates };
        const validation = operatorBusinessLogic.validateOperatorCreation(tempOperator);
        
        if (!validation.isValid) {
          return {
            success: false,
            error: validation.errors.join(', '),
            code: 'VALIDATION_FAILED',
            metadata: { warnings: validation.warnings }
          };
        }
      }

      // Update operator
      const updateResult = await firebaseIntegration.operator.updateOperatorStatus(
        operatorId,
        updates,
        userId
      );

      return updateResult;

    } catch (error) {
      console.error('Error updating operator:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update operator',
        code: 'OPERATOR_UPDATE_FAILED'
      };
    }
  }

  // === WORK ASSIGNMENT ===

  // Process self-assignment with full business logic
  static async processSelfAssignment(
    workItemId: string,
    operatorId: string,
    reason?: string
  ): Promise<ServiceResponse<any>> {
    try {
      // Get work item and operator data
      // (In production, these would be fetched from Firebase)
      const workItem = { id: workItemId, machineType: 'overlock', priority: 'normal' }; // Mock data
      const operator = { id: operatorId, skillLevel: 'intermediate' }; // Mock data
      const supervisor = { id: 'supervisor_1', supervisorLevel: 'senior' }; // Mock data

      // Start work assignment workflow
      const workflowResult = await workflowEngine.startWorkflow(
        'work_assignment',
        {
          workItem,
          operator,
          supervisor,
          assignmentRequest: {
            workItemId,
            operatorId,
            reason,
            requestedAt: new Date()
          }
        },
        'normal'
      );

      if (!workflowResult.success) {
        return {
          success: false,
          error: workflowResult.error,
          code: 'WORKFLOW_START_FAILED'
        };
      }

      return {
        success: true,
        data: {
          message: 'Assignment workflow started',
          workflowId: workflowResult.workflowId
        },
        workflowId: workflowResult.workflowId
      };

    } catch (error) {
      console.error('Error processing self-assignment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process assignment',
        code: 'ASSIGNMENT_PROCESSING_FAILED'
      };
    }
  }

  // Get AI work recommendations for operator
  static async getWorkRecommendations(operatorId: string): Promise<ServiceResponse<any>> {
    try {
      // Get operator data
      // (Mock data for demonstration)
      const operator = {
        id: operatorId,
        machineTypes: ['overlock', 'flatlock'],
        skillLevel: 'advanced',
        averageEfficiency: 0.89,
        qualityScore: 0.94,
        currentAssignments: []
      };

      // Get available work items
      // (Mock data for demonstration)
      const availableWork = [
        {
          id: 'work_1',
          bundleNumber: 'BDL-001',
          operation: 'Side Seam',
          machineType: 'overlock',
          requiredSkillLevel: 'intermediate',
          estimatedDuration: 45,
          priority: 'high',
          complexity: 6
        },
        {
          id: 'work_2',
          bundleNumber: 'BDL-002',
          operation: 'Hem',
          machineType: 'flatlock',
          requiredSkillLevel: 'advanced',
          estimatedDuration: 30,
          priority: 'normal',
          complexity: 7
        }
      ];

      // Generate AI recommendations for each work item
      const recommendations = availableWork.map(workItem => {
        const recommendation = businessLogic.recommendationEngine.generateRecommendations(workItem, operator);
        const matchScore = businessLogic.workAssignmentLogic.calculateMatchScore(workItem, operator);
        
        return {
          workItem,
          recommendation,
          matchScore,
          aiScore: recommendation.match,
          reasons: recommendation.reasons
        };
      });

      // Sort by AI score
      recommendations.sort((a, b) => b.aiScore - a.aiScore);

      return {
        success: true,
        data: {
          operatorId,
          recommendations: recommendations.slice(0, 10), // Top 10 recommendations
          totalAvailable: availableWork.length,
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Error getting work recommendations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get recommendations',
        code: 'RECOMMENDATIONS_FAILED'
      };
    }
  }

  // === QUALITY CONTROL ===

  // Process damage report with full workflow
  static async processDamageReport(damageData: {
    workItemId: string;
    operatorId: string;
    supervisorId: string;
    damageType: string;
    severity: string;
    affectedPieces: number;
    description: string;
    operatorFault: boolean;
  }): Promise<ServiceResponse<any>> {
    try {
      // Get related entities (mock data for demonstration)
      const workItem = {
        id: damageData.workItemId,
        bundleId: 'bundle_1',
        totalPieces: 100,
        completedPieces: 80,
        ratePerPiece: 10,
        isCustomerOrder: true
      };

      const operator = {
        id: damageData.operatorId,
        averageEfficiency: 0.85,
        qualityScore: 0.92
      };

      const supervisor = {
        id: damageData.supervisorId,
        supervisorLevel: 'senior'
      };

      // Start quality control workflow
      const workflowResult = await workflowEngine.startWorkflow(
        'quality_control',
        {
          damageReport: damageData,
          workItem,
          operator,
          supervisor
        },
        'high' // Quality issues are high priority
      );

      if (!workflowResult.success) {
        return {
          success: false,
          error: workflowResult.error,
          code: 'WORKFLOW_START_FAILED'
        };
      }

      return {
        success: true,
        data: {
          message: 'Quality control workflow started',
          workflowId: workflowResult.workflowId
        },
        workflowId: workflowResult.workflowId
      };

    } catch (error) {
      console.error('Error processing damage report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process damage report',
        code: 'DAMAGE_PROCESSING_FAILED'
      };
    }
  }

  // Calculate payment with all business logic
  static async calculateOperatorPayment(
    operatorId: string,
    workCompletions: any[]
  ): Promise<ServiceResponse<any>> {
    try {
      const paymentCalculations = [];
      let totalBasePayment = 0;
      let totalBonuses = 0;
      let totalPenalties = 0;

      for (const completion of workCompletions) {
        // Get damage reports for this work item
        const damageReports = completion.damageReports || [];

        // Calculate payment using comprehensive business logic
        const paymentCalc = businessLogic.paymentLogic.calculateDamageAwarePayment(
          {
            rate: completion.ratePerPiece,
            totalPieces: completion.totalPieces
          },
          {
            piecesCompleted: completion.completedPieces,
            efficiency: completion.efficiency,
            qualityScore: completion.qualityScore
          },
          damageReports
        );

        paymentCalculations.push({
          workItemId: completion.workItemId,
          bundleNumber: completion.bundleNumber,
          calculation: paymentCalc
        });

        totalBasePayment += paymentCalc.basePayment;
        totalBonuses += paymentCalc.bonuses;
        totalPenalties += paymentCalc.penalties;
      }

      const finalPayment = totalBasePayment + totalBonuses - totalPenalties;

      return {
        success: true,
        data: {
          operatorId,
          period: {
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
            endDate: new Date()
          },
          summary: {
            totalBasePayment,
            totalBonuses,
            totalPenalties,
            finalPayment,
            workItemsCompleted: workCompletions.length
          },
          calculations: paymentCalculations,
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Error calculating payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate payment',
        code: 'PAYMENT_CALCULATION_FAILED'
      };
    }
  }

  // === SUPERVISOR FUNCTIONS ===

  // Process assignment approval with business logic
  static async processAssignmentApproval(
    requestId: string,
    supervisorId: string,
    decision: 'approve' | 'reject',
    notes?: string
  ): Promise<ServiceResponse<any>> {
    try {
      const result = await firebaseIntegration.supervisor.processAssignmentApproval(
        requestId,
        supervisorId,
        decision,
        notes
      );

      return result;

    } catch (error) {
      console.error('Error processing assignment approval:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process approval',
        code: 'APPROVAL_PROCESSING_FAILED'
      };
    }
  }

  // Get supervisor dashboard with business analytics
  static async getSupervisorDashboard(supervisorId: string): Promise<ServiceResponse<any>> {
    try {
      const { db } = await import('@/config/firebase');
      const { collection, getDocs, query, where, orderBy, limit } = await import('firebase/firestore');
      
      // Get real supervisor data from Firebase
      const supervisorsRef = collection(db, 'supervisors');
      const supervisorQuery = query(supervisorsRef, where('username', '==', supervisorId), limit(1));
      const supervisorSnapshot = await getDocs(supervisorQuery);
      
      let supervisor: any;
      if (!supervisorSnapshot.empty) {
        const supervisorDoc = supervisorSnapshot.docs[0];
        supervisor = {
          id: supervisorDoc.id,
          ...supervisorDoc.data(),
          name: supervisorDoc.data().name || 'John Smith',
          supervisorLevel: supervisorDoc.data().supervisorLevel || 'senior'
        };
      } else {
        // Create sample supervisor if none exists
        supervisor = {
          id: supervisorId,
          name: 'John Smith',
          supervisorLevel: 'senior',
          username: supervisorId,
          teamMembers: [],
          responsibleLines: ['line1', 'line2']
        };
      }

      // Get real team operators data from Firebase
      const operatorsRef = collection(db, 'operators');
      const operatorsQuery = query(operatorsRef, orderBy('createdAt', 'desc'));
      const operatorsSnapshot = await getDocs(operatorsQuery);
      
      const teamOperators = operatorsSnapshot.empty ? [] : operatorsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unknown Operator',
          averageEfficiency: data.averageEfficiency || 85,
          qualityScore: data.qualityScore || 90,
          isActive: data.isActive || false,
          primaryMachine: data.primaryMachine || 'overlock'
        };
      });

      // Get real production data for team productivity analysis
      const bundlesRef = collection(db, 'production_bundles');
      const bundlesQuery = query(bundlesRef, orderBy('createdAt', 'desc'), limit(50));
      const bundlesSnapshot = await getDocs(bundlesQuery);
      
      const completedWork = bundlesSnapshot.empty ? [] : bundlesSnapshot.docs
        .map(doc => doc.data())
        .filter(bundle => bundle.status === 'completed');
      
      const qualityIncidents = bundlesSnapshot.empty ? [] : bundlesSnapshot.docs
        .map(doc => doc.data())
        .filter(bundle => bundle.qualityIssues && bundle.qualityIssues.length > 0);

      // Calculate team productivity using business logic with real data
      const teamProductivity = supervisorBusinessLogic.analyzeTeamProductivity(
        supervisor,
        teamOperators,
        {
          completedWork,
          qualityIncidents,
          onTimeDeliveries: completedWork.length,
          totalDeliveries: bundlesSnapshot.size || 0
        }
      );

      // Get pending approvals from Firebase (simplified query to avoid index requirement)
      const approvalsRef = collection(db, 'assignment_approvals');
      const approvalsQuery = query(approvalsRef, where('status', '==', 'pending'));
      const approvalsSnapshot = await getDocs(approvalsQuery);
      
      const pendingApprovals = approvalsSnapshot.empty ? [] : approvalsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first in JavaScript

      return {
        success: true,
        data: {
          supervisor,
          teamOperators, // Include actual operators data
          teamProductivity,
          pendingApprovals,
          teamSize: teamOperators.length,
          bundles: bundlesSnapshot.size || 0,
          completedBundles: completedWork.length,
          qualityIncidents: qualityIncidents.length,
          dashboardGeneratedAt: new Date().toISOString(),
          message: teamOperators.length === 0 ? 
            "No operators found. Add operators in Management > Operators to see team data." :
            `Dashboard loaded with ${teamOperators.length} team members and ${bundlesSnapshot.size || 0} production bundles.`
        }
      };

    } catch (error) {
      console.error('Error getting supervisor dashboard:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get dashboard',
        code: 'DASHBOARD_FETCH_FAILED'
      };
    }
  }

  // === MANAGEMENT FUNCTIONS ===

  // Analyze company performance with comprehensive metrics
  static async analyzeCompanyPerformance(): Promise<ServiceResponse<any>> {
    try {
      // Get operational data (would come from database aggregation)
      const operationalData = {
        totalOperators: 50,
        activeOperators: 45,
        averageEfficiency: 0.82,
        qualityScore: 0.88,
        onTimeDelivery: 0.91,
        customerSatisfactionScore: 4.2
      };

      const financialData = {
        revenue: 2500000,
        costs: 1800000,
        profitMargin: 0.28,
        budgetUtilization: 0.85
      };

      const marketData = {
        marketShare: 0.15,
        competitorAnalysis: 0.72,
        growthRate: 0.08,
        customerRetentionRate: 0.89
      };

      const trends = {
        efficiencyTrend: 'up' as const,
        qualityTrend: 'stable' as const,
        profitabilityTrend: 'up' as const
      };

      // Use management business logic for analysis
      const performanceAnalysis = managementBusinessLogic.analyzeCompanyPerformance(
        operationalData,
        financialData,
        marketData,
        trends
      );

      return {
        success: true,
        data: {
          performanceAnalysis,
          rawData: {
            operational: operationalData,
            financial: financialData,
            market: marketData,
            trends
          },
          analysisDate: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Error analyzing company performance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze performance',
        code: 'PERFORMANCE_ANALYSIS_FAILED'
      };
    }
  }

  // === UTILITY FUNCTIONS ===

  // Wait for workflow completion (helper function)
  private static async waitForWorkflowCompletion(
    workflowId: string,
    timeoutMs: number = 30000
  ): Promise<ServiceResponse<any>> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkWorkflow = () => {
        const workflow = workflowEngine.getWorkflow(workflowId);
        
        if (!workflow) {
          resolve({
            success: false,
            error: 'Workflow not found',
            code: 'WORKFLOW_NOT_FOUND'
          });
          return;
        }

        if (workflow.status === 'completed') {
          resolve({
            success: true,
            data: workflow.context,
            workflowId
          });
          return;
        }

        if (workflow.status === 'failed') {
          resolve({
            success: false,
            error: 'Workflow failed',
            code: 'WORKFLOW_FAILED',
            data: workflow.context
          });
          return;
        }

        if (Date.now() - startTime > timeoutMs) {
          resolve({
            success: false,
            error: 'Workflow timeout',
            code: 'WORKFLOW_TIMEOUT'
          });
          return;
        }

        // Check again in 100ms
        setTimeout(checkWorkflow, 100);
      };

      checkWorkflow();
    });
  }

  // Get workflow status
  static getWorkflowStatus(workflowId: string): ServiceResponse<WorkflowDefinition> {
    const workflow = workflowEngine.getWorkflow(workflowId);
    
    if (!workflow) {
      return {
        success: false,
        error: 'Workflow not found',
        code: 'WORKFLOW_NOT_FOUND'
      };
    }

    return {
      success: true,
      data: workflow
    };
  }

  // Subscribe to workflow updates
  static subscribeToWorkflow(
    workflowId: string,
    callback: (workflow: WorkflowDefinition) => void
  ): () => void {
    return workflowEngine.subscribeToWorkflow(workflowId, callback);
  }

  // Get all active workflows
  static getActiveWorkflows(): ServiceResponse<WorkflowDefinition[]> {
    const activeWorkflows = workflowEngine.getWorkflowsByStatus('running');
    
    return {
      success: true,
      data: activeWorkflows
    };
  }
}

// Export the main service
export const integratedBusinessService = IntegratedBusinessService;