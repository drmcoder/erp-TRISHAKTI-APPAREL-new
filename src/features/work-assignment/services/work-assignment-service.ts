// Work Assignment Service Layer
// Handles all CRUD operations and business logic for work assignments

import { BaseService } from '@/shared/services/base-service';
import { notificationService } from '@/services/notification-service';
import {
  WorkBundle,
  WorkItem,
  WorkAssignment,
  WorkAssignmentSummary,
  AssignmentRequest,
  CreateWorkBundleData,
  CreateWorkItemData,
  AssignWorkData,
  CompleteWorkData,
  ServiceResponse,
  PaginatedResponse,
  AssignmentFilters,
  AssignmentStatistics,
  WorkSession,
  AssignmentIssue,
  QualityIssue
} from '../types';

export class WorkAssignmentService extends BaseService {
  constructor() {
    super('work-assignments');
  }

  // ==================== WORK BUNDLE OPERATIONS ====================

  async createWorkBundle(bundleData: CreateWorkBundleData): Promise<ServiceResponse<WorkBundle>> {
    try {
      const validation = this.validateWorkBundle(bundleData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          code: 'VALIDATION_ERROR'
        };
      }

      const bundle: WorkBundle = {
        ...bundleData,
        id: this.generateId(),
        workItems: [],
        totalPieces: bundleData.quantity,
        completedPieces: 0,
        remainingPieces: bundleData.quantity,
        createdDate: new Date(),
        status: 'pending',
        isUrgent: bundleData.priority === 'urgent',
        assignedOperators: [],
        actualHours: 0,
        createdBy: this.getCurrentUserId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await this.create(bundle);
      await this.logActivity('work_bundle_created', bundle.id!, {
        bundleNumber: bundle.bundleNumber,
        orderNumber: bundle.orderNumber
      });

      return { success: true, data: bundle };
    } catch (error) {
      console.error('Error creating work bundle:', error);
      return {
        success: false,
        error: 'Failed to create work bundle',
        code: 'CREATION_ERROR'
      };
    }
  }

  async getWorkBundles(filters?: AssignmentFilters): Promise<ServiceResponse<PaginatedResponse<WorkBundle>>> {
    try {
      let query = this.db.collection('workBundles');

      // Apply filters
      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }

      if (filters?.priority) {
        query = query.where('priority', '==', filters.priority);
      }

      if (filters?.dateRange) {
        query = query
          .where('createdDate', '>=', filters.dateRange.start)
          .where('createdDate', '<=', filters.dateRange.end);
      }

      const snapshot = await query.orderBy('createdDate', 'desc').get();
      const bundles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WorkBundle[];

      // Apply search filter (client-side for complex text search)
      let filteredBundles = bundles;
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredBundles = bundles.filter(bundle =>
          bundle.bundleNumber.toLowerCase().includes(searchTerm) ||
          bundle.orderNumber.toLowerCase().includes(searchTerm) ||
          bundle.garmentType.toLowerCase().includes(searchTerm)
        );
      }

      // Pagination
      const page = 1; // TODO: Add pagination parameters
      const limit = 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedBundles = filteredBundles.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          items: paginatedBundles,
          pagination: {
            page,
            limit,
            total: filteredBundles.length,
            totalPages: Math.ceil(filteredBundles.length / limit)
          }
        }
      };
    } catch (error) {
      console.error('Error fetching work bundles:', error);
      return {
        success: false,
        error: 'Failed to fetch work bundles',
        code: 'FETCH_ERROR'
      };
    }
  }

  async getWorkBundleById(bundleId: string): Promise<ServiceResponse<WorkBundle>> {
    try {
      const bundle = await this.getById<WorkBundle>(bundleId);
      if (!bundle.success || !bundle.data) {
        return {
          success: false,
          error: 'Work bundle not found',
          code: 'NOT_FOUND'
        };
      }

      return { success: true, data: bundle.data };
    } catch (error) {
      console.error('Error fetching work bundle:', error);
      return {
        success: false,
        error: 'Failed to fetch work bundle',
        code: 'FETCH_ERROR'
      };
    }
  }

  // ==================== WORK ITEM OPERATIONS ====================

  async createWorkItem(itemData: CreateWorkItemData): Promise<ServiceResponse<WorkItem>> {
    try {
      const validation = this.validateWorkItem(itemData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          code: 'VALIDATION_ERROR'
        };
      }

      const workItem: WorkItem = {
        ...itemData,
        id: this.generateId(),
        workItemNumber: `${itemData.bundleId}-${Date.now()}`,
        completedPieces: 0,
        rejectedPieces: 0,
        reworkPieces: 0,
        status: 'pending',
        qualityChecked: false,
        isBlocked: false,
        dependencies: itemData.dependencies || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await this.create(workItem, 'workItems');

      // Update bundle with new work item
      await this.updateBundleWorkItems(itemData.bundleId, workItem);

      await this.logActivity('work_item_created', workItem.id!, {
        bundleId: itemData.bundleId,
        operation: itemData.operation
      });

      return { success: true, data: workItem };
    } catch (error) {
      console.error('Error creating work item:', error);
      return {
        success: false,
        error: 'Failed to create work item',
        code: 'CREATION_ERROR'
      };
    }
  }

  async getWorkItemsByBundle(bundleId: string): Promise<ServiceResponse<WorkItem[]>> {
    try {
      const snapshot = await this.db.collection('workItems')
        .where('bundleId', '==', bundleId)
        .orderBy('createdAt')
        .get();

      const workItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WorkItem[];

      return { success: true, data: workItems };
    } catch (error) {
      console.error('Error fetching work items:', error);
      return {
        success: false,
        error: 'Failed to fetch work items',
        code: 'FETCH_ERROR'
      };
    }
  }

  // ==================== ASSIGNMENT OPERATIONS ====================

  async assignWork(assignmentData: AssignWorkData): Promise<ServiceResponse<WorkAssignment>> {
    try {
      // Use atomic operations service to prevent race conditions
      const { atomicOperationsService } = await import('./atomic-operations');
      
      const atomicOperation = {
        workItemId: assignmentData.workItemId,
        operatorId: assignmentData.operatorId,
        supervisorId: this.getCurrentUserId(),
        assignmentData: assignmentData,
        timestamp: new Date()
      };

      const result = await atomicOperationsService.atomicAssignWork(atomicOperation);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Assignment failed',
          code: result.conflictedWith ? 'RACE_CONDITION_DETECTED' : 'ASSIGNMENT_ERROR'
        };
      }

      const assignment: WorkAssignment = {
        ...assignmentData,
        id: result.assignmentId!,
        bundleId: await this.getBundleIdFromWorkItem(assignmentData.workItemId),
        assignedBy: this.getCurrentUserId(),
        assignedAt: new Date(),
        status: 'assigned',
        targetPieces: await this.getWorkItemTargetPieces(assignmentData.workItemId),
        completedPieces: 0,
        rejectedPieces: 0,
        workSessions: [],
        totalWorkingTime: 0,
        breakTime: 0,
        earningsCalculated: false,
        issues: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await this.logActivity('work_assigned', assignment.id!, {
        workItemId: assignmentData.workItemId,
        operatorId: assignmentData.operatorId,
        assignmentMethod: assignmentData.assignmentMethod
      });

      // Send realtime notification to the operator
      try {
        const workItemDetails = await this.getWorkItemDetails(assignmentData.workItemId);
        const supervisorName = await this.getSupervisorName(assignment.assignedBy);
        
        await notificationService.sendNotification({
          type: 'assignment',
          title: 'New Work Assignment',
          message: `You have been assigned ${workItemDetails?.workItemNumber || 'work item'} by ${supervisorName || 'supervisor'}`,
          userId: assignmentData.operatorId,
          priority: 'medium',
          category: 'work-assignment',
          data: {
            assignmentId: assignment.id,
            workItemId: assignmentData.workItemId,
            workItemNumber: workItemDetails?.workItemNumber,
            targetPieces: assignment.targetPieces,
            assignedBy: supervisorName,
            assignedAt: assignment.assignedAt
          },
          actions: [
            {
              id: 'view-assignment',
              title: 'View Assignment',
              action: `navigate:/work-assignment/${assignment.id}`
            }
          ]
        });
      } catch (notificationError) {
        console.error('Failed to send assignment notification:', notificationError);
        // Don't fail the assignment if notification fails
      }

      return { success: true, data: assignment };
    } catch (error) {
      console.error('Error assigning work:', error);
      return {
        success: false,
        error: 'Failed to assign work',
        code: 'ASSIGNMENT_ERROR'
      };
    }
  }

  async getAssignments(filters?: AssignmentFilters): Promise<ServiceResponse<PaginatedResponse<WorkAssignmentSummary>>> {
    try {
      let query = this.db.collection('assignments');

      // Apply filters
      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }

      if (filters?.operatorId) {
        query = query.where('operatorId', '==', filters.operatorId);
      }

      if (filters?.dateRange) {
        query = query
          .where('assignedAt', '>=', filters.dateRange.start)
          .where('assignedAt', '<=', filters.dateRange.end);
      }

      const snapshot = await query.orderBy('assignedAt', 'desc').get();
      const assignments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WorkAssignment[];

      // Transform to summary format with additional data
      const summaries: WorkAssignmentSummary[] = await Promise.all(
        assignments.map(async (assignment) => {
          const workItem = await this.getWorkItemById(assignment.workItemId);
          const bundle = await this.getWorkBundleById(assignment.bundleId);
          const operator = await this.getOperatorById(assignment.operatorId);

          return {
            id: assignment.id!,
            bundleNumber: bundle.data?.bundleNumber || '',
            orderNumber: bundle.data?.orderNumber || '',
            operatorName: operator.data?.name || '',
            operatorId: assignment.operatorId,
            machineType: workItem.data?.machineType || '',
            operation: workItem.data?.operation || '',
            status: assignment.status,
            priority: bundle.data?.priority || 'medium',
            assignedDate: assignment.assignedAt.toISOString(),
            targetCompletion: assignment.estimatedCompletionTime.toISOString(),
            progress: assignment.targetPieces > 0 
              ? (assignment.completedPieces / assignment.targetPieces) * 100 
              : 0,
            efficiency: assignment.currentEfficiency || 0,
            qualityScore: assignment.qualityScore,
            estimatedEarnings: assignment.totalEarnings || 0
          };
        })
      );

      return {
        success: true,
        data: {
          items: summaries,
          pagination: {
            page: 1,
            limit: summaries.length,
            total: summaries.length,
            totalPages: 1
          }
        }
      };
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return {
        success: false,
        error: 'Failed to fetch assignments',
        code: 'FETCH_ERROR'
      };
    }
  }

  async completeAssignment(completionData: CompleteWorkData): Promise<ServiceResponse<WorkAssignment>> {
    try {
      const assignment = await this.getAssignmentById(completionData.assignmentId);
      if (!assignment.success || !assignment.data) {
        return {
          success: false,
          error: 'Assignment not found',
          code: 'NOT_FOUND'
        };
      }

      const updatedAssignment: WorkAssignment = {
        ...assignment.data,
        status: 'completed',
        completedPieces: completionData.completedPieces,
        rejectedPieces: completionData.rejectedPieces,
        qualityScore: completionData.qualityScore,
        completedAt: new Date(),
        operatorNotes: completionData.operatorNotes,
        updatedAt: new Date().toISOString()
      };

      // Calculate earnings
      const earnings = await this.calculateEarnings(updatedAssignment);
      updatedAssignment.totalEarnings = earnings.totalAmount;
      updatedAssignment.earningsCalculated = true;

      // Update assignment
      await this.update(completionData.assignmentId, updatedAssignment, 'assignments');

      // Update work item status
      await this.updateWorkItemCompletion(
        assignment.data.workItemId,
        completionData.completedPieces,
        completionData.rejectedPieces,
        completionData.qualityScore
      );

      // Handle quality issues if any
      if (completionData.qualityIssues?.length) {
        await this.recordQualityIssues(assignment.data.workItemId, completionData.qualityIssues);
      }

      // Update operator status
      await this.updateOperatorAfterCompletion(assignment.data.operatorId, updatedAssignment);

      await this.logActivity('work_completed', completionData.assignmentId, {
        completedPieces: completionData.completedPieces,
        qualityScore: completionData.qualityScore,
        earnings: earnings.totalAmount
      });

      return { success: true, data: updatedAssignment };
    } catch (error) {
      console.error('Error completing assignment:', error);
      return {
        success: false,
        error: 'Failed to complete assignment',
        code: 'COMPLETION_ERROR'
      };
    }
  }

  // ==================== ASSIGNMENT REQUEST OPERATIONS ====================

  async createAssignmentRequest(
    workItemId: string,
    operatorId: string,
    reason?: string
  ): Promise<ServiceResponse<AssignmentRequest>> {
    try {
      const request: AssignmentRequest = {
        id: this.generateId(),
        workItemId,
        operatorId,
        requestType: 'self_assignment',
        requestedAt: new Date(),
        reason,
        status: 'pending',
        skillMatches: await this.checkSkillMatch(workItemId, operatorId),
        machineAvailable: await this.checkMachineAvailability(workItemId),
        workloadAcceptable: await this.checkWorkloadCapacity(operatorId),
        timeSlotAvailable: await this.checkTimeSlotAvailability(operatorId, workItemId),
        priorityScore: await this.calculatePriorityScore(workItemId, operatorId),
        operatorEfficiency: await this.getOperatorEfficiency(operatorId),
        workComplexity: await this.getWorkComplexity(workItemId),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await this.create(request, 'assignmentRequests');

      await this.logActivity('assignment_request_created', request.id!, {
        workItemId,
        operatorId,
        requestType: request.requestType
      });

      return { success: true, data: request };
    } catch (error) {
      console.error('Error creating assignment request:', error);
      return {
        success: false,
        error: 'Failed to create assignment request',
        code: 'REQUEST_ERROR'
      };
    }
  }

  // ==================== STATISTICS AND ANALYTICS ====================

  async getAssignmentStatistics(filters?: AssignmentFilters): Promise<ServiceResponse<AssignmentStatistics>> {
    try {
      // This would typically be implemented with aggregation queries
      const assignmentsResult = await this.getAssignments(filters);
      if (!assignmentsResult.success) {
        return {
          success: false,
          error: 'Failed to fetch assignment data',
          code: 'FETCH_ERROR'
        };
      }

      const assignments = assignmentsResult.data!.items;
      
      const statistics: AssignmentStatistics = {
        totalAssignments: assignments.length,
        pendingAssignments: assignments.filter(a => a.status === 'pending').length,
        activeAssignments: assignments.filter(a => ['assigned', 'started'].includes(a.status)).length,
        completedAssignments: assignments.filter(a => a.status === 'completed').length,
        averageEfficiency: this.calculateAverage(assignments.map(a => a.efficiency)),
        averageQuality: this.calculateAverage(assignments.filter(a => a.qualityScore).map(a => a.qualityScore!)),
        onTimeCompletion: this.calculateOnTimeCompletion(assignments),
        totalEarnings: assignments.reduce((sum, a) => sum + a.estimatedEarnings, 0)
      };

      return { success: true, data: statistics };
    } catch (error) {
      console.error('Error fetching assignment statistics:', error);
      return {
        success: false,
        error: 'Failed to fetch statistics',
        code: 'STATISTICS_ERROR'
      };
    }
  }

  // ==================== HELPER METHODS ====================

  private validateWorkBundle(data: CreateWorkBundleData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.bundleNumber?.trim()) errors.push('Bundle number is required');
    if (!data.orderNumber?.trim()) errors.push('Order number is required');
    if (!data.garmentType?.trim()) errors.push('Garment type is required');
    if (!data.quantity || data.quantity <= 0) errors.push('Quantity must be greater than 0');
    if (data.targetCompletionDate <= data.targetStartDate) {
      errors.push('Completion date must be after start date');
    }

    return { isValid: errors.length === 0, errors };
  }

  private validateWorkItem(data: CreateWorkItemData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.bundleId?.trim()) errors.push('Bundle ID is required');
    if (!data.machineType?.trim()) errors.push('Machine type is required');
    if (!data.operation?.trim()) errors.push('Operation is required');
    if (!data.targetPieces || data.targetPieces <= 0) errors.push('Target pieces must be greater than 0');
    if (!data.ratePerPiece || data.ratePerPiece <= 0) errors.push('Rate per piece must be greater than 0');

    return { isValid: errors.length === 0, errors };
  }

  private async getWorkItemDetails(workItemId: string): Promise<any> {
    try {
      // Mock data for now - in real implementation, this would query the database
      return {
        workItemNumber: `WI-${workItemId.slice(-6).toUpperCase()}`,
        description: 'Work item details',
        priority: 'normal'
      };
    } catch (error) {
      console.error('Error fetching work item details:', error);
      return null;
    }
  }

  private async getSupervisorName(supervisorId: string): Promise<string> {
    try {
      // Mock data for now - in real implementation, this would query the user/supervisor database
      return `Supervisor-${supervisorId.slice(-4).toUpperCase()}`;
    } catch (error) {
      console.error('Error fetching supervisor name:', error);
      return 'Supervisor';
    }
  }

  private async validateAssignment(data: AssignWorkData): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!data.workItemId?.trim()) errors.push('Work item ID is required');
    if (!data.operatorId?.trim()) errors.push('Operator ID is required');
    if (data.estimatedCompletionTime <= data.estimatedStartTime) {
      errors.push('Completion time must be after start time');
    }

    return { isValid: errors.length === 0, errors };
  }

  private async checkOperatorAvailability(operatorId: string): Promise<{ available: boolean; reason?: string }> {
    // Implementation would check operator's current assignments and status
    return { available: true };
  }

  private async updateBundleWorkItems(bundleId: string, workItem: WorkItem): Promise<void> {
    // Implementation would update the bundle's workItems array
  }

  private async calculateEarnings(assignment: WorkAssignment): Promise<{ totalAmount: number; breakdown: any }> {
    // Implementation would calculate earnings based on pieces completed, rates, bonuses, etc.
    return { totalAmount: 0, breakdown: {} };
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateOnTimeCompletion(assignments: WorkAssignmentSummary[]): number {
    const completed = assignments.filter(a => a.status === 'completed');
    if (completed.length === 0) return 0;
    
    const onTime = completed.filter(a => 
      new Date(a.targetCompletion) >= new Date() // Simplified logic
    );
    
    return (onTime.length / completed.length) * 100;
  }

  // Additional helper methods would be implemented here...
  private async getBundleIdFromWorkItem(workItemId: string): Promise<string> { return ''; }
  private async getWorkItemTargetPieces(workItemId: string): Promise<number> { return 0; }
  private async updateWorkItemStatus(workItemId: string, status: string, operatorId?: string): Promise<void> {}
  private async updateOperatorAssignment(operatorId: string, assignmentId: string): Promise<void> {}
  private async getAssignmentById(assignmentId: string): Promise<ServiceResponse<WorkAssignment>> { 
    return { success: false }; 
  }
  private async getWorkItemById(workItemId: string): Promise<ServiceResponse<WorkItem>> { 
    return { success: false }; 
  }
  private async getOperatorById(operatorId: string): Promise<ServiceResponse<any>> { 
    return { success: false }; 
  }
  private async updateWorkItemCompletion(workItemId: string, completed: number, rejected: number, quality: number): Promise<void> {}
  private async recordQualityIssues(workItemId: string, issues: any[]): Promise<void> {}
  private async updateOperatorAfterCompletion(operatorId: string, assignment: WorkAssignment): Promise<void> {}
  private async checkSkillMatch(workItemId: string, operatorId: string): Promise<boolean> { return true; }
  private async checkMachineAvailability(workItemId: string): Promise<boolean> { return true; }
  private async checkWorkloadCapacity(operatorId: string): Promise<boolean> { return true; }
  private async checkTimeSlotAvailability(operatorId: string, workItemId: string): Promise<boolean> { return true; }
  private async calculatePriorityScore(workItemId: string, operatorId: string): Promise<number> { return 1; }
  private async getOperatorEfficiency(operatorId: string): Promise<number> { return 0.8; }
  private async getWorkComplexity(workItemId: string): Promise<number> { return 1; }
}

export const workAssignmentService = new WorkAssignmentService();