// Operator Service with CRUD operations and real-time status tracking
import { BaseService } from './base-service';
import type { ServiceResponse, WhereClause } from './base-service';
import type { 
  Operator, 
  OperatorSummary, 
  CreateOperatorData, 
  UpdateOperatorData,
  OperatorStatus,
  OperatorActivity,
  OperatorStatistics
} from '@/types/operator-types';
import { MACHINE_TYPES } from '@/types/operator-types';
import { 
  doc, 
  writeBatch, 
  serverTimestamp,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { 
  ref, 
  set, 
  onValue, 
  off, 
  serverTimestamp as rtServerTimestamp 
} from 'firebase/database';
import { db, rtdb, COLLECTIONS, RT_PATHS } from '../config/firebase';

/**
 * OperatorService - Comprehensive operator management with real-time status tracking
 * Implements requirements from Week 4 Day 4-5 specifications
 */
export class OperatorService extends BaseService {
  constructor() {
    super(COLLECTIONS.OPERATORS);
  }

  /**
   * Create new operator with validation
   */
  async createOperator(operatorData: CreateOperatorData): Promise<ServiceResponse<Operator>> {
    try {
      // Validate operator data
      const validation = this.validateOperatorData(operatorData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          code: 'VALIDATION_ERROR'
        };
      }

      // Check for duplicate username and employee ID
      const duplicateCheck = await this.checkDuplicates(operatorData.username, operatorData.employeeId);
      if (!duplicateCheck.isValid) {
        return {
          success: false,
          error: duplicateCheck.error,
          code: 'DUPLICATE_ERROR'
        };
      }

      // Create operator document
      const operator: Omit<Operator, 'id'> = {
        ...operatorData,
        role: 'operator',
        averageEfficiency: 0,
        qualityScore: 0,
        completedBundles: 0,
        totalPieces: 0,
        totalEarnings: 0,
        isActive: true,
        availabilityStatus: 'available',
        currentAssignments: [],
        maxConcurrentWork: operatorData.maxConcurrentWork || 3,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const result = await this.create<Operator>(operator);
      
      if (result.success && result.data) {
        // Initialize operator status in Realtime Database
        await this.initializeOperatorStatus(result.data.id!, operatorData.primaryMachine);
        
        // Log activity
        await this.logActivity(result.data.id!, 'operator_created', 'Operator account created');
      }

      return result;
    } catch (error) {
      console.error('Error creating operator:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create operator',
        code: 'CREATION_FAILED'
      };
    }
  }

  /**
   * Get operator by ID with real-time status
   */
  async getOperatorWithStatus(operatorId: string): Promise<ServiceResponse<Operator & { realtimeStatus: OperatorStatus }>> {
    try {
      const operatorResult = await this.getById<Operator>(operatorId);
      if (!operatorResult.success || !operatorResult.data) {
        return operatorResult as any;
      }

      // Get real-time status
      const realtimeStatus = await this.getOperatorRealtimeStatus(operatorId);

      return {
        success: true,
        data: {
          ...operatorResult.data,
          realtimeStatus
        }
      };
    } catch (error) {
      console.error('Error getting operator with status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get operator',
        code: 'FETCH_FAILED'
      };
    }
  }

  /**
   * Get all operators with summary data for list views
   */
  async getOperatorsSummary(): Promise<ServiceResponse<OperatorSummary[]>> {
    try {
      const operatorsResult = await this.getAll<Operator>();
      if (!operatorsResult.success || !operatorsResult.data) {
        return operatorsResult as any;
      }

      // Get real-time status for all operators
      const summaries: OperatorSummary[] = await Promise.all(
        operatorsResult.data.map(async (operator) => {
          const realtimeStatus = await this.getOperatorRealtimeStatus(operator.id!);
          
          return {
            id: operator.id!,
            name: operator.name,
            employeeId: operator.employeeId,
            primaryMachine: operator.primaryMachine,
            currentStatus: realtimeStatus.status,
            efficiency: operator.averageEfficiency,
            qualityScore: operator.qualityScore,
            currentWork: realtimeStatus.currentWork,
            avatar: operator.avatar
          };
        })
      );

      return { success: true, data: summaries };
    } catch (error) {
      console.error('Error getting operators summary:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get operators',
        code: 'FETCH_FAILED'
      };
    }
  }

  /**
   * Update operator with optimistic updates
   */
  async updateOperator(operatorId: string, updates: UpdateOperatorData): Promise<ServiceResponse<Operator>> {
    try {
      // Validate update data
      if (updates.username || updates.employeeId) {
        const duplicateCheck = await this.checkDuplicates(
          updates.username, 
          updates.employeeId, 
          operatorId
        );
        if (!duplicateCheck.isValid) {
          return {
            success: false,
            error: duplicateCheck.error,
            code: 'DUPLICATE_ERROR'
          };
        }
      }

      const result = await this.update<Operator>(operatorId, {
        ...updates,
        updatedAt: Timestamp.now()
      });

      if (result.success) {
        // Log activity
        await this.logActivity(
          operatorId, 
          'profile_updated', 
          `Profile updated: ${Object.keys(updates).join(', ')}`
        );
      }

      return result;
    } catch (error) {
      console.error('Error updating operator:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update operator',
        code: 'UPDATE_FAILED'
      };
    }
  }

  /**
   * Update operator statistics (performance metrics)
   */
  async updateOperatorStats(
    operatorId: string, 
    stats: {
      efficiency?: number;
      qualityScore?: number;
      completedPieces?: number;
      earnings?: number;
    }
  ): Promise<ServiceResponse> {
    try {
      const updateData: any = {};

      if (stats.efficiency !== undefined) {
        updateData.averageEfficiency = stats.efficiency;
      }
      
      if (stats.qualityScore !== undefined) {
        updateData.qualityScore = stats.qualityScore;
      }
      
      if (stats.completedPieces !== undefined) {
        updateData.totalPieces = increment(stats.completedPieces);
        updateData.completedBundles = increment(1);
      }
      
      if (stats.earnings !== undefined) {
        updateData.totalEarnings = increment(stats.earnings);
      }

      updateData.updatedAt = serverTimestamp();

      const result = await this.update(operatorId, updateData);

      if (result.success) {
        // Log activity
        await this.logActivity(
          operatorId, 
          'stats_updated', 
          `Statistics updated: ${Object.keys(stats).join(', ')}`
        );
      }

      return result;
    } catch (error) {
      console.error('Error updating operator stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update statistics',
        code: 'STATS_UPDATE_FAILED'
      };
    }
  }

  /**
   * Assign work to operator
   */
  async assignWork(operatorId: string, workData: {
    bundleId: string;
    workItemId: string;
    assignmentMethod: 'supervisor_assigned' | 'self_assigned';
    estimatedCompletion?: Date;
  }): Promise<ServiceResponse> {
    try {
      // Check operator capacity
      const operator = await this.getById<Operator>(operatorId);
      if (!operator.success || !operator.data) {
        return { success: false, error: 'Operator not found', code: 'OPERATOR_NOT_FOUND' };
      }

      if (operator.data.currentAssignments.length >= operator.data.maxConcurrentWork) {
        return {
          success: false,
          error: `Operator at maximum capacity (${operator.data.maxConcurrentWork} assignments)`,
          code: 'CAPACITY_EXCEEDED'
        };
      }

      const batch = writeBatch(db);

      // Add assignment to operator
      const operatorRef = doc(db, COLLECTIONS.OPERATORS, operatorId);
      batch.update(operatorRef, {
        currentAssignments: arrayUnion(workData.bundleId),
        updatedAt: serverTimestamp()
      });

      // Update real-time status
      const statusRef = ref(rtdb, `${RT_PATHS.OPERATOR_STATUS}/${operatorId}`);
      await set(statusRef, {
        status: 'working',
        currentWork: workData.workItemId,
        lastActivity: rtServerTimestamp(),
        machineStatus: 'running'
      });

      await batch.commit();

      // Log activity
      await this.logActivity(
        operatorId, 
        'work_assigned', 
        `Work assigned: ${workData.bundleId} (${workData.assignmentMethod})`
      );

      return { success: true, message: 'Work assigned successfully' };
    } catch (error) {
      console.error('Error assigning work:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assign work',
        code: 'ASSIGNMENT_FAILED'
      };
    }
  }

  /**
   * Complete work assignment
   */
  async completeWork(operatorId: string, workData: {
    bundleId: string;
    workItemId: string;
    completedPieces: number;
    qualityScore: number;
    efficiency: number;
    timeSpent: number;
  }): Promise<ServiceResponse> {
    try {
      const batch = writeBatch(db);

      // Remove assignment from operator
      const operatorRef = doc(db, COLLECTIONS.OPERATORS, operatorId);
      batch.update(operatorRef, {
        currentAssignments: arrayRemove(workData.bundleId),
        totalPieces: increment(workData.completedPieces),
        completedBundles: increment(1),
        updatedAt: serverTimestamp()
      });

      // Update real-time status
      const statusRef = ref(rtdb, `${RT_PATHS.OPERATOR_STATUS}/${operatorId}`);
      await set(statusRef, {
        status: 'idle',
        currentWork: null,
        lastActivity: rtServerTimestamp(),
        machineStatus: 'stopped'
      });

      await batch.commit();

      // Update performance metrics
      await this.updateOperatorStats(operatorId, {
        efficiency: workData.efficiency,
        qualityScore: workData.qualityScore,
        completedPieces: workData.completedPieces
      });

      // Log activity
      await this.logActivity(
        operatorId, 
        'work_completed', 
        `Work completed: ${workData.bundleId}, Pieces: ${workData.completedPieces}, Quality: ${workData.qualityScore}%`
      );

      return { success: true, message: 'Work completed successfully' };
    } catch (error) {
      console.error('Error completing work:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete work',
        code: 'COMPLETION_FAILED'
      };
    }
  }

  /**
   * Get operators by machine type
   */
  async getOperatorsByMachine(machineType: string): Promise<ServiceResponse<Operator[]>> {
    try {
      const whereClause: WhereClause = {
        field: 'machineTypes',
        operator: 'array-contains',
        value: machineType
      };

      return await this.getWhere<Operator>(whereClause, {
        orderByField: 'averageEfficiency',
        orderDirection: 'desc'
      });
    } catch (error) {
      console.error('Error getting operators by machine:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get operators',
        code: 'FETCH_FAILED'
      };
    }
  }

  /**
   * Get operators by skill level
   */
  async getOperatorsBySkill(skillLevel: string): Promise<ServiceResponse<Operator[]>> {
    try {
      const whereClause: WhereClause = {
        field: 'skillLevel',
        operator: '==',
        value: skillLevel
      };

      return await this.getWhere<Operator>(whereClause, {
        orderByField: 'qualityScore',
        orderDirection: 'desc'
      });
    } catch (error) {
      console.error('Error getting operators by skill:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get operators',
        code: 'FETCH_FAILED'
      };
    }
  }

  /**
   * Real-time status management
   */
  async updateOperatorStatus(operatorId: string, status: Partial<OperatorStatus>): Promise<ServiceResponse> {
    try {
      const statusRef = ref(rtdb, `${RT_PATHS.OPERATOR_STATUS}/${operatorId}`);
      
      await set(statusRef, {
        ...status,
        lastActivity: rtServerTimestamp()
      });

      return { success: true, message: 'Status updated successfully' };
    } catch (error) {
      console.error('Error updating operator status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update status',
        code: 'STATUS_UPDATE_FAILED'
      };
    }
  }

  /**
   * Subscribe to operator real-time status
   */
  subscribeToOperatorStatus(
    operatorId: string, 
    callback: (status: OperatorStatus | null) => void
  ): () => void {
    const statusRef = ref(rtdb, `${RT_PATHS.OPERATOR_STATUS}/${operatorId}`);
    
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const status = snapshot.exists() ? snapshot.val() as OperatorStatus : null;
      callback(status);
    }, (error) => {
      console.error('Error subscribing to operator status:', error);
      callback(null);
    });

    return () => off(statusRef);
  }

  /**
   * Private helper methods
   */
  private async getOperatorRealtimeStatus(operatorId: string): Promise<OperatorStatus> {
    return new Promise((resolve) => {
      const statusRef = ref(rtdb, `${RT_PATHS.OPERATOR_STATUS}/${operatorId}`);
      
      onValue(statusRef, (snapshot) => {
        const status = snapshot.exists() ? snapshot.val() as OperatorStatus : {
          status: 'offline',
          currentWork: null,
          lastActivity: Date.now(),
          machineStatus: 'stopped'
        };
        resolve(status);
      }, { onlyOnce: true });
    });
  }

  private async initializeOperatorStatus(operatorId: string, primaryMachine: string): Promise<void> {
    const statusRef = ref(rtdb, `${RT_PATHS.OPERATOR_STATUS}/${operatorId}`);
    
    await set(statusRef, {
      status: 'offline',
      currentWork: null,
      lastActivity: rtServerTimestamp(),
      machineStatus: 'stopped',
      primaryMachine
    });
  }

  private validateOperatorData(data: CreateOperatorData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.username || data.username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }

    if (!data.name || data.name.length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    if (!data.employeeId || !/^[A-Z0-9]+$/.test(data.employeeId)) {
      errors.push('Employee ID must contain only uppercase letters and numbers');
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }

    if (!data.primaryMachine) {
      errors.push('Primary machine is required');
    }

    if (!data.machineTypes || data.machineTypes.length === 0) {
      errors.push('At least one machine type is required');
    }

    if (!data.skillLevel) {
      errors.push('Skill level is required');
    }

    if (!data.shift) {
      errors.push('Shift is required');
    }

    return { isValid: errors.length === 0, errors };
  }

  private async checkDuplicates(
    username: string, 
    employeeId: string, 
    excludeId?: string
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Check username
      const usernameResult = await this.getWhere<Operator>({
        field: 'username',
        operator: '==',
        value: username
      });

      if (usernameResult.success && usernameResult.data && usernameResult.data.length > 0) {
        const duplicate = usernameResult.data[0];
        if (!excludeId || duplicate.id !== excludeId) {
          return { isValid: false, error: 'Username already exists' };
        }
      }

      // Check employee ID
      const employeeIdResult = await this.getWhere<Operator>({
        field: 'employeeId',
        operator: '==',
        value: employeeId
      });

      if (employeeIdResult.success && employeeIdResult.data && employeeIdResult.data.length > 0) {
        const duplicate = employeeIdResult.data[0];
        if (!excludeId || duplicate.id !== excludeId) {
          return { isValid: false, error: 'Employee ID already exists' };
        }
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return { isValid: false, error: 'Validation error' };
    }
  }

  private async logActivity(
    operatorId: string,
    activityType: OperatorActivity['activityType'],
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const activityService = new BaseService(COLLECTIONS.USER_ACTIVITIES);
      
      const activity: Omit<OperatorActivity, 'id'> = {
        operatorId,
        activityType,
        description,
        metadata,
        timestamp: Timestamp.now()
      };

      await activityService.create(activity);
    } catch (error) {
      console.error('Error logging activity:', error);
      // Non-critical error - don't throw
    }
  }
}

// Export singleton instance
export const operatorService = new OperatorService();