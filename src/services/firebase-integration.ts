// Firebase Integration Layer - Connects Business Logic with Firebase Services
// Implements the actual data operations that our business logic depends on

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch,
  runTransaction,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';

import { 
  ref,
  set,
  get,
  update,
  remove,
  push,
  onValue,
  off,
  serverTimestamp as rtdbServerTimestamp
} from 'firebase/database';

import { db, rtdb, COLLECTIONS, RT_PATHS } from '@/config/firebase';
import { operatorBusinessLogic } from '@/features/operators/business/operator-business-logic';
import { supervisorBusinessLogic } from '@/features/supervisors/business/supervisor-business-logic';
import { managementBusinessLogic } from '@/features/management/business/management-business-logic';
import businessLogic from '@/lib/businessLogic';

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  metadata?: any;
}

// Operator Integration Service
export class OperatorIntegrationService {
  
  // Create operator with business logic validation
  static async createOperator(operatorData: any): Promise<ServiceResponse<any>> {
    try {
      // Run business logic validation
      const validation = operatorBusinessLogic.validateOperatorCreation(operatorData);
      
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          code: 'VALIDATION_FAILED'
        };
      }

      // Add timestamps and metadata
      const enrichedData = {
        ...operatorData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        active: true,
        realtimeStatus: {
          status: 'idle',
          currentWorkItems: 0,
          lastUpdated: serverTimestamp()
        }
      };

      // Create operator in Firestore
      const operatorRef = await addDoc(collection(db, COLLECTIONS.OPERATORS), enrichedData);
      
      // Initialize operator wallet
      await addDoc(collection(db, COLLECTIONS.OPERATOR_WALLETS), {
        operatorId: operatorRef.id,
        availableAmount: 0,
        heldAmount: 0,
        totalEarned: 0,
        heldBundles: [],
        canWithdraw: true,
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      // Initialize realtime status
      await set(ref(rtdb, `${RT_PATHS.OPERATOR_STATUS}/${operatorRef.id}`), {
        status: 'idle',
        currentWorkItems: 0,
        lastUpdated: rtdbServerTimestamp(),
        currentLocation: operatorData.defaultStation || 'unassigned',
        machineStatus: 'ready'
      });

      return {
        success: true,
        data: { id: operatorRef.id, ...enrichedData },
        metadata: {
          warnings: validation.warnings,
          validationPassed: true
        }
      };

    } catch (error) {
      console.error('Error creating operator:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create operator',
        code: 'CREATION_FAILED'
      };
    }
  }

  // Get operator performance analysis
  static async getOperatorPerformance(operatorId: string): Promise<ServiceResponse<any>> {
    try {
      const operatorDoc = await getDoc(doc(db, COLLECTIONS.OPERATORS, operatorId));
      
      if (!operatorDoc.exists()) {
        return { success: false, error: 'Operator not found', code: 'NOT_FOUND' };
      }

      const operator = { id: operatorDoc.id, ...operatorDoc.data() };
      const performance = operatorBusinessLogic.analyzePerformance(operator);

      return {
        success: true,
        data: {
          operator,
          performance,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Error getting operator performance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get performance',
        code: 'PERFORMANCE_FETCH_FAILED'
      };
    }
  }

  // Update operator with business rule validation
  static async updateOperatorStatus(
    operatorId: string, 
    updates: any, 
    userId?: string
  ): Promise<ServiceResponse<any>> {
    try {
      const batch = writeBatch(db);
      
      // Update Firestore document
      const operatorRef = doc(db, COLLECTIONS.OPERATORS, operatorId);
      batch.update(operatorRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      });

      // Update realtime status if status changed
      if (updates.currentStatus) {
        const rtStatusRef = ref(rtdb, `${RT_PATHS.OPERATOR_STATUS}/${operatorId}`);
        await update(rtStatusRef, {
          status: updates.currentStatus,
          lastUpdated: rtdbServerTimestamp()
        });
      }

      await batch.commit();

      return { success: true, data: { operatorId, updates } };

    } catch (error) {
      console.error('Error updating operator:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update operator',
        code: 'UPDATE_FAILED'
      };
    }
  }
}

// Work Assignment Integration Service
export class WorkAssignmentIntegrationService {

  // Create work assignment with AI recommendations
  static async createWorkAssignment(workData: any): Promise<ServiceResponse<any>> {
    try {
      // Get available operators
      const operatorsQuery = query(
        collection(db, COLLECTIONS.OPERATORS),
        where('active', '==', true),
        where('currentStatus', '==', 'idle')
      );
      
      const operatorsSnapshot = await getDocs(operatorsQuery);
      const operators = operatorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Generate AI recommendations for each operator
      const recommendations = operators.map(operator => ({
        operator,
        recommendation: businessLogic.recommendationEngine.generateRecommendations(workData, operator),
        matchScore: businessLogic.workAssignmentLogic.calculateMatchScore(workData, operator)
      }));

      // Sort by match score
      recommendations.sort((a, b) => b.matchScore.totalScore - a.matchScore.totalScore);

      // Create work item with recommendations
      const workItemData = {
        ...workData,
        status: 'available',
        priority: businessLogic.workAssignmentLogic.calculatePriorityScore(workData),
        aiRecommendations: recommendations.slice(0, 5), // Top 5 recommendations
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const workItemRef = await addDoc(collection(db, COLLECTIONS.WORK_ITEMS), workItemData);

      // Update realtime available work
      await set(ref(rtdb, `${RT_PATHS.AVAILABLE_WORK}/${workItemRef.id}`), {
        ...workItemData,
        createdAt: rtdbServerTimestamp()
      });

      return {
        success: true,
        data: { 
          id: workItemRef.id, 
          ...workItemData,
          topRecommendations: recommendations.slice(0, 3)
        }
      };

    } catch (error) {
      console.error('Error creating work assignment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create work assignment',
        code: 'ASSIGNMENT_CREATION_FAILED'
      };
    }
  }

  // Process self-assignment with atomic operations
  static async processSelfAssignment(
    workItemId: string,
    operatorId: string,
    reason?: string
  ): Promise<ServiceResponse<any>> {
    try {
      return await runTransaction(db, async (transaction) => {
        // Read work item and operator
        const workItemRef = doc(db, COLLECTIONS.WORK_ITEMS, workItemId);
        const operatorRef = doc(db, COLLECTIONS.OPERATORS, operatorId);
        
        const [workItemDoc, operatorDoc] = await Promise.all([
          transaction.get(workItemRef),
          transaction.get(operatorRef)
        ]);

        if (!workItemDoc.exists() || !operatorDoc.exists()) {
          throw new Error('Work item or operator not found');
        }

        const workItem = workItemDoc.data();
        const operator = operatorDoc.data();

        // Check if work is still available
        if (workItem?.status !== 'available') {
          throw new Error('Work item is no longer available');
        }

        // Run business logic validation
        const workAssignmentRule = operatorBusinessLogic.validateWorkAssignment(
          operator, 
          {
            machineType: workItem?.machineType,
            estimatedDuration: workItem?.estimatedDuration || 30,
            skillRequired: workItem?.requiredSkillLevel || 'beginner',
            priority: workItem?.priority || 'normal'
          }
        );

        if (!workAssignmentRule.canAssign) {
          throw new Error(workAssignmentRule.reason || 'Cannot assign work');
        }

        // Update work item
        transaction.update(workItemRef, {
          status: 'assigned',
          operatorId,
          assignedAt: serverTimestamp(),
          assignmentType: 'self_assigned',
          assignmentReason: reason,
          assignmentValidation: workAssignmentRule
        });

        // Update operator
        const currentWork = operator.realtimeStatus?.currentWorkItems || 0;
        transaction.update(operatorRef, {
          currentStatus: 'working',
          'realtimeStatus.currentWorkItems': currentWork + 1,
          'realtimeStatus.lastUpdated': serverTimestamp()
        });

        // Create assignment record
        const assignmentData = {
          workItemId,
          operatorId,
          assignedAt: serverTimestamp(),
          assignmentType: 'self_assigned',
          status: 'active',
          validation: workAssignmentRule,
          reason
        };

        const assignmentRef = doc(collection(db, COLLECTIONS.WORK_ASSIGNMENTS));
        transaction.set(assignmentRef, assignmentData);

        return {
          success: true,
          data: { 
            assignmentId: assignmentRef.id,
            workItemId,
            operatorId,
            validation: workAssignmentRule
          }
        };
      });

    } catch (error) {
      console.error('Error processing self-assignment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Assignment failed',
        code: 'SELF_ASSIGNMENT_FAILED'
      };
    }
  }
}

// Quality and Damage Integration Service
export class QualityIntegrationService {

  // Process damage report with payment calculations
  static async processDamageReport(
    damageData: {
      workItemId: string;
      operatorId: string;
      supervisorId: string;
      damageType: string;
      severity: string;
      affectedPieces: number;
      description: string;
      operatorFault: boolean;
    }
  ): Promise<ServiceResponse<any>> {
    try {
      return await runTransaction(db, async (transaction) => {
        // Get work item and operator data
        const workItemRef = doc(db, COLLECTIONS.WORK_ITEMS, damageData.workItemId);
        const operatorRef = doc(db, COLLECTIONS.OPERATORS, damageData.operatorId);
        
        const [workItemDoc, operatorDoc] = await Promise.all([
          transaction.get(workItemRef),
          transaction.get(operatorRef)
        ]);

        if (!workItemDoc.exists() || !operatorDoc.exists()) {
          throw new Error('Work item or operator not found');
        }

        const workItem = workItemDoc.data();
        const operator = operatorDoc.data();

        // Calculate payment impact using business logic
        const paymentCalculation = businessLogic.paymentLogic.calculateDamageAwarePayment(
          {
            rate: workItem?.ratePerPiece || 0,
            totalPieces: workItem?.totalPieces || 0
          },
          {
            piecesCompleted: workItem?.completedPieces || 0,
            efficiency: operator.averageEfficiency,
            qualityScore: operator.qualityScore
          },
          [damageData]
        );

        // Create damage report
        const damageReportData = {
          ...damageData,
          paymentImpact: paymentCalculation,
          status: 'reported',
          reportedAt: serverTimestamp(),
          resolved: false
        };

        const damageReportRef = doc(collection(db, COLLECTIONS.DAMAGE_REPORTS));
        transaction.set(damageReportRef, damageReportData);

        // If operator fault, hold payment
        if (damageData.operatorFault && paymentCalculation.penalties > 0) {
          // Update operator wallet - hold payment
          const walletQuery = query(
            collection(db, COLLECTIONS.OPERATOR_WALLETS),
            where('operatorId', '==', damageData.operatorId),
            limit(1)
          );
          
          // Note: This is a simplified version. In production, you'd need to handle this properly
          transaction.update(operatorRef, {
            'paymentStatus.held': true,
            'paymentStatus.heldAmount': paymentCalculation.penalties,
            'paymentStatus.reason': 'damage_reported',
            updatedAt: serverTimestamp()
          });
        }

        // Update work item quality metrics
        const qualityMetrics = businessLogic.qualityLogic.calculateQualityMetrics(
          workItem?.completedPieces || 0,
          [damageData]
        );

        transaction.update(workItemRef, {
          qualityScore: qualityMetrics.qualityScore,
          defectRate: qualityMetrics.defectRate,
          qualityMetrics,
          lastDamageReport: damageReportRef.id,
          updatedAt: serverTimestamp()
        });

        return {
          success: true,
          data: {
            damageReportId: damageReportRef.id,
            paymentImpact: paymentCalculation,
            qualityMetrics,
            actionTaken: damageData.operatorFault ? 'payment_held' : 'no_penalty'
          }
        };
      });

    } catch (error) {
      console.error('Error processing damage report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process damage report',
        code: 'DAMAGE_PROCESSING_FAILED'
      };
    }
  }
}

// Supervisor Integration Service
export class SupervisorIntegrationService {

  // Process assignment request approval
  static async processAssignmentApproval(
    requestId: string,
    supervisorId: string,
    decision: 'approve' | 'reject',
    notes?: string
  ): Promise<ServiceResponse<any>> {
    try {
      // Get assignment request
      const requestDoc = await getDoc(doc(db, COLLECTIONS.WORK_ASSIGNMENTS, requestId));
      
      if (!requestDoc.exists()) {
        return { success: false, error: 'Assignment request not found', code: 'NOT_FOUND' };
      }

      const request = requestDoc.data();
      
      // Get supervisor data for authorization
      const supervisorDoc = await getDoc(doc(db, COLLECTIONS.SUPERVISORS, supervisorId));
      if (!supervisorDoc.exists()) {
        return { success: false, error: 'Supervisor not found', code: 'UNAUTHORIZED' };
      }

      const supervisor = supervisorDoc.data();

      // Update assignment request
      const updateData = {
        status: decision === 'approve' ? 'approved' : 'rejected',
        processedBy: supervisorId,
        processedAt: serverTimestamp(),
        processingNotes: notes,
        finalDecision: decision
      };

      await updateDoc(doc(db, COLLECTIONS.WORK_ASSIGNMENTS, requestId), updateData);

      // If approved, update work item and operator status
      if (decision === 'approve') {
        const batch = writeBatch(db);
        
        // Update work item
        const workItemRef = doc(db, COLLECTIONS.WORK_ITEMS, request.workItemId);
        batch.update(workItemRef, {
          status: 'assigned',
          supervisorApproved: true,
          approvedBy: supervisorId,
          approvedAt: serverTimestamp()
        });

        // Update operator status
        const operatorRef = doc(db, COLLECTIONS.OPERATORS, request.operatorId);
        batch.update(operatorRef, {
          currentStatus: 'working',
          'realtimeStatus.currentWorkItems': increment(1),
          'realtimeStatus.lastUpdated': serverTimestamp()
        });

        await batch.commit();
      }

      return {
        success: true,
        data: {
          requestId,
          decision,
          processedBy: supervisorId,
          notes
        }
      };

    } catch (error) {
      console.error('Error processing assignment approval:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process approval',
        code: 'APPROVAL_PROCESSING_FAILED'
      };
    }
  }
}

// Real-time Integration Service
export class RealtimeIntegrationService {
  private static listeners: Map<string, () => void> = new Map();

  // Subscribe to operator status changes
  static subscribeToOperatorStatus(
    operatorId: string,
    callback: (status: any) => void
  ): () => void {
    const statusRef = ref(rtdb, `${RT_PATHS.OPERATOR_STATUS}/${operatorId}`);
    
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const status = snapshot.val();
      callback(status);
    });

    const listenerId = `operator_${operatorId}`;
    this.listeners.set(listenerId, unsubscribe);

    return () => {
      unsubscribe();
      this.listeners.delete(listenerId);
    };
  }

  // Subscribe to available work updates
  static subscribeToAvailableWork(callback: (work: any[]) => void): () => void {
    const workRef = ref(rtdb, RT_PATHS.AVAILABLE_WORK);
    
    const unsubscribe = onValue(workRef, (snapshot) => {
      const workData = snapshot.val();
      const workArray = workData ? Object.keys(workData).map(key => ({
        id: key,
        ...workData[key]
      })) : [];
      callback(workArray);
    });

    const listenerId = 'available_work';
    this.listeners.set(listenerId, unsubscribe);

    return () => {
      unsubscribe();
      this.listeners.delete(listenerId);
    };
  }

  // Cleanup all listeners
  static cleanup(): void {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
  }
}

// Export all integration services
export const firebaseIntegration = {
  operator: OperatorIntegrationService,
  workAssignment: WorkAssignmentIntegrationService,
  quality: QualityIntegrationService,
  supervisor: SupervisorIntegrationService,
  realtime: RealtimeIntegrationService
};