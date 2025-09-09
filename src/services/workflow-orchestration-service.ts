// Workflow Orchestration Service
// Handles sequential workflow operations, capacity checking, and smart work assignment

import { pushNotificationService } from './push-notification-service';
import { BaseService } from '../shared/services/base-service';

interface OperatorCapacity {
  operatorId: string;
  operatorName: string;
  machineType: string;
  maxCapacityPerHour: number;
  currentWorkload: number; // Current pieces assigned
  availableCapacity: number; // Available capacity percentage (0-100)
  skills: string[]; // Operations they can perform
  currentShift: 'morning' | 'afternoon' | 'night';
  isOnBreak: boolean;
  isActive: boolean;
}

interface OperationDependency {
  operationId: string;
  operationName: string;
  machineType: string;
  estimatedTimePerPiece: number; // in minutes
  requiredSkills: string[];
  sequenceNumber: number;
  dependsOn?: string[]; // Previous operation IDs that must be completed
}

interface WorkflowStep {
  stepId: string;
  workBundleId: string;
  workItemId?: string;
  operationId: string;
  operationName: string;
  assignedOperatorId?: string;
  completedOperatorId?: string;
  status: 'pending' | 'ready' | 'in_progress' | 'completed' | 'blocked';
  pieces: number;
  completedPieces: number;
  estimatedCompletionTime?: Date;
  actualCompletionTime?: Date;
  dependencies: string[]; // Other stepIds that must complete first
  qualityCheckRequired: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface WorkAssignmentCriteria {
  workBundleId: string;
  operationId: string;
  pieces: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requiredMachineType: string;
  requiredSkills: string[];
  estimatedTimePerPiece: number;
  maxCapacityThreshold: number; // Only assign if operator has less than this % capacity
}

class WorkflowOrchestrationService extends BaseService {
  private operatorCapacities: Map<string, OperatorCapacity> = new Map();
  private workflowSteps: Map<string, WorkflowStep> = new Map();
  private operationDependencies: Map<string, OperationDependency> = new Map();

  constructor() {
    super('workflow-orchestration');
    this.initializeOperationDependencies();
  }

  private initializeOperationDependencies(): void {
    // Define your production line operations and their dependencies
    const operations: OperationDependency[] = [
      {
        operationId: 'cutting',
        operationName: 'Cutting',
        machineType: 'cutting_machine',
        estimatedTimePerPiece: 2,
        requiredSkills: ['cutting'],
        sequenceNumber: 1
      },
      {
        operationId: 'single_needle_1',
        operationName: 'Single Needle - First Pass',
        machineType: 'single_needle',
        estimatedTimePerPiece: 5,
        requiredSkills: ['single_needle', 'basic_sewing'],
        sequenceNumber: 2,
        dependsOn: ['cutting']
      },
      {
        operationId: 'overlock',
        operationName: 'Overlock',
        machineType: 'overlock_machine',
        estimatedTimePerPiece: 3,
        requiredSkills: ['overlock'],
        sequenceNumber: 3,
        dependsOn: ['single_needle_1']
      },
      {
        operationId: 'single_needle_2',
        operationName: 'Single Needle - Second Pass',
        machineType: 'single_needle',
        estimatedTimePerPiece: 4,
        requiredSkills: ['single_needle', 'advanced_sewing'],
        sequenceNumber: 4,
        dependsOn: ['overlock']
      },
      {
        operationId: 'button_hole',
        operationName: 'Button Hole',
        machineType: 'button_hole_machine',
        estimatedTimePerPiece: 2,
        requiredSkills: ['button_hole'],
        sequenceNumber: 5,
        dependsOn: ['single_needle_2']
      },
      {
        operationId: 'finishing',
        operationName: 'Finishing',
        machineType: 'manual',
        estimatedTimePerPiece: 3,
        requiredSkills: ['finishing', 'quality_check'],
        sequenceNumber: 6,
        dependsOn: ['button_hole']
      }
    ];

    operations.forEach(op => {
      this.operationDependencies.set(op.operationId, op);
    });
  }

  // Update operator capacity in real-time
  async updateOperatorCapacity(operatorId: string, currentWorkload: number): Promise<void> {
    const capacity = this.operatorCapacities.get(operatorId);
    if (capacity) {
      capacity.currentWorkload = currentWorkload;
      capacity.availableCapacity = Math.max(0, 100 - (currentWorkload / capacity.maxCapacityPerHour) * 100);
      
      this.operatorCapacities.set(operatorId, capacity);
      
      // Check if this operator can now take more work
      await this.checkForAvailableWork(operatorId);
    }
  }

  // Load operator capacities from database
  async loadOperatorCapacities(): Promise<void> {
    try {
      // This would typically load from your operators database
      const operators = await this.getOperatorsWithCapacity();
      
      operators.forEach(operator => {
        this.operatorCapacities.set(operator.operatorId, operator);
      });
    } catch (error) {
      console.error('Error loading operator capacities:', error);
    }
  }

  // Check if an operation is ready to be worked on
  private areAllDependenciesCompleted(stepId: string): boolean {
    const step = this.workflowSteps.get(stepId);
    if (!step || step.dependencies.length === 0) {
      return true;
    }

    return step.dependencies.every(depStepId => {
      const depStep = this.workflowSteps.get(depStepId);
      return depStep?.status === 'completed';
    });
  }

  // Find qualified operators for an operation
  private findQualifiedOperators(
    machineType: string, 
    requiredSkills: string[], 
    maxCapacityThreshold: number = 80
  ): OperatorCapacity[] {
    const qualifiedOperators: OperatorCapacity[] = [];

    for (const [operatorId, capacity] of this.operatorCapacities) {
      if (
        capacity.machineType === machineType &&
        capacity.isActive &&
        !capacity.isOnBreak &&
        capacity.availableCapacity >= (100 - maxCapacityThreshold) && // Has available capacity
        requiredSkills.every(skill => capacity.skills.includes(skill))
      ) {
        qualifiedOperators.push(capacity);
      }
    }

    // Sort by available capacity (most available first)
    return qualifiedOperators.sort((a, b) => b.availableCapacity - a.availableCapacity);
  }

  // Complete an operation and trigger next operations
  async completeOperation(stepId: string, completedBy: string, piecesCompleted: number): Promise<void> {
    const step = this.workflowSteps.get(stepId);
    if (!step) {
      throw new Error(`Workflow step ${stepId} not found`);
    }

    // Update step completion
    step.status = 'completed';
    step.completedOperatorId = completedBy;
    step.completedPieces = piecesCompleted;
    step.actualCompletionTime = new Date();
    
    this.workflowSteps.set(stepId, step);

    // Update operator capacity
    const operatorCapacity = this.operatorCapacities.get(completedBy);
    if (operatorCapacity) {
      operatorCapacity.currentWorkload = Math.max(0, operatorCapacity.currentWorkload - piecesCompleted);
      await this.updateOperatorCapacity(completedBy, operatorCapacity.currentWorkload);
    }

    // Find and activate dependent operations
    await this.activateDependentOperations(step);

    // Log activity
    await this.logActivity('operation_completed', stepId, {
      operationName: step.operationName,
      operatorId: completedBy,
      piecesCompleted,
      workBundleId: step.workBundleId
    });
  }

  // Activate operations that were waiting for this one to complete
  private async activateDependentOperations(completedStep: WorkflowStep): Promise<void> {
    // Find all steps that depend on this completed step
    const dependentSteps = Array.from(this.workflowSteps.values())
      .filter(step => 
        step.dependencies.includes(completedStep.stepId) && 
        step.status === 'pending'
      );

    for (const dependentStep of dependentSteps) {
      // Check if ALL dependencies are now completed
      if (this.areAllDependenciesCompleted(dependentStep.stepId)) {
        // Mark as ready and find operators
        dependentStep.status = 'ready';
        this.workflowSteps.set(dependentStep.stepId, dependentStep);

        // Get operation details
        const operation = this.operationDependencies.get(dependentStep.operationId);
        if (!operation) continue;

        // Find qualified operators with available capacity
        const qualifiedOperators = this.findQualifiedOperators(
          operation.machineType,
          operation.requiredSkills,
          80 // Only notify operators with less than 80% capacity
        );

        if (qualifiedOperators.length > 0) {
          // Get completed operator name for the notification
          const completedOperator = this.operatorCapacities.get(completedStep.completedOperatorId!);
          
          // Send notifications to qualified operators
          await pushNotificationService.sendSequentialOperationNotification({
            operatorIds: qualifiedOperators.map(op => op.operatorId),
            workBundleId: dependentStep.workBundleId,
            workItemId: dependentStep.workItemId || '',
            previousOperatorId: completedStep.completedOperatorId!,
            previousOperatorName: completedOperator?.operatorName || 'Previous Operator',
            machineType: operation.machineType,
            operation: operation.operationName,
            completedOperation: completedStep.operationName,
            priority: dependentStep.priority
          });

          console.log(`🔔 Sequential notification sent to ${qualifiedOperators.length} operators for ${operation.operationName}`);
        }
      }
    }
  }

  // Smart work assignment considering capacity and priority
  async assignWorkToOperator(criteria: WorkAssignmentCriteria): Promise<{
    success: boolean;
    assignedOperatorId?: string;
    message: string;
  }> {
    const qualifiedOperators = this.findQualifiedOperators(
      criteria.requiredMachineType,
      criteria.requiredSkills,
      criteria.maxCapacityThreshold
    );

    if (qualifiedOperators.length === 0) {
      return {
        success: false,
        message: `No qualified operators available for ${criteria.requiredMachineType}. All operators may be at capacity.`
      };
    }

    // Select the best operator (considering capacity, skills, and priority)
    let selectedOperator = qualifiedOperators[0]; // Start with most available

    // For urgent work, prefer operators with more capacity
    if (criteria.priority === 'urgent') {
      selectedOperator = qualifiedOperators
        .sort((a, b) => b.availableCapacity - a.availableCapacity)[0];
    }

    // Assign the work
    selectedOperator.currentWorkload += criteria.pieces;
    selectedOperator.availableCapacity = Math.max(0, 100 - (selectedOperator.currentWorkload / selectedOperator.maxCapacityPerHour) * 100);
    
    this.operatorCapacities.set(selectedOperator.operatorId, selectedOperator);

    // Send notification to assigned operator
    await pushNotificationService.sendWorkAssignmentNotification({
      operatorId: selectedOperator.operatorId,
      workBundleId: criteria.workBundleId,
      assignmentType: 'new_assignment',
      priority: criteria.priority,
      machineType: criteria.requiredMachineType,
      operation: this.operationDependencies.get(criteria.operationId)?.operationName || 'Operation',
      estimatedTime: criteria.pieces * criteria.estimatedTimePerPiece
    });

    return {
      success: true,
      assignedOperatorId: selectedOperator.operatorId,
      message: `Work assigned to ${selectedOperator.operatorName}. Current capacity: ${selectedOperator.availableCapacity.toFixed(1)}%`
    };
  }

  // Check for available work when an operator's capacity changes
  private async checkForAvailableWork(operatorId: string): Promise<void> {
    const operator = this.operatorCapacities.get(operatorId);
    if (!operator || operator.availableCapacity < 20) { // Only check if they have significant available capacity
      return;
    }

    // Find ready work items that match this operator's skills
    const availableWork = Array.from(this.workflowSteps.values())
      .filter(step => {
        if (step.status !== 'ready' || step.assignedOperatorId) return false;
        
        const operation = this.operationDependencies.get(step.operationId);
        return operation && 
          operation.machineType === operator.machineType &&
          operation.requiredSkills.every(skill => operator.skills.includes(skill));
      })
      .sort((a, b) => {
        // Sort by priority, then by how long it's been waiting
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    if (availableWork.length > 0) {
      const workItem = availableWork[0];
      const operation = this.operationDependencies.get(workItem.operationId);
      
      // Send notification about available work
      await pushNotificationService.sendWorkAssignmentNotification({
        operatorId: operator.operatorId,
        workBundleId: workItem.workBundleId,
        workItemId: workItem.workItemId,
        assignmentType: 'sequential_ready',
        priority: workItem.priority,
        machineType: operator.machineType,
        operation: operation?.operationName || 'Operation'
      });
    }
  }

  // Create workflow steps for a work bundle
  async createWorkflowForBundle(workBundleId: string, operationsNeeded: string[], pieces: number): Promise<void> {
    const steps: WorkflowStep[] = [];
    
    for (let i = 0; i < operationsNeeded.length; i++) {
      const operationId = operationsNeeded[i];
      const operation = this.operationDependencies.get(operationId);
      
      if (!operation) continue;

      const stepId = `${workBundleId}-${operationId}-${Date.now()}`;
      const dependencies = i === 0 ? [] : [`${workBundleId}-${operationsNeeded[i-1]}-${Date.now()}`];
      
      const step: WorkflowStep = {
        stepId,
        workBundleId,
        operationId,
        operationName: operation.operationName,
        status: i === 0 ? 'ready' : 'pending', // First operation is ready, others wait
        pieces,
        completedPieces: 0,
        dependencies,
        qualityCheckRequired: operation.operationName.includes('Finishing'),
        priority: 'normal'
      };

      steps.push(step);
      this.workflowSteps.set(stepId, step);
    }

    // If first operation is ready, find operators for it
    if (steps.length > 0 && steps[0].status === 'ready') {
      const firstStep = steps[0];
      const operation = this.operationDependencies.get(firstStep.operationId);
      
      if (operation) {
        await this.assignWorkToOperator({
          workBundleId,
          operationId: firstStep.operationId,
          pieces,
          priority: 'normal',
          requiredMachineType: operation.machineType,
          requiredSkills: operation.requiredSkills,
          estimatedTimePerPiece: operation.estimatedTimePerPiece,
          maxCapacityThreshold: 80
        });
      }
    }
  }

  // Mock method to get operators with capacity (replace with actual database call)
  private async getOperatorsWithCapacity(): Promise<OperatorCapacity[]> {
    // This would typically load from your database
    return [
      {
        operatorId: 'op1',
        operatorName: 'राम श्रेष्ठ',
        machineType: 'single_needle',
        maxCapacityPerHour: 60,
        currentWorkload: 30,
        availableCapacity: 50,
        skills: ['single_needle', 'basic_sewing', 'advanced_sewing'],
        currentShift: 'morning',
        isOnBreak: false,
        isActive: true
      },
      {
        operatorId: 'op2',
        operatorName: 'सीता तामाङ',
        machineType: 'overlock_machine',
        maxCapacityPerHour: 80,
        currentWorkload: 20,
        availableCapacity: 75,
        skills: ['overlock'],
        currentShift: 'morning',
        isOnBreak: false,
        isActive: true
      }
    ];
  }

  // Get workflow status for a work bundle
  getWorkflowStatus(workBundleId: string): WorkflowStep[] {
    return Array.from(this.workflowSteps.values())
      .filter(step => step.workBundleId === workBundleId)
      .sort((a, b) => {
        const opA = this.operationDependencies.get(a.operationId);
        const opB = this.operationDependencies.get(b.operationId);
        return (opA?.sequenceNumber || 0) - (opB?.sequenceNumber || 0);
      });
  }

  // Get operator workload summary
  getOperatorWorkload(operatorId: string): {
    capacity: OperatorCapacity | null;
    assignedWork: WorkflowStep[];
    pendingWork: WorkflowStep[];
  } {
    const capacity = this.operatorCapacities.get(operatorId) || null;
    const assignedWork = Array.from(this.workflowSteps.values())
      .filter(step => step.assignedOperatorId === operatorId && step.status === 'in_progress');
    const pendingWork = Array.from(this.workflowSteps.values())
      .filter(step => {
        if (step.status !== 'ready' || step.assignedOperatorId) return false;
        const operation = this.operationDependencies.get(step.operationId);
        return operation && capacity && 
          operation.machineType === capacity.machineType &&
          operation.requiredSkills.every(skill => capacity.skills.includes(skill));
      });

    return { capacity, assignedWork, pendingWork };
  }
}

export const workflowOrchestrationService = new WorkflowOrchestrationService();
export { WorkflowOrchestrationService, type OperatorCapacity, type WorkflowStep, type OperationDependency };