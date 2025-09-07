// src/services/entities/work-item-service.ts
import { EnhancedBaseFirebaseService } from '../../infrastructure/firebase/base-service';
import { COLLECTIONS } from '../../config/firebase';
import type { WorkItem } from '../../types/entities';
import type { ServiceResponse, QueryOptions, ServiceConfig } from '../../types/service-types';

export class WorkItemService extends EnhancedBaseFirebaseService<WorkItem> {
  constructor(config?: Partial<ServiceConfig>) {
    super(COLLECTIONS.WORK_ITEMS, config);
  }

  // Custom validation for work items
  protected validate(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.bundleNumber || typeof data.bundleNumber !== 'string') {
      errors.push('Bundle number is required and must be a string');
    }

    if (!data.operation || typeof data.operation !== 'string') {
      errors.push('Operation is required and must be a string');
    }

    if (!data.pieces || typeof data.pieces !== 'number' || data.pieces <= 0) {
      errors.push('Pieces must be a positive number');
    }

    if (!data.rate || typeof data.rate !== 'number' || data.rate <= 0) {
      errors.push('Rate must be a positive number');
    }

    if (data.status && !['pending', 'assigned', 'self_assigned', 'in_progress', 'completed', 'cancelled', 'on_hold'].includes(data.status)) {
      errors.push('Invalid status value');
    }

    if (data.paymentStatus && !['PENDING', 'HELD_FOR_DAMAGE', 'RELEASED', 'PAID'].includes(data.paymentStatus)) {
      errors.push('Invalid payment status value');
    }

    return { valid: errors.length === 0, errors };
  }

  // Get work items by status
  async getByStatus(status: WorkItem['status'], options?: QueryOptions): Promise<ServiceResponse<WorkItem[]>> {
    return this.getWhere('status', '==', status, options);
  }

  // Get work items assigned to operator
  async getAssignedToOperator(operatorId: string, options?: QueryOptions): Promise<ServiceResponse<WorkItem[]>> {
    return this.getWhere('operatorId', '==', operatorId, {
      ...options,
      where: [
        { field: 'operatorId', operator: '==', value: operatorId },
        { field: 'status', operator: 'in', value: ['assigned', 'self_assigned', 'in_progress'] }
      ]
    });
  }

  // Get work items by bundle
  async getByBundle(bundleNumber: string, options?: QueryOptions): Promise<ServiceResponse<WorkItem[]>> {
    return this.getWhere('bundleNumber', '==', bundleNumber, options);
  }

  // Get pending work items (available for assignment)
  async getPendingWorkItems(options?: QueryOptions): Promise<ServiceResponse<WorkItem[]>> {
    return this.getWhere('status', '==', 'pending', options);
  }

  // Get work items by operation
  async getByOperation(operation: string, options?: QueryOptions): Promise<ServiceResponse<WorkItem[]>> {
    return this.getWhere('operation', '==', operation, options);
  }

  // Get work items by payment status
  async getByPaymentStatus(paymentStatus: WorkItem['paymentStatus'], options?: QueryOptions): Promise<ServiceResponse<WorkItem[]>> {
    return this.getWhere('paymentStatus', '==', paymentStatus, options);
  }

  // Get work items requiring rework
  async getWorkItemsRequiringRework(options?: QueryOptions): Promise<ServiceResponse<WorkItem[]>> {
    return this.getWhere('reworkRequired', '==', true, options);
  }

  // Self-assign work item to operator
  async selfAssignWorkItem(workItemId: string, operatorId: string, userId?: string): Promise<ServiceResponse<WorkItem>> {
    // First check if work item is available
    const workItem = await this.getById(workItemId);
    if (!workItem.success || !workItem.data) {
      return workItem;
    }

    if (workItem.data.status !== 'pending') {
      return {
        success: false,
        error: 'Work item is not available for self-assignment',
        errorCode: 'WORK_ITEM_NOT_AVAILABLE',
      };
    }

    return this.update(workItemId, {
      operatorId,
      status: 'self_assigned',
      assignedAt: new Date(),
    }, userId);
  }

  // Start work on assigned item
  async startWork(workItemId: string, operatorId: string, userId?: string): Promise<ServiceResponse<WorkItem>> {
    const workItem = await this.getById(workItemId);
    if (!workItem.success || !workItem.data) {
      return workItem;
    }

    if (workItem.data.operatorId !== operatorId) {
      return {
        success: false,
        error: 'Work item is not assigned to this operator',
        errorCode: 'WORK_ITEM_NOT_ASSIGNED',
      };
    }

    if (!['assigned', 'self_assigned'].includes(workItem.data.status)) {
      return {
        success: false,
        error: 'Work item cannot be started in current status',
        errorCode: 'INVALID_STATUS_TRANSITION',
      };
    }

    return this.update(workItemId, {
      status: 'in_progress',
      startedAt: new Date(),
    }, userId);
  }

  // Complete work item
  async completeWorkItem(
    workItemId: string,
    completionData: {
      operatorId: string;
      piecesCompleted: number;
      qualityScore?: number;
      timeSpentMinutes?: number;
      defects?: any[];
      notes?: string;
    },
    userId?: string
  ): Promise<ServiceResponse<WorkItem>> {
    const workItem = await this.getById(workItemId);
    if (!workItem.success || !workItem.data) {
      return workItem;
    }

    if (workItem.data.operatorId !== completionData.operatorId) {
      return {
        success: false,
        error: 'Work item is not assigned to this operator',
        errorCode: 'WORK_ITEM_NOT_ASSIGNED',
      };
    }

    if (workItem.data.status !== 'in_progress') {
      return {
        success: false,
        error: 'Work item is not in progress',
        errorCode: 'INVALID_STATUS_TRANSITION',
      };
    }

    const updateData: Partial<WorkItem> = {
      status: 'completed',
      completedAt: new Date(),
      completedPieces: completionData.piecesCompleted,
      qualityScore: completionData.qualityScore,
      actualTimeMinutes: completionData.timeSpentMinutes,
      defects: completionData.defects,
      paymentStatus: 'RELEASED',
      canWithdraw: true,
    };

    // Calculate earnings
    const earnings = completionData.piecesCompleted * workItem.data.rate;
    updateData.totalValue = earnings;

    return this.update(workItemId, updateData, userId);
  }

  // Hold payment for damage
  async holdPaymentForDamage(
    workItemId: string,
    damageReportId: string,
    heldAmount: number,
    userId?: string
  ): Promise<ServiceResponse<WorkItem>> {
    return this.update(workItemId, {
      paymentStatus: 'HELD_FOR_DAMAGE',
      canWithdraw: false,
      reworkRequired: true,
      reworkReason: `Payment held due to damage report: ${damageReportId}`,
    }, userId);
  }

  // Release held payment
  async releaseHeldPayment(workItemId: string, userId?: string): Promise<ServiceResponse<WorkItem>> {
    const workItem = await this.getById(workItemId);
    if (!workItem.success || !workItem.data) {
      return workItem;
    }

    if (workItem.data.paymentStatus !== 'HELD_FOR_DAMAGE') {
      return {
        success: false,
        error: 'Payment is not currently held',
        errorCode: 'PAYMENT_NOT_HELD',
      };
    }

    return this.update(workItemId, {
      paymentStatus: 'RELEASED',
      canWithdraw: true,
      reworkRequired: false,
      reworkReason: undefined,
    }, userId);
  }

  // Get work items by difficulty
  async getByDifficulty(difficulty: WorkItem['difficulty'], options?: QueryOptions): Promise<ServiceResponse<WorkItem[]>> {
    return this.getWhere('difficulty', '==', difficulty, options);
  }

  // Get work items within date range
  async getWorkItemsByDateRange(
    startDate: Date,
    endDate: Date,
    options?: QueryOptions
  ): Promise<ServiceResponse<WorkItem[]>> {
    return this.query({
      ...options,
      where: [
        { field: 'createdAt', operator: '>=', value: startDate },
        { field: 'createdAt', operator: '<=', value: endDate }
      ]
    });
  }

  // Get completed work items by date range
  async getCompletedWorkItemsByDateRange(
    startDate: Date,
    endDate: Date,
    options?: QueryOptions
  ): Promise<ServiceResponse<WorkItem[]>> {
    return this.query({
      ...options,
      where: [
        { field: 'completedAt', operator: '>=', value: startDate },
        { field: 'completedAt', operator: '<=', value: endDate },
        { field: 'status', operator: '==', value: 'completed' }
      ]
    });
  }

  // Get work items statistics
  async getWorkItemStatistics(
    filters?: {
      operatorId?: string;
      bundleNumber?: string;
      operation?: string;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<ServiceResponse<{
    totalItems: number;
    completedItems: number;
    pendingItems: number;
    inProgressItems: number;
    totalPieces: number;
    completedPieces: number;
    totalEarnings: number;
    averageQuality: number;
    averageEfficiency: number;
  }>> {
    try {
      const whereConditions: any[] = [];

      if (filters?.operatorId) {
        whereConditions.push({ field: 'operatorId', operator: '==', value: filters.operatorId });
      }

      if (filters?.bundleNumber) {
        whereConditions.push({ field: 'bundleNumber', operator: '==', value: filters.bundleNumber });
      }

      if (filters?.operation) {
        whereConditions.push({ field: 'operation', operator: '==', value: filters.operation });
      }

      if (filters?.dateFrom) {
        whereConditions.push({ field: 'createdAt', operator: '>=', value: filters.dateFrom });
      }

      if (filters?.dateTo) {
        whereConditions.push({ field: 'createdAt', operator: '<=', value: filters.dateTo });
      }

      const result = await this.query({
        where: whereConditions,
        limit: 10000, // Adjust based on your needs
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: 'Failed to fetch work items for statistics',
        };
      }

      const workItems = result.data;
      
      const statistics = {
        totalItems: workItems.length,
        completedItems: workItems.filter(item => item.status === 'completed').length,
        pendingItems: workItems.filter(item => item.status === 'pending').length,
        inProgressItems: workItems.filter(item => item.status === 'in_progress').length,
        totalPieces: workItems.reduce((sum, item) => sum + item.pieces, 0),
        completedPieces: workItems.reduce((sum, item) => sum + (item.completedPieces || 0), 0),
        totalEarnings: workItems.reduce((sum, item) => sum + (item.totalValue || 0), 0),
        averageQuality: workItems.length > 0 
          ? workItems.reduce((sum, item) => sum + (item.qualityScore || 0), 0) / workItems.length 
          : 0,
        averageEfficiency: 0, // Would need to calculate based on actual vs estimated time
      };

      return {
        success: true,
        data: statistics,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate statistics',
      };
    }
  }

  // Bulk update work item statuses
  async bulkUpdateStatus(
    workItemIds: string[],
    status: WorkItem['status'],
    userId?: string
  ): Promise<ServiceResponse<any>> {
    const operations = workItemIds.map(id => ({
      id,
      data: { status }
    }));

    return this.batchUpdate(operations, userId);
  }

  // Get work items summary for dashboard
  async getWorkItemsSummary(operatorId?: string): Promise<ServiceResponse<{
    pending: number;
    assigned: number;
    inProgress: number;
    completed: number;
    onHold: number;
  }>> {
    try {
      const whereConditions = operatorId 
        ? [{ field: 'operatorId', operator: '==', value: operatorId }]
        : [];

      const result = await this.query({
        where: whereConditions,
        limit: 10000,
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: 'Failed to fetch work items summary',
        };
      }

      const workItems = result.data;
      const summary = {
        pending: workItems.filter(item => item.status === 'pending').length,
        assigned: workItems.filter(item => ['assigned', 'self_assigned'].includes(item.status)).length,
        inProgress: workItems.filter(item => item.status === 'in_progress').length,
        completed: workItems.filter(item => item.status === 'completed').length,
        onHold: workItems.filter(item => item.status === 'on_hold').length,
      };

      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get summary',
      };
    }
  }

  // Custom audit logging for work items
  protected shouldAudit(): boolean {
    return true; // Always audit work item changes
  }
}