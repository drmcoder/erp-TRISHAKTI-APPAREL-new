// Atomic Operations Service for Race Condition Prevention
// Ensures data consistency during concurrent assignment operations

import { 
  doc, 
  writeBatch, 
  transaction, 
  serverTimestamp, 
  increment,
  DocumentReference,
  FirebaseFirestore
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { WorkAssignment, WorkItem, AssignmentRequest } from '../types';

export interface AtomicAssignmentOperation {
  workItemId: string;
  operatorId: string;
  supervisorId: string;
  assignmentData: Partial<WorkAssignment>;
  timestamp: Date;
}

export interface AtomicOperationResult {
  success: boolean;
  assignmentId?: string;
  error?: string;
  conflictedWith?: string;
  retryAfter?: number;
}

export interface DistributedLock {
  lockId: string;
  resourceId: string;
  lockedBy: string;
  expiresAt: Date;
  createdAt: Date;
}

export class AtomicOperationsService {
  private readonly lockTimeout = 30000; // 30 seconds
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  // Main atomic assignment function
  async atomicAssignWork(operation: AtomicAssignmentOperation): Promise<AtomicOperationResult> {
    const lockId = `assign_${operation.workItemId}_${Date.now()}`;
    
    try {
      // Step 1: Acquire distributed lock
      const lockAcquired = await this.acquireDistributedLock(
        operation.workItemId,
        operation.operatorId,
        lockId
      );

      if (!lockAcquired.success) {
        return {
          success: false,
          error: 'Failed to acquire lock - another operation in progress',
          conflictedWith: lockAcquired.conflictedWith,
          retryAfter: lockAcquired.retryAfter
        };
      }

      // Step 2: Perform atomic assignment with retries
      let lastError: string = '';
      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          const result = await this.performAtomicAssignment(operation, lockId);
          
          // Step 3: Release lock on success
          await this.releaseDistributedLock(lockId);
          
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'Unknown error';
          
          if (attempt < this.maxRetries) {
            await this.delay(this.retryDelay * attempt);
          }
        }
      }

      // Step 4: Release lock on failure
      await this.releaseDistributedLock(lockId);
      
      return {
        success: false,
        error: `Assignment failed after ${this.maxRetries} attempts: ${lastError}`
      };

    } catch (error) {
      await this.releaseDistributedLock(lockId);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Atomic operation failed'
      };
    }
  }

  // Acquire distributed lock to prevent race conditions
  private async acquireDistributedLock(
    resourceId: string,
    operatorId: string,
    lockId: string
  ): Promise<{
    success: boolean;
    conflictedWith?: string;
    retryAfter?: number;
  }> {
    return transaction(db, async (t) => {
      const lockRef = doc(db, 'distributed_locks', resourceId);
      const lockDoc = await t.get(lockRef);

      // Check if lock already exists and is not expired
      if (lockDoc.exists()) {
        const existingLock = lockDoc.data() as DistributedLock;
        const now = new Date();
        
        if (existingLock.expiresAt > now) {
          // Lock is still valid - cannot acquire
          return {
            success: false,
            conflictedWith: existingLock.lockedBy,
            retryAfter: Math.ceil((existingLock.expiresAt.getTime() - now.getTime()) / 1000)
          };
        }
      }

      // Acquire or renew lock
      const lockData: DistributedLock = {
        lockId,
        resourceId,
        lockedBy: operatorId,
        expiresAt: new Date(Date.now() + this.lockTimeout),
        createdAt: new Date()
      };

      t.set(lockRef, lockData);
      
      return { success: true };
    });
  }

  // Release distributed lock
  private async releaseDistributedLock(lockId: string): Promise<void> {
    try {
      const locksRef = db.collection('distributed_locks');
      const lockQuery = locksRef.where('lockId', '==', lockId);
      const snapshot = await lockQuery.get();
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Failed to release distributed lock:', error);
    }
  }

  // Perform the actual atomic assignment operation
  private async performAtomicAssignment(
    operation: AtomicAssignmentOperation,
    lockId: string
  ): Promise<AtomicOperationResult> {
    return transaction(db, async (t) => {
      // References
      const workItemRef = doc(db, 'workItems', operation.workItemId);
      const operatorRef = doc(db, 'operators', operation.operatorId);
      const assignmentsRef = doc(db, 'assignments');
      
      // Read current state
      const [workItemDoc, operatorDoc] = await Promise.all([
        t.get(workItemRef),
        t.get(operatorRef)
      ]);

      if (!workItemDoc.exists()) {
        throw new Error('Work item not found');
      }

      if (!operatorDoc.exists()) {
        throw new Error('Operator not found');
      }

      const workItem = { id: workItemDoc.id, ...workItemDoc.data() } as WorkItem;
      const operator = { id: operatorDoc.id, ...operatorDoc.data() } as any;

      // Validation checks
      const validationResult = this.validateAssignmentState(workItem, operator);
      if (!validationResult.valid) {
        throw new Error(validationResult.error);
      }

      // Create assignment document
      const assignmentId = assignmentsRef.id;
      const assignmentData: WorkAssignment = {
        id: assignmentId,
        workItemId: operation.workItemId,
        operatorId: operation.operatorId,
        bundleId: workItem.bundleId,
        assignmentMethod: 'supervisor_assigned',
        assignedBy: operation.supervisorId,
        assignedAt: operation.timestamp,
        status: 'assigned',
        targetPieces: workItem.targetPieces,
        completedPieces: 0,
        rejectedPieces: 0,
        workSessions: [],
        totalWorkingTime: 0,
        breakTime: 0,
        earningsCalculated: false,
        issues: [],
        estimatedStartTime: operation.timestamp,
        estimatedCompletionTime: new Date(operation.timestamp.getTime() + workItem.estimatedDuration * 60 * 1000),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...operation.assignmentData
      };

      // Atomic updates
      t.set(assignmentsRef, assignmentData);

      // Update work item status
      t.update(workItemRef, {
        status: 'assigned',
        assignedOperatorId: operation.operatorId,
        assignedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update operator current assignments count
      t.update(operatorRef, {
        currentAssignments: increment(1),
        lastAssignedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Log the atomic operation
      const operationLogRef = doc(db, 'assignment_operations');
      t.set(operationLogRef, {
        type: 'assignment_created',
        assignmentId,
        workItemId: operation.workItemId,
        operatorId: operation.operatorId,
        supervisorId: operation.supervisorId,
        lockId,
        timestamp: serverTimestamp(),
        metadata: {
          machineType: workItem.machineType,
          operation: workItem.operation,
          targetPieces: workItem.targetPieces
        }
      });

      return {
        success: true,
        assignmentId
      };
    });
  }

  // Validate assignment state to prevent conflicts
  private validateAssignmentState(workItem: WorkItem, operator: any): {
    valid: boolean;
    error?: string;
  } {
    // Check if work item is already assigned
    if (workItem.status === 'assigned' || workItem.assignedOperatorId) {
      return {
        valid: false,
        error: 'Work item is already assigned to another operator'
      };
    }

    // Check if work item is completed or cancelled
    if (['completed', 'cancelled'].includes(workItem.status)) {
      return {
        valid: false,
        error: `Work item is ${workItem.status} and cannot be assigned`
      };
    }

    // Check operator availability
    if (operator.currentStatus === 'offline') {
      return {
        valid: false,
        error: 'Operator is currently offline'
      };
    }

    // Check operator workload capacity
    const currentAssignments = operator.currentAssignments || 0;
    const maxConcurrent = operator.maxConcurrentWork || 5;
    
    if (currentAssignments >= maxConcurrent) {
      return {
        valid: false,
        error: 'Operator is at maximum capacity'
      };
    }

    // Check machine compatibility
    const canOperateMachine = operator.machineTypes?.includes(workItem.machineType) ||
                             operator.primaryMachine === workItem.machineType;
    
    if (!canOperateMachine) {
      return {
        valid: false,
        error: 'Operator is not qualified for this machine type'
      };
    }

    return { valid: true };
  }

  // Atomic bulk assignment operation
  async atomicBulkAssignWork(operations: AtomicAssignmentOperation[]): Promise<{
    successful: AtomicOperationResult[];
    failed: AtomicOperationResult[];
  }> {
    const successful: AtomicOperationResult[] = [];
    const failed: AtomicOperationResult[] = [];

    // Process in smaller batches to avoid timeout
    const batchSize = 10;
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      
      const batchPromises = batch.map(op => this.atomicAssignWork(op));
      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            successful.push(result.value);
          } else {
            failed.push(result.value);
          }
        } else {
          failed.push({
            success: false,
            error: result.reason?.message || 'Operation failed'
          });
        }
      });
    }

    return { successful, failed };
  }

  // Atomic assignment completion
  async atomicCompleteAssignment(
    assignmentId: string,
    completionData: {
      completedPieces: number;
      rejectedPieces: number;
      qualityScore: number;
      actualDuration: number;
      operatorId: string;
    }
  ): Promise<AtomicOperationResult> {
    const lockId = `complete_${assignmentId}_${Date.now()}`;

    try {
      const lockAcquired = await this.acquireDistributedLock(
        assignmentId,
        completionData.operatorId,
        lockId
      );

      if (!lockAcquired.success) {
        return {
          success: false,
          error: 'Failed to acquire completion lock',
          conflictedWith: lockAcquired.conflictedWith
        };
      }

      const result = await transaction(db, async (t) => {
        const assignmentRef = doc(db, 'assignments', assignmentId);
        const assignmentDoc = await t.get(assignmentRef);

        if (!assignmentDoc.exists()) {
          throw new Error('Assignment not found');
        }

        const assignment = { id: assignmentDoc.id, ...assignmentDoc.data() } as WorkAssignment;

        if (assignment.status === 'completed') {
          throw new Error('Assignment already completed');
        }

        if (assignment.operatorId !== completionData.operatorId) {
          throw new Error('Assignment belongs to different operator');
        }

        // Update assignment
        t.update(assignmentRef, {
          status: 'completed',
          completedPieces: completionData.completedPieces,
          rejectedPieces: completionData.rejectedPieces,
          qualityScore: completionData.qualityScore,
          completedAt: serverTimestamp(),
          totalWorkingTime: completionData.actualDuration,
          updatedAt: serverTimestamp()
        });

        // Update work item
        const workItemRef = doc(db, 'workItems', assignment.workItemId);
        t.update(workItemRef, {
          status: 'completed',
          completedPieces: increment(completionData.completedPieces),
          rejectedPieces: increment(completionData.rejectedPieces),
          completedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Update operator stats
        const operatorRef = doc(db, 'operators', assignment.operatorId);
        t.update(operatorRef, {
          currentAssignments: increment(-1),
          completedBundles: increment(1),
          totalWorkingTime: increment(completionData.actualDuration),
          lastCompletedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Log completion
        const completionLogRef = doc(db, 'assignment_operations');
        t.set(completionLogRef, {
          type: 'assignment_completed',
          assignmentId,
          operatorId: assignment.operatorId,
          completedPieces: completionData.completedPieces,
          qualityScore: completionData.qualityScore,
          duration: completionData.actualDuration,
          lockId,
          timestamp: serverTimestamp()
        });

        return { success: true, assignmentId };
      });

      await this.releaseDistributedLock(lockId);
      return result;

    } catch (error) {
      await this.releaseDistributedLock(lockId);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Completion failed'
      };
    }
  }

  // Atomic assignment cancellation/reassignment
  async atomicReassignWork(
    currentAssignmentId: string,
    newOperatorId: string,
    supervisorId: string,
    reason: string
  ): Promise<AtomicOperationResult> {
    const lockId = `reassign_${currentAssignmentId}_${Date.now()}`;

    try {
      const lockAcquired = await this.acquireDistributedLock(
        currentAssignmentId,
        supervisorId,
        lockId
      );

      if (!lockAcquired.success) {
        return {
          success: false,
          error: 'Failed to acquire reassignment lock'
        };
      }

      const result = await transaction(db, async (t) => {
        // Get current assignment
        const assignmentRef = doc(db, 'assignments', currentAssignmentId);
        const assignmentDoc = await t.get(assignmentRef);

        if (!assignmentDoc.exists()) {
          throw new Error('Assignment not found');
        }

        const assignment = { id: assignmentDoc.id, ...assignmentDoc.data() } as WorkAssignment;

        if (['completed', 'cancelled'].includes(assignment.status)) {
          throw new Error('Cannot reassign completed or cancelled assignment');
        }

        // Get new operator
        const newOperatorRef = doc(db, 'operators', newOperatorId);
        const newOperatorDoc = await t.get(newOperatorRef);

        if (!newOperatorDoc.exists()) {
          throw new Error('New operator not found');
        }

        const newOperator = { id: newOperatorDoc.id, ...newOperatorDoc.data() } as any;

        // Validate new operator can take assignment
        const workItemRef = doc(db, 'workItems', assignment.workItemId);
        const workItemDoc = await t.get(workItemRef);
        const workItem = { id: workItemDoc.id, ...workItemDoc.data() } as WorkItem;

        const validation = this.validateAssignmentState(workItem, newOperator);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Cancel current assignment
        t.update(assignmentRef, {
          status: 'cancelled',
          cancelledAt: serverTimestamp(),
          cancelReason: reason,
          updatedAt: serverTimestamp()
        });

        // Create new assignment
        const newAssignmentRef = doc(db, 'assignments');
        const newAssignmentData: WorkAssignment = {
          ...assignment,
          id: newAssignmentRef.id,
          operatorId: newOperatorId,
          assignedBy: supervisorId,
          assignedAt: new Date(),
          status: 'assigned',
          reassignedFrom: currentAssignmentId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        t.set(newAssignmentRef, newAssignmentData);

        // Update work item assignment
        t.update(workItemRef, {
          assignedOperatorId: newOperatorId,
          reassignedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Update old operator stats
        const oldOperatorRef = doc(db, 'operators', assignment.operatorId);
        t.update(oldOperatorRef, {
          currentAssignments: increment(-1),
          updatedAt: serverTimestamp()
        });

        // Update new operator stats
        t.update(newOperatorRef, {
          currentAssignments: increment(1),
          lastAssignedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Log reassignment
        const reassignmentLogRef = doc(db, 'assignment_operations');
        t.set(reassignmentLogRef, {
          type: 'assignment_reassigned',
          originalAssignmentId: currentAssignmentId,
          newAssignmentId: newAssignmentRef.id,
          fromOperatorId: assignment.operatorId,
          toOperatorId: newOperatorId,
          supervisorId,
          reason,
          lockId,
          timestamp: serverTimestamp()
        });

        return {
          success: true,
          assignmentId: newAssignmentRef.id
        };
      });

      await this.releaseDistributedLock(lockId);
      return result;

    } catch (error) {
      await this.releaseDistributedLock(lockId);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Reassignment failed'
      };
    }
  }

  // Cleanup expired locks (should be run periodically)
  async cleanupExpiredLocks(): Promise<void> {
    try {
      const locksRef = db.collection('distributed_locks');
      const expiredQuery = locksRef.where('expiresAt', '<=', new Date());
      const snapshot = await expiredQuery.get();

      if (snapshot.empty) return;

      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      
      console.log(`Cleaned up ${snapshot.size} expired locks`);
    } catch (error) {
      console.error('Failed to cleanup expired locks:', error);
    }
  }

  // Utility function for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const atomicOperationsService = new AtomicOperationsService();