// Assignment Request Queue Service
// Manages queued assignment requests with priority handling and automatic processing

import { 
  collection, 
  doc, 
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { AssignmentRequest, WorkItem } from '../types';

// Define OperatorSummary locally
interface OperatorSummary {
  id: string;
  name: string;
  skillLevel: string;
  machineTypes: string[];
  efficiency: number;
  qualityScore: number;
  currentWorkload: number;
}
import { atomicOperationsService } from './atomic-operations';
import { aiRecommendationEngine } from './ai-recommendation-engine';

export interface QueuedRequest extends AssignmentRequest {
  queuePosition: number;
  processingAttempts: number;
  lastProcessedAt?: Date;
  nextProcessingAt?: Date;
  processingStatus: 'pending' | 'processing' | 'failed' | 'completed';
  failureReason?: string;
  autoProcessingEnabled: boolean;
}

export interface QueueConfig {
  maxConcurrentProcessing: number;
  processingIntervalMs: number;
  maxRetryAttempts: number;
  retryBackoffMultiplier: number;
  priorityWeights: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface QueueStats {
  totalPending: number;
  totalProcessing: number;
  totalCompleted: number;
  totalFailed: number;
  avgProcessingTime: number;
  successRate: number;
}

export class AssignmentRequestQueue {
  private processingInterval: NodeJS.Timeout | null = null;
  private unsubscribeCallbacks: (() => void)[] = [];
  private isProcessing = false;
  
  private config: QueueConfig = {
    maxConcurrentProcessing: 5,
    processingIntervalMs: 10000, // 10 seconds
    maxRetryAttempts: 3,
    retryBackoffMultiplier: 2,
    priorityWeights: {
      urgent: 100,
      high: 75,
      medium: 50,
      low: 25
    }
  };

  constructor(customConfig?: Partial<QueueConfig>) {
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }
    this.startQueueProcessor();
  }

  // Add request to queue
  async enqueueRequest(request: AssignmentRequest): Promise<{
    success: boolean;
    queuePosition?: number;
    estimatedProcessingTime?: Date;
    error?: string;
  }> {
    try {
      // Calculate queue position and priority score
      const queuePosition = await this.calculateQueuePosition(request);
      const priorityScore = this.calculatePriorityScore(request);
      
      const queuedRequest: QueuedRequest = {
        ...request,
        queuePosition,
        processingAttempts: 0,
        processingStatus: 'pending',
        autoProcessingEnabled: true,
        priorityScore
      };

      // Add to Firestore queue collection
      const queueRef = collection(db, 'assignment_queue');
      const docRef = doc(queueRef);
      await setDoc(docRef, {
        ...queuedRequest,
        enqueuedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Calculate estimated processing time
      const estimatedProcessingTime = this.estimateProcessingTime(queuePosition);

      // Update queue positions for other requests
      await this.updateQueuePositions();

      return {
        success: true,
        queuePosition,
        estimatedProcessingTime
      };

    } catch (error) {
      console.error('Failed to enqueue request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enqueue request'
      };
    }
  }

  // Remove request from queue
  async dequeueRequest(requestId: string, reason: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const batch = writeBatch(db);
      
      // Mark request as removed
      const requestRef = doc(db, 'assignment_queue', requestId);
      batch.update(requestRef, {
        processingStatus: 'completed',
        removedAt: serverTimestamp(),
        removeReason: reason,
        updatedAt: serverTimestamp()
      });

      await batch.commit();

      // Update queue positions
      await this.updateQueuePositions();

      return { success: true };

    } catch (error) {
      console.error('Failed to dequeue request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to dequeue request'
      };
    }
  }

  // Get queue status for a specific request
  async getRequestStatus(requestId: string): Promise<{
    position?: number;
    status: string;
    estimatedProcessingTime?: Date;
    processingAttempts: number;
    lastFailureReason?: string;
  }> {
    try {
      const requestRef = doc(db, 'assignment_queue', requestId);
      const requestDoc = await getDoc(requestRef);

      if (!requestDoc.exists()) {
        return {
          status: 'not_found',
          processingAttempts: 0
        };
      }

      const request = requestDoc.data() as QueuedRequest;
      
      return {
        position: request.queuePosition,
        status: request.processingStatus,
        estimatedProcessingTime: request.nextProcessingAt,
        processingAttempts: request.processingAttempts,
        lastFailureReason: request.failureReason
      };

    } catch (error) {
      console.error('Failed to get request status:', error);
      return {
        status: 'error',
        processingAttempts: 0
      };
    }
  }

  // Get queue statistics
  async getQueueStats(): Promise<QueueStats> {
    try {
      const queueRef = collection(db, 'assignment_queue');
      
      const [pendingSnapshot, processingSnapshot, completedSnapshot, failedSnapshot] = await Promise.all([
        getDocs(query(queueRef, where('processingStatus', '==', 'pending'))),
        getDocs(query(queueRef, where('processingStatus', '==', 'processing'))),
        getDocs(query(queueRef, where('processingStatus', '==', 'completed'))),
        getDocs(query(queueRef, where('processingStatus', '==', 'failed')))      ]);

      const totalPending = pendingSnapshot.size;
      const totalProcessing = processingSnapshot.size;
      const totalCompleted = completedSnapshot.size;
      const totalFailed = failedSnapshot.size;

      // Calculate average processing time from completed requests
      let avgProcessingTime = 0;
      if (totalCompleted > 0) {
        const processingTimes = completedSnapshot.docs.map(doc => {
          const data = doc.data();
          const enqueuedAt = data.enqueuedAt?.toDate();
          const completedAt = data.completedAt?.toDate();
          
          if (enqueuedAt && completedAt) {
            return completedAt.getTime() - enqueuedAt.getTime();
          }
          return 0;
        }).filter(time => time > 0);

        if (processingTimes.length > 0) {
          avgProcessingTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
        }
      }

      const successRate = totalCompleted + totalFailed > 0 
        ? (totalCompleted / (totalCompleted + totalFailed)) * 100 
        : 0;

      return {
        totalPending,
        totalProcessing,
        totalCompleted,
        totalFailed,
        avgProcessingTime,
        successRate
      };

    } catch (error) {
      console.error('Failed to get queue stats:', error);
      return {
        totalPending: 0,
        totalProcessing: 0,
        totalCompleted: 0,
        totalFailed: 0,
        avgProcessingTime: 0,
        successRate: 0
      };
    }
  }

  // Start automatic queue processing
  private startQueueProcessor(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, this.config.processingIntervalMs);

    // Initial processing
    this.processQueue();
  }

  // Stop queue processing
  stopQueueProcessor(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    // Unsubscribe from Firestore listeners
    this.unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
    this.unsubscribeCallbacks = [];
  }

  // Main queue processing logic
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;

    try {
      // Get pending requests ordered by priority and queue position
      const queueRef = collection(db, 'assignment_queue');
      const pendingQuery = query(
        queueRef,
        where('processingStatus', '==', 'pending'),
        where('autoProcessingEnabled', '==', true),
        orderBy('priorityScore', 'desc'),
        orderBy('queuePosition', 'asc')
      );

      const snapshot = await getDocs(pendingQuery);
      const pendingRequests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (QueuedRequest & { id: string })[];

      // Limit concurrent processing
      const requestsToProcess = pendingRequests.slice(0, this.config.maxConcurrentProcessing);

      // Process requests in parallel
      const processingPromises = requestsToProcess.map(request =>
        this.processIndividualRequest(request)
      );

      await Promise.allSettled(processingPromises);

    } catch (error) {
      console.error('Queue processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Process individual request
  private async processIndividualRequest(request: QueuedRequest & { id: string }): Promise<void> {
    try {
      // Mark as processing
      await this.updateRequestStatus(request.id, 'processing');

      // Get latest work item and operator data
      const [workItem, operator] = await this.getAssignmentData(
        request.workItemId,
        request.operatorId
      );

      if (!workItem || !operator) {
        throw new Error('Work item or operator not found');
      }

      // Validate assignment is still possible
      const validationResult = await this.validateAssignmentStillValid(workItem, operator);
      if (!validationResult.valid) {
        throw new Error(validationResult.reason);
      }

      // Get AI recommendation for final validation
      const recommendations = await aiRecommendationEngine.getRecommendations(
        {
          workItemId: request.workItemId,
          requiredSkills: [workItem.operation],
          machineType: workItem.machineType,
          complexity: this.assessWorkComplexity(workItem),
          urgency: this.determineUrgency(workItem),
          estimatedDuration: workItem.estimatedDuration,
          qualityRequirement: 0.8
        },
        [operator]
      );

      if (recommendations.length === 0 || recommendations[0].confidenceScore < 50) {
        throw new Error('AI recommendation below threshold');
      }

      // Perform atomic assignment
      const assignmentResult = await atomicOperationsService.atomicAssignWork({
        workItemId: request.workItemId,
        operatorId: request.operatorId,
        supervisorId: 'system', // Auto-assignment by system
        assignmentData: {
          assignmentMethod: 'auto_assigned',
          notes: `Auto-assigned from queue (confidence: ${recommendations[0].confidenceScore}%)`
        },
        timestamp: new Date()
      });

      if (!assignmentResult.success) {
        throw new Error(assignmentResult.error || 'Assignment failed');
      }

      // Mark as completed
      await this.updateRequestStatus(request.id, 'completed', {
        assignmentId: assignmentResult.assignmentId,
        completedAt: serverTimestamp(),
        processingDuration: Date.now() - (request.requestedAt?.getTime() || Date.now())
      });

      // Log successful processing
      await this.logRequestProcessing(request.id, 'completed', {
        assignmentId: assignmentResult.assignmentId,
        confidence: recommendations[0].confidenceScore
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Processing failed';
      
      // Increment processing attempts
      const newAttempts = request.processingAttempts + 1;
      
      if (newAttempts >= this.config.maxRetryAttempts) {
        // Mark as failed
        await this.updateRequestStatus(request.id, 'failed', {
          failureReason: errorMessage,
          failedAt: serverTimestamp()
        });
      } else {
        // Schedule retry with backoff
        const retryDelay = this.config.processingIntervalMs * 
          Math.pow(this.config.retryBackoffMultiplier, newAttempts);
        
        await this.updateRequestStatus(request.id, 'pending', {
          processingAttempts: newAttempts,
          failureReason: errorMessage,
          nextProcessingAt: new Date(Date.now() + retryDelay),
          lastProcessedAt: serverTimestamp()
        });
      }

      // Log failed processing
      await this.logRequestProcessing(request.id, 'failed', {
        error: errorMessage,
        attempt: newAttempts
      });
    }
  }

  // Helper methods
  private async calculateQueuePosition(request: AssignmentRequest): Promise<number> {
    const queueRef = collection(db, 'assignment_queue');
    const pendingQuery = query(queueRef, where('processingStatus', '==', 'pending'));
    const snapshot = await getDocs(pendingQuery);
    
    return snapshot.size + 1;
  }

  private calculatePriorityScore(request: AssignmentRequest): number {
    const score = request.priorityScore || 50; // Base score

    // Add urgency bonus
    const urgencyBonus = {
      urgent: this.config.priorityWeights.urgent,
      high: this.config.priorityWeights.high,
      medium: this.config.priorityWeights.medium,
      low: this.config.priorityWeights.low
    };

    // Add time-based urgency (older requests get higher priority)
    const hoursOld = (Date.now() - request.requestedAt.getTime()) / (1000 * 60 * 60);
    const timeBonus = Math.min(50, hoursOld * 2); // Max 50 points for time

    return score + timeBonus;
  }

  private estimateProcessingTime(queuePosition: number): Date {
    const avgProcessingTime = 30000; // 30 seconds per request
    const estimatedMs = queuePosition * avgProcessingTime;
    return new Date(Date.now() + estimatedMs);
  }

  private async updateQueuePositions(): Promise<void> {
    // This would update queue positions based on priority
    // Implementation would reorder all pending requests
  }

  private async updateRequestStatus(
    requestId: string, 
    status: QueuedRequest['processingStatus'],
    additionalData?: any
  ): Promise<void> {
    const requestRef = doc(db, 'assignment_queue', requestId);
    await requestRef.update({
      processingStatus: status,
      updatedAt: serverTimestamp(),
      ...additionalData
    });
  }

  private async getAssignmentData(
    workItemId: string,
    operatorId: string
  ): Promise<[WorkItem | null, OperatorSummary | null]> {
    try {
      const [workItemDoc, operatorDoc] = await Promise.all([
        getDoc(doc(db, 'workItems', workItemId)),
        getDoc(doc(db, 'operators', operatorId))      ]);

      const workItem = workItemDoc.exists() ? 
        { id: workItemDoc.id, ...workItemDoc.data() } as WorkItem : null;
      
      const operator = operatorDoc.exists() ? 
        { id: operatorDoc.id, ...operatorDoc.data() } as OperatorSummary : null;

      return [workItem, operator];
    } catch (error) {
      return [null, null];
    }
  }

  private async validateAssignmentStillValid(
    workItem: WorkItem,
    operator: OperatorSummary
  ): Promise<{ valid: boolean; reason?: string }> {
    // Check if work item is still available
    if (['assigned', 'completed', 'cancelled'].includes(workItem.status)) {
      return { valid: false, reason: `Work item is ${workItem.status}` };
    }

    // Check operator availability
    if (operator.currentStatus === 'offline') {
      return { valid: false, reason: 'Operator is offline' };
    }

    // Check workload capacity (mock implementation)
    const currentLoad = 2; // Would get from actual data
    if (currentLoad >= (operator.maxConcurrentWork || 5)) {
      return { valid: false, reason: 'Operator at capacity' };
    }

    return { valid: true };
  }

  private assessWorkComplexity(workItem: WorkItem): number {
    // Simple complexity assessment based on operation type
    const complexityMap: Record<string, number> = {
      'cutting': 3,
      'sewing': 5,
      'stitching': 4,
      'embroidery': 8,
      'finishing': 3,
      'button_hole': 7
    };

    const operation = workItem.operation.toLowerCase();
    for (const [key, complexity] of Object.entries(complexityMap)) {
      if (operation.includes(key)) {
        return complexity;
      }
    }

    return 5; // Default complexity
  }

  private determineUrgency(workItem: WorkItem): 'low' | 'medium' | 'high' | 'urgent' {
    // Would determine based on deadlines, priority flags, etc.
    return 'medium'; // Default
  }

  private async logRequestProcessing(
    requestId: string,
    result: 'completed' | 'failed',
    metadata: any
  ): Promise<void> {
    try {
      const logRef = doc(collection(db, 'queue_processing_logs'));
      await logRef.set({
        requestId,
        result,
        metadata,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to log request processing:', error);
    }
  }
}

// Singleton instance
export const assignmentRequestQueue = new AssignmentRequestQueue();