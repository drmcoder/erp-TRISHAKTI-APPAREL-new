// Template to Work Item Conversion System
// Converts garment templates into live production work items

import { 
  GARMENT_WORKFLOWS, 
  SEWING_OPERATIONS, 
  MACHINE_TYPES,
  ProductionConfigUtils,
  GarmentOperation 
} from '@/config/production-config';

export interface WorkItem {
  id: string;
  bundleId: string;
  operationId: string;
  operationName: string;
  machineType: string;
  assignedOperator?: string;
  status: 'pending' | 'ready' | 'in_progress' | 'completed' | 'quality_check' | 'rework';
  completedPieces: number;
  totalPieces: number;
  estimatedTime: number; // in minutes
  actualTime?: number;
  sequence: number;
  dependencies: string[];
  startTime?: Date;
  completedTime?: Date;
  qualityCheckRequired: boolean;
  qualityScore?: number;
  defectCount?: number;
  rate: number; // payment per piece
  skillRequired: string;
  complexity: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductionBundle {
  id: string;
  bundleNumber: string;
  garmentType: string;
  articleNumber: string;
  color: string;
  size: string;
  quantity: number;
  workItems: WorkItem[];
  currentOperation?: string;
  completedOperations: string[];
  status: 'planning' | 'in_progress' | 'completed' | 'quality_check' | 'shipped';
  assignedOperators: string[];
  estimatedCompletionTime: number;
  actualCompletionTime?: number;
  startDate?: Date;
  dueDate: Date;
  completedDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  qualityCheckpoints: string[];
  overallProgress: number; // percentage
  createdAt: Date;
  updatedAt: Date;
}

export interface BundleCreationRequest {
  garmentType: string; // 't_shirt', 'polo_shirt', etc.
  articleNumber: string;
  color: string;
  size: string;
  quantity: number;
  dueDate: Date;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  customOperations?: Partial<GarmentOperation>[]; // override default operations
}

class TemplateToWorkConverter {
  
  // Convert garment template to production bundle with work items
  createBundleFromTemplate(request: BundleCreationRequest): ProductionBundle {
    const { garmentType, articleNumber, color, size, quantity, dueDate, priority = 'medium' } = request;
    
    // Get workflow definition
    const workflow = GARMENT_WORKFLOWS[garmentType];
    if (!workflow) {
      throw new Error(`Garment type '${garmentType}' not found in workflows`);
    }

    // Generate unique bundle ID
    const bundleId = this.generateBundleId(garmentType, articleNumber);
    const bundleNumber = this.generateBundleNumber(garmentType, articleNumber, color, size);

    // Convert operations to work items
    const workItems = this.createWorkItemsFromOperations(
      bundleId,
      workflow.operations,
      quantity,
      request.customOperations
    );

    // Calculate estimated completion time
    const estimatedTime = ProductionConfigUtils.calculateTotalTime(garmentType);

    const bundle: ProductionBundle = {
      id: bundleId,
      bundleNumber,
      garmentType,
      articleNumber,
      color,
      size,
      quantity,
      workItems,
      completedOperations: [],
      status: 'planning',
      assignedOperators: [],
      estimatedCompletionTime: estimatedTime,
      dueDate,
      priority,
      qualityCheckpoints: workflow.qualityCheckpoints,
      overallProgress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return bundle;
  }

  // Create work items from operation list
  private createWorkItemsFromOperations(
    bundleId: string, 
    operationIds: string[], 
    quantity: number,
    customOperations?: Partial<GarmentOperation>[]
  ): WorkItem[] {
    const workItems: WorkItem[] = [];

    operationIds.forEach((operationId, index) => {
      const operation = SEWING_OPERATIONS[operationId];
      if (!operation) {
        console.warn(`Operation '${operationId}' not found in operations library`);
        return;
      }

      // Check for custom operation overrides
      const customOp = customOperations?.find(custom => custom.id === operationId);
      const finalOperation = customOp ? { ...operation, ...customOp } : operation;

      const workItem: WorkItem = {
        id: `${bundleId}_${operationId}`,
        bundleId,
        operationId: finalOperation.id!,
        operationName: finalOperation.name!,
        machineType: finalOperation.machineType!,
        status: 'pending',
        completedPieces: 0,
        totalPieces: quantity,
        estimatedTime: finalOperation.estimatedTime!,
        sequence: finalOperation.sequence!,
        dependencies: finalOperation.dependencies || [],
        qualityCheckRequired: finalOperation.qualityCheckpoint || false,
        rate: finalOperation.rate!,
        skillRequired: finalOperation.skillRequired!,
        complexity: finalOperation.complexity!,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      workItems.push(workItem);
    });

    return workItems.sort((a, b) => a.sequence - b.sequence);
  }

  // Update work item status and handle workflow progression
  updateWorkItemStatus(
    bundle: ProductionBundle, 
    operationId: string, 
    status: WorkItem['status'],
    completedPieces?: number,
    qualityScore?: number,
    operatorId?: string
  ): ProductionBundle {
    const workItem = bundle.workItems.find(item => item.operationId === operationId);
    if (!workItem) {
      throw new Error(`Work item '${operationId}' not found in bundle`);
    }

    // Update work item
    workItem.status = status;
    workItem.updatedAt = new Date();
    
    if (completedPieces !== undefined) {
      workItem.completedPieces = completedPieces;
    }
    
    if (qualityScore !== undefined) {
      workItem.qualityScore = qualityScore;
    }
    
    if (operatorId) {
      workItem.assignedOperator = operatorId;
      if (!bundle.assignedOperators.includes(operatorId)) {
        bundle.assignedOperators.push(operatorId);
      }
    }

    // Handle status transitions
    switch (status) {
      case 'in_progress':
        workItem.startTime = new Date();
        break;
        
      case 'completed':
        workItem.completedTime = new Date();
        workItem.completedPieces = workItem.totalPieces;
        
        // Add to completed operations
        if (!bundle.completedOperations.includes(operationId)) {
          bundle.completedOperations.push(operationId);
        }
        
        // Update next available operations
        this.updateNextAvailableOperations(bundle);
        break;
    }

    // Update overall bundle progress
    bundle.overallProgress = this.calculateBundleProgress(bundle);
    bundle.updatedAt = new Date();

    // Check if bundle is completed
    if (this.isBundleCompleted(bundle)) {
      bundle.status = 'completed';
      bundle.completedDate = new Date();
    }

    return bundle;
  }

  // Get next available operations based on dependencies
  getNextAvailableOperations(bundle: ProductionBundle): WorkItem[] {
    return bundle.workItems.filter(workItem => {
      // Skip if already completed or in progress
      if (['completed', 'in_progress'].includes(workItem.status)) {
        return false;
      }

      // Check if all dependencies are completed
      if (workItem.dependencies.length > 0) {
        return workItem.dependencies.every(depId => 
          bundle.completedOperations.includes(depId)
        );
      }

      return true;
    });
  }

  // Update status of operations that are now ready
  private updateNextAvailableOperations(bundle: ProductionBundle): void {
    const nextOperations = this.getNextAvailableOperations(bundle);
    
    nextOperations.forEach(workItem => {
      if (workItem.status === 'pending') {
        workItem.status = 'ready';
        workItem.updatedAt = new Date();
      }
    });
  }

  // Calculate bundle completion percentage
  private calculateBundleProgress(bundle: ProductionBundle): number {
    const totalOperations = bundle.workItems.length;
    const completedOperations = bundle.workItems.filter(item => item.status === 'completed').length;
    
    return totalOperations > 0 ? Math.round((completedOperations / totalOperations) * 100) : 0;
  }

  // Check if bundle is fully completed
  private isBundleCompleted(bundle: ProductionBundle): boolean {
    return bundle.workItems.every(item => item.status === 'completed');
  }

  // Get work items ready for assignment to operators
  getAssignableWorkItems(bundle: ProductionBundle, operatorSkillLevel: string): WorkItem[] {
    return this.getNextAvailableOperations(bundle).filter(workItem => {
      // Check if operator has required skill level
      return ProductionConfigUtils.canOperatorPerformOperation(
        operatorSkillLevel,
        workItem.operationId
      );
    });
  }

  // Generate unique bundle ID
  private generateBundleId(garmentType: string, articleNumber: string): string {
    const timestamp = Date.now();
    const garmentCode = garmentType.substring(0, 3).toUpperCase();
    const articleCode = articleNumber.substring(0, 3).toUpperCase();
    
    return `${garmentCode}_${articleCode}_${timestamp}`;
  }

  // Generate human-readable bundle number
  private generateBundleNumber(
    garmentType: string, 
    articleNumber: string, 
    color: string, 
    size: string
  ): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const garmentCode = garmentType.substring(0, 2).toUpperCase();
    const colorCode = color.substring(0, 2).toUpperCase();
    
    return `${garmentCode}${dateStr}${articleNumber}${colorCode}${size}`;
  }

  // Get bundle production summary
  getBundleSummary(bundle: ProductionBundle): {
    totalOperations: number;
    completedOperations: number;
    inProgressOperations: number;
    pendingOperations: number;
    estimatedRemainingTime: number;
    qualityIssues: number;
    efficiency: number;
  } {
    const workItems = bundle.workItems;
    const completed = workItems.filter(item => item.status === 'completed');
    const inProgress = workItems.filter(item => item.status === 'in_progress');
    const pending = workItems.filter(item => ['pending', 'ready'].includes(item.status));
    
    const qualityIssues = workItems.filter(item => 
      item.qualityScore !== undefined && item.qualityScore < 80
    ).length;

    const totalEstimatedTime = workItems.reduce((sum, item) => sum + item.estimatedTime, 0);
    const completedTime = completed.reduce((sum, item) => sum + (item.actualTime || item.estimatedTime), 0);
    const remainingEstimatedTime = pending.reduce((sum, item) => sum + item.estimatedTime, 0);
    
    const efficiency = totalEstimatedTime > 0 ? (completedTime / totalEstimatedTime) * 100 : 0;

    return {
      totalOperations: workItems.length,
      completedOperations: completed.length,
      inProgressOperations: inProgress.length,
      pendingOperations: pending.length,
      estimatedRemainingTime: remainingEstimatedTime,
      qualityIssues,
      efficiency: Math.round(efficiency)
    };
  }
}

// Create singleton instance
export const templateToWorkConverter = new TemplateToWorkConverter();

// Export types and utilities
export type { BundleCreationRequest, ProductionBundle, WorkItem };
export { ProductionConfigUtils };