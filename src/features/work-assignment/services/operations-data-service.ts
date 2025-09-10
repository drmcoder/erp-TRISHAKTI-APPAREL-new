// Operations Data Service - Connects work assignment to real Firebase operations data
// Replaces hardcoded mock data with actual operations from bundle_operations collection

import { collection, getDocs, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/config/firebase';

export interface BundleOperation {
  id: string;
  bundleId: string;
  bundleNumber?: string;
  operationId: string;
  operationName?: string;
  name?: string;
  operationNepali?: string;
  nameNepali?: string;
  machineType: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'quality_check' | 'rework';
  assignedOperatorId: string | null;
  pieces: number;
  completedPieces: number;
  pricePerPiece: number;
  estimatedMinutes?: number;
  smvMinutes?: number;
  sequenceOrder?: number;
  priority?: 'normal' | 'high' | 'urgent';
  deadline?: Date;
  createdAt: any;
  updatedAt: any;
}

export interface WorkAssignmentItem {
  id: string;
  bundleNumber: string;
  operation: string;
  operationNepali?: string;
  pieces: number;
  difficulty: number;
  priority: 'normal' | 'high' | 'urgent';
  deadline: string;
  estimatedHours: number;
  machineType: string;
  status: 'pending' | 'assigned' | 'completed';
  assignedOperatorId?: string | null;
}

class OperationsDataService {
  
  /**
   * Get all pending operations from Firebase for work assignment
   */
  async getPendingOperations(): Promise<WorkAssignmentItem[]> {
    try {
      const operationsRef = collection(db, COLLECTIONS.BUNDLE_OPERATIONS);
      const q = query(
        operationsRef,
        where('status', 'in', ['pending', 'assigned']),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const operations: WorkAssignmentItem[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data() as BundleOperation;
        
        // Convert Firebase operation to work assignment format
        const workItem: WorkAssignmentItem = {
          id: doc.id,
          bundleNumber: data.bundleNumber || data.bundleId || 'N/A',
          operation: data.operationName || data.name || data.operationId,
          operationNepali: data.operationNepali || data.nameNepali,
          pieces: data.pieces || 0,
          difficulty: this.calculateDifficulty(data.machineType, data.smvMinutes || data.estimatedMinutes || 0),
          priority: this.determinePriority(data),
          deadline: this.calculateDeadline(data),
          estimatedHours: Math.round((data.smvMinutes || data.estimatedMinutes || 0) / 60 * 100) / 100,
          machineType: data.machineType || 'general',
          status: data.status === 'pending' ? 'pending' : data.status === 'assigned' ? 'assigned' : 'pending',
          assignedOperatorId: data.assignedOperatorId
        };
        
        operations.push(workItem);
      });
      
      console.log(`📋 Loaded ${operations.length} operations for work assignment`);
      return operations;
      
    } catch (error) {
      console.error('Failed to load operations from Firebase:', error);
      // Return fallback mock data if Firebase fails
      return this.getFallbackOperations();
    }
  }

  /**
   * Assign operation to operator
   */
  async assignOperation(operationId: string, operatorId: string): Promise<boolean> {
    try {
      const operationRef = doc(db, COLLECTIONS.BUNDLE_OPERATIONS, operationId);
      await updateDoc(operationRef, {
        assignedOperatorId: operatorId,
        status: 'assigned',
        updatedAt: new Date()
      });
      
      console.log(`✅ Assigned operation ${operationId} to operator ${operatorId}`);
      return true;
      
    } catch (error) {
      console.error('Failed to assign operation:', error);
      return false;
    }
  }

  /**
   * Get operations assigned to a specific operator
   */
  async getOperatorAssignments(operatorId: string): Promise<WorkAssignmentItem[]> {
    try {
      const operationsRef = collection(db, COLLECTIONS.BUNDLE_OPERATIONS);
      const q = query(
        operationsRef,
        where('assignedOperatorId', '==', operatorId),
        where('status', 'in', ['assigned', 'in_progress']),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const operations: WorkAssignmentItem[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data() as BundleOperation;
        
        const workItem: WorkAssignmentItem = {
          id: doc.id,
          bundleNumber: data.bundleNumber || data.bundleId || 'N/A',
          operation: data.operationName || data.name || data.operationId,
          operationNepali: data.operationNepali || data.nameNepali,
          pieces: data.pieces || 0,
          difficulty: this.calculateDifficulty(data.machineType, data.smvMinutes || data.estimatedMinutes || 0),
          priority: this.determinePriority(data),
          deadline: this.calculateDeadline(data),
          estimatedHours: Math.round((data.smvMinutes || data.estimatedMinutes || 0) / 60 * 100) / 100,
          machineType: data.machineType || 'general',
          status: data.status === 'assigned' ? 'assigned' : 'pending',
          assignedOperatorId: data.assignedOperatorId
        };
        
        operations.push(workItem);
      });
      
      return operations;
      
    } catch (error) {
      console.error('Failed to load operator assignments:', error);
      return [];
    }
  }

  /**
   * Calculate operation difficulty based on machine type and time
   */
  private calculateDifficulty(machineType: string, timeMinutes: number): number {
    let baseDifficulty = 2;
    
    // Machine type difficulty
    switch (machineType.toLowerCase()) {
      case 'cutting_machine':
      case 'cutting':
        baseDifficulty = 2;
        break;
      case 'single_needle':
      case 'singleneedle':
        baseDifficulty = 3;
        break;
      case 'overlock':
        baseDifficulty = 4;
        break;
      case 'buttonhole':
      case 'button_hole':
        baseDifficulty = 4;
        break;
      case 'bartack':
      case 'special_machine':
        baseDifficulty = 5;
        break;
      default:
        baseDifficulty = 3;
    }
    
    // Time adjustment
    if (timeMinutes > 15) baseDifficulty = Math.min(5, baseDifficulty + 1);
    if (timeMinutes > 30) baseDifficulty = Math.min(5, baseDifficulty + 1);
    
    return baseDifficulty;
  }

  /**
   * Determine priority based on various factors
   */
  private determinePriority(operation: BundleOperation): 'normal' | 'high' | 'urgent' {
    // If priority is already set
    if (operation.priority) return operation.priority;
    
    // Check sequence order for priority
    if (operation.sequenceOrder && operation.sequenceOrder <= 2) return 'high';
    
    // Check if overdue (simple logic for demo)
    const now = new Date();
    const created = operation.createdAt?.toDate ? operation.createdAt.toDate() : new Date(operation.createdAt);
    const hoursSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceCreation > 48) return 'urgent'; // Older than 2 days
    if (hoursSinceCreation > 24) return 'high';   // Older than 1 day
    
    return 'normal';
  }

  /**
   * Calculate deadline string
   */
  private calculateDeadline(operation: BundleOperation): string {
    const now = new Date();
    const estimatedMinutes = operation.smvMinutes || operation.estimatedMinutes || 120;
    
    // Add estimated time plus 2 hours buffer
    const deadline = new Date(now.getTime() + (estimatedMinutes + 120) * 60 * 1000);
    
    return deadline.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }

  /**
   * Fallback operations when Firebase is unavailable
   */
  private getFallbackOperations(): WorkAssignmentItem[] {
    console.log('🔄 Using fallback operations data');
    
    return [
      {
        id: 'fallback_1',
        bundleNumber: 'TSA-001',
        operation: 'Check Firebase Connection',
        pieces: 1,
        difficulty: 2,
        priority: 'high',
        deadline: '18:00',
        estimatedHours: 0.5,
        machineType: 'computer',
        status: 'pending'
      },
      {
        id: 'fallback_2',
        bundleNumber: 'TSA-002', 
        operation: 'Initialize Sample Data',
        pieces: 1,
        difficulty: 3,
        priority: 'urgent',
        deadline: '17:30',
        estimatedHours: 1,
        machineType: 'database',
        status: 'pending'
      }
    ];
  }

  /**
   * Refresh operations data (used by components to reload data)
   */
  async refreshOperations(): Promise<WorkAssignmentItem[]> {
    return this.getPendingOperations();
  }
}

export const operationsDataService = new OperationsDataService();
export default operationsDataService;