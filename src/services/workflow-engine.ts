// Core Workflow Engine - Manages state transitions and business processes
// Implements workflow patterns for TSA ERP operations

import { firebaseIntegration } from './firebase-integration';
import businessLogic from '@/lib/businessLogic';
import { operatorBusinessLogic } from '@/features/operators/business/operator-business-logic';
import { supervisorBusinessLogic } from '@/features/supervisors/business/supervisor-business-logic';
import { managementBusinessLogic } from '@/features/management/business/management-business-logic';

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  dependencies: string[];
  estimatedDuration?: number;
  actualDuration?: number;
  startedAt?: Date;
  completedAt?: Date;
  assignedTo?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  type: 'work_assignment' | 'quality_control' | 'damage_resolution' | 'payment_processing' | 'operator_onboarding';
  steps: WorkflowStep[];
  currentStep: string;
  status: 'initialized' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  context: Record<string, any>;
  notifications: WorkflowNotification[];
}

export interface WorkflowNotification {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: Date;
  recipients: string[];
  read: boolean;
}

export interface WorkflowTransition {
  from: string;
  to: string;
  condition?: (context: any) => boolean;
  action?: (context: any) => Promise<any>;
  validation?: (context: any) => { valid: boolean; errors: string[] };
}

// Base Workflow Engine Class
export class WorkflowEngine {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private transitions: Map<string, WorkflowTransition[]> = new Map();
  private listeners: Map<string, ((workflow: WorkflowDefinition) => void)[]> = new Map();

  // Register a workflow definition
  registerWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow);
  }

  // Register state transitions for a workflow type
  registerTransitions(workflowType: string, transitions: WorkflowTransition[]): void {
    this.transitions.set(workflowType, transitions);
  }

  // Start a new workflow instance
  async startWorkflow(
    workflowType: string,
    context: Record<string, any>,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<{ success: boolean; workflowId?: string; error?: string }> {
    try {
      const workflowId = `${workflowType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const workflow: WorkflowDefinition = {
        id: workflowId,
        name: this.getWorkflowName(workflowType),
        type: workflowType as any,
        steps: this.getWorkflowSteps(workflowType),
        currentStep: this.getWorkflowSteps(workflowType)[0]?.id || '',
        status: 'initialized',
        priority,
        createdAt: new Date(),
        updatedAt: new Date(),
        context,
        notifications: []
      };

      this.workflows.set(workflowId, workflow);
      
      // Start the workflow
      await this.moveToNextStep(workflowId);

      return { success: true, workflowId };

    } catch (error) {
      console.error('Error starting workflow:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to start workflow' 
      };
    }
  }

  // Move workflow to next step
  async moveToNextStep(workflowId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        return { success: false, error: 'Workflow not found' };
      }

      const currentStep = workflow.steps.find(step => step.id === workflow.currentStep);
      if (!currentStep) {
        return { success: false, error: 'Current step not found' };
      }

      // Check dependencies
      const unmetDependencies = currentStep.dependencies.filter(depId => {
        const depStep = workflow.steps.find(s => s.id === depId);
        return depStep?.status !== 'completed';
      });

      if (unmetDependencies.length > 0) {
        return { success: false, error: `Unmet dependencies: ${unmetDependencies.join(', ')}` };
      }

      // Execute step logic
      const stepResult = await this.executeStep(workflow, currentStep);
      
      if (!stepResult.success) {
        currentStep.status = 'failed';
        workflow.status = 'failed';
        this.addNotification(workflow, 'error', stepResult.error || 'Step execution failed');
        return stepResult;
      }

      // Mark current step as completed
      currentStep.status = 'completed';
      currentStep.completedAt = new Date();
      
      if (currentStep.startedAt) {
        currentStep.actualDuration = currentStep.completedAt.getTime() - currentStep.startedAt.getTime();
      }

      // Find next step
      const nextStep = this.findNextStep(workflow);
      
      if (nextStep) {
        workflow.currentStep = nextStep.id;
        nextStep.status = 'in_progress';
        nextStep.startedAt = new Date();
        workflow.status = 'running';
      } else {
        // Workflow completed
        workflow.status = 'completed';
        workflow.completedAt = new Date();
        this.addNotification(workflow, 'success', 'Workflow completed successfully');
      }

      workflow.updatedAt = new Date();
      this.notifyListeners(workflowId, workflow);

      return { success: true };

    } catch (error) {
      console.error('Error moving to next step:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to move to next step' 
      };
    }
  }

  // Execute individual step logic
  private async executeStep(
    workflow: WorkflowDefinition, 
    step: WorkflowStep
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      switch (workflow.type) {
        case 'work_assignment':
          return await this.executeWorkAssignmentStep(workflow, step);
        
        case 'quality_control':
          return await this.executeQualityControlStep(workflow, step);
        
        case 'damage_resolution':
          return await this.executeDamageResolutionStep(workflow, step);
        
        case 'payment_processing':
          return await this.executePaymentProcessingStep(workflow, step);
        
        case 'operator_onboarding':
          return await this.executeOperatorOnboardingStep(workflow, step);
        
        default:
          return { success: false, error: `Unknown workflow type: ${workflow.type}` };
      }

    } catch (error) {
      console.error(`Error executing step ${step.id}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Step execution failed' 
      };
    }
  }

  // Work Assignment Workflow Steps
  private async executeWorkAssignmentStep(
    workflow: WorkflowDefinition,
    step: WorkflowStep
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    const { context } = workflow;

    switch (step.id) {
      case 'validate_assignment':
        // Validate work assignment using business logic
        const validation = operatorBusinessLogic.validateWorkAssignment(
          context.operator,
          {
            machineType: context.workItem.machineType,
            estimatedDuration: context.workItem.estimatedDuration,
            skillRequired: context.workItem.requiredSkillLevel,
            priority: context.workItem.priority
          }
        );

        if (!validation.canAssign) {
          return { success: false, error: validation.reason };
        }

        workflow.context.assignmentValidation = validation;
        return { success: true, data: validation };

      case 'check_supervisor_approval':
        // Check if supervisor approval is required
        const approval = supervisorBusinessLogic.evaluateAssignmentRequest(
          context.assignmentRequest,
          context.supervisor,
          context.operator,
          context.workItem
        );

        workflow.context.approvalDecision = approval;

        if (!approval.shouldAutoApprove) {
          // Require manual approval
          this.addNotification(workflow, 'info', 'Supervisor approval required');
          step.assignedTo = context.supervisor.id;
          return { success: true, data: { requiresApproval: true } };
        }

        return { success: true, data: { requiresApproval: false } };

      case 'assign_work':
        // Actually assign the work
        const assignmentResult = await firebaseIntegration.workAssignment.processSelfAssignment(
          context.workItem.id,
          context.operator.id,
          context.assignmentRequest.reason
        );

        if (!assignmentResult.success) {
          return { success: false, error: assignmentResult.error };
        }

        workflow.context.assignmentResult = assignmentResult.data;
        this.addNotification(workflow, 'success', 'Work assigned successfully');
        return { success: true, data: assignmentResult.data };

      case 'update_realtime_status':
        // Update realtime operator status
        const statusUpdate = await firebaseIntegration.operator.updateOperatorStatus(
          context.operator.id,
          {
            currentStatus: 'working',
            realtimeStatus: {
              status: 'working',
              currentWorkItems: (context.operator.realtimeStatus?.currentWorkItems || 0) + 1,
              lastUpdated: new Date()
            }
          }
        );

        return statusUpdate;

      default:
        return { success: false, error: `Unknown work assignment step: ${step.id}` };
    }
  }

  // Quality Control Workflow Steps
  private async executeQualityControlStep(
    workflow: WorkflowDefinition,
    step: WorkflowStep
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    const { context } = workflow;

    switch (step.id) {
      case 'assess_damage':
        // Assess damage using business logic
        const damageImpact = businessLogic.qualityLogic.calculateDefectImpact(
          context.damageReport.damageType,
          context.damageReport.affectedPieces,
          context.workItem.totalPieces
        );

        workflow.context.damageImpact = damageImpact;
        return { success: true, data: damageImpact };

      case 'determine_supervisor_action':
        // Get supervisor's quality decision
        const qualityDecision = supervisorBusinessLogic.evaluateQualityIssue(
          context.supervisor,
          {
            bundleId: context.workItem.bundleId,
            operatorId: context.operator.id,
            defectType: context.damageReport.damageType,
            severity: context.damageReport.severity,
            affectedPieces: context.damageReport.affectedPieces,
            totalPieces: context.workItem.totalPieces,
            customerOrder: context.workItem.isCustomerOrder || false
          }
        );

        workflow.context.qualityDecision = qualityDecision;
        this.addNotification(workflow, 'info', `Quality action: ${qualityDecision.action}`);
        return { success: true, data: qualityDecision };

      case 'process_payment_impact':
        // Calculate and process payment impact
        const paymentCalculation = businessLogic.paymentLogic.calculateDamageAwarePayment(
          {
            rate: context.workItem.ratePerPiece,
            totalPieces: context.workItem.totalPieces
          },
          {
            piecesCompleted: context.workItem.completedPieces,
            efficiency: context.operator.averageEfficiency,
            qualityScore: context.operator.qualityScore
          },
          [context.damageReport]
        );

        workflow.context.paymentCalculation = paymentCalculation;
        return { success: true, data: paymentCalculation };

      case 'create_damage_report':
        // Create damage report in database
        const damageReportResult = await firebaseIntegration.quality.processDamageReport({
          workItemId: context.workItem.id,
          operatorId: context.operator.id,
          supervisorId: context.supervisor.id,
          damageType: context.damageReport.damageType,
          severity: context.damageReport.severity,
          affectedPieces: context.damageReport.affectedPieces,
          description: context.damageReport.description,
          operatorFault: context.damageReport.operatorFault
        });

        return damageReportResult;

      default:
        return { success: false, error: `Unknown quality control step: ${step.id}` };
    }
  }

  // Damage Resolution Workflow Steps
  private async executeDamageResolutionStep(
    workflow: WorkflowDefinition,
    step: WorkflowStep
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    // Implementation for damage resolution steps
    return { success: true, data: `Damage resolution step ${step.id} executed` };
  }

  // Payment Processing Workflow Steps
  private async executePaymentProcessingStep(
    workflow: WorkflowDefinition,
    step: WorkflowStep
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    // Implementation for payment processing steps
    return { success: true, data: `Payment processing step ${step.id} executed` };
  }

  // Operator Onboarding Workflow Steps
  private async executeOperatorOnboardingStep(
    workflow: WorkflowDefinition,
    step: WorkflowStep
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    const { context } = workflow;

    switch (step.id) {
      case 'validate_operator_data':
        const validation = operatorBusinessLogic.validateOperatorCreation(context.operatorData);
        
        if (!validation.isValid) {
          return { success: false, error: validation.errors.join(', ') };
        }

        workflow.context.validation = validation;
        return { success: true, data: validation };

      case 'create_operator_account':
        const createResult = await firebaseIntegration.operator.createOperator(context.operatorData);
        
        if (!createResult.success) {
          return { success: false, error: createResult.error };
        }

        workflow.context.operatorId = createResult.data?.id;
        return { success: true, data: createResult.data };

      case 'assign_training_tasks':
        const trainingRecommendations = operatorBusinessLogic.recommendTraining({
          ...context.operatorData,
          id: workflow.context.operatorId
        });

        workflow.context.trainingTasks = trainingRecommendations;
        this.addNotification(workflow, 'info', `${trainingRecommendations.length} training tasks assigned`);
        return { success: true, data: trainingRecommendations };

      default:
        return { success: false, error: `Unknown onboarding step: ${step.id}` };
    }
  }

  // Helper methods
  private getWorkflowName(type: string): string {
    const names: Record<string, string> = {
      'work_assignment': 'Work Assignment Process',
      'quality_control': 'Quality Control Process',
      'damage_resolution': 'Damage Resolution Process',
      'payment_processing': 'Payment Processing',
      'operator_onboarding': 'Operator Onboarding'
    };
    return names[type] || type;
  }

  private getWorkflowSteps(type: string): WorkflowStep[] {
    const stepDefinitions: Record<string, WorkflowStep[]> = {
      'work_assignment': [
        {
          id: 'validate_assignment',
          name: 'Validate Assignment',
          status: 'pending',
          dependencies: [],
          estimatedDuration: 1000 // 1 second
        },
        {
          id: 'check_supervisor_approval',
          name: 'Check Supervisor Approval',
          status: 'pending',
          dependencies: ['validate_assignment'],
          estimatedDuration: 5000 // 5 seconds
        },
        {
          id: 'assign_work',
          name: 'Assign Work',
          status: 'pending',
          dependencies: ['check_supervisor_approval'],
          estimatedDuration: 2000 // 2 seconds
        },
        {
          id: 'update_realtime_status',
          name: 'Update Realtime Status',
          status: 'pending',
          dependencies: ['assign_work'],
          estimatedDuration: 1000 // 1 second
        }
      ],
      'quality_control': [
        {
          id: 'assess_damage',
          name: 'Assess Damage Impact',
          status: 'pending',
          dependencies: [],
          estimatedDuration: 2000
        },
        {
          id: 'determine_supervisor_action',
          name: 'Determine Supervisor Action',
          status: 'pending',
          dependencies: ['assess_damage'],
          estimatedDuration: 3000
        },
        {
          id: 'process_payment_impact',
          name: 'Process Payment Impact',
          status: 'pending',
          dependencies: ['determine_supervisor_action'],
          estimatedDuration: 2000
        },
        {
          id: 'create_damage_report',
          name: 'Create Damage Report',
          status: 'pending',
          dependencies: ['process_payment_impact'],
          estimatedDuration: 1000
        }
      ],
      'operator_onboarding': [
        {
          id: 'validate_operator_data',
          name: 'Validate Operator Data',
          status: 'pending',
          dependencies: [],
          estimatedDuration: 1000
        },
        {
          id: 'create_operator_account',
          name: 'Create Operator Account',
          status: 'pending',
          dependencies: ['validate_operator_data'],
          estimatedDuration: 3000
        },
        {
          id: 'assign_training_tasks',
          name: 'Assign Training Tasks',
          status: 'pending',
          dependencies: ['create_operator_account'],
          estimatedDuration: 2000
        }
      ]
    };

    return stepDefinitions[type] || [];
  }

  private findNextStep(workflow: WorkflowDefinition): WorkflowStep | null {
    return workflow.steps.find(step => 
      step.status === 'pending' && 
      step.dependencies.every(depId => {
        const depStep = workflow.steps.find(s => s.id === depId);
        return depStep?.status === 'completed';
      })
    ) || null;
  }

  private addNotification(
    workflow: WorkflowDefinition,
    type: 'info' | 'warning' | 'error' | 'success',
    message: string,
    recipients: string[] = []
  ): void {
    workflow.notifications.push({
      type,
      message,
      timestamp: new Date(),
      recipients,
      read: false
    });
  }

  private notifyListeners(workflowId: string, workflow: WorkflowDefinition): void {
    const listeners = this.listeners.get(workflowId) || [];
    listeners.forEach(listener => {
      try {
        listener(workflow);
      } catch (error) {
        console.error('Error in workflow listener:', error);
      }
    });
  }

  // Public API
  public getWorkflow(workflowId: string): WorkflowDefinition | null {
    return this.workflows.get(workflowId) || null;
  }

  public getAllWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  public subscribeToWorkflow(
    workflowId: string,
    listener: (workflow: WorkflowDefinition) => void
  ): () => void {
    if (!this.listeners.has(workflowId)) {
      this.listeners.set(workflowId, []);
    }
    
    this.listeners.get(workflowId)!.push(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(workflowId) || [];
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  public async cancelWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return { success: false, error: 'Workflow not found' };
    }

    workflow.status = 'cancelled';
    workflow.updatedAt = new Date();
    this.addNotification(workflow, 'warning', 'Workflow cancelled');
    this.notifyListeners(workflowId, workflow);

    return { success: true };
  }

  public getWorkflowsByStatus(status: WorkflowDefinition['status']): WorkflowDefinition[] {
    return Array.from(this.workflows.values()).filter(w => w.status === status);
  }

  public getWorkflowsByType(type: WorkflowDefinition['type']): WorkflowDefinition[] {
    return Array.from(this.workflows.values()).filter(w => w.type === type);
  }

  public cleanup(): void {
    this.workflows.clear();
    this.transitions.clear();
    this.listeners.clear();
  }
}

// Export singleton instance
export const workflowEngine = new WorkflowEngine();