// Work Assignment Service with atomic self-assignment
import { 
  ref, 
  runTransaction, 
  serverTimestamp, 
  set, 
  onValue 
} from 'firebase/database';
import { rtdb, RT_PATHS } from '../config/firebase';
import { BaseService } from './base-service';
import type { ServiceResponse } from './base-service';

interface WorkAssignmentData {
  workId: string;
  operatorId: string;
  operatorInfo: {
    name: string;
    machineType: string;
  };
}

interface AtomicAssignmentResult extends ServiceResponse {
  workData?: any;
  message: string;
}

/**
 * WorkAssignmentService - Handles atomic work assignment with race condition prevention
 * Based on BUSINESS_LOGIC_ALGORITHMS.md line 339-397
 */
export class WorkAssignmentService extends BaseService {
  constructor() {
    super('workAssignments');
  }

  /**
   * Atomic self-assignment with race condition protection
   * Implements algorithm from documentation line 342-396
   */
  static async atomicSelfAssign(
    workId: string, 
    operatorId: string, 
    operatorInfo: { name: string; machineType: string }
  ): Promise<AtomicAssignmentResult> {
    const workRef = ref(rtdb, `${RT_PATHS.AVAILABLE_WORK}/${workId}`);
    
    try {
      const result = await runTransaction(workRef, (currentData) => {
        // Check if work is still available
        if (!currentData) {
          return; // Abort - work doesn't exist
        }
        
        if (currentData.assigned && currentData.assignedTo) {
          return; // Abort - already assigned
        }
        
        if (currentData.status !== 'available') {
          return; // Abort - not available
        }
        
        // SUCCESS: Assign the work atomically
        return {
          ...currentData,
          assigned: true,
          assignedTo: operatorId,
          assignedAt: serverTimestamp(),
          operatorName: operatorInfo.name,
          operatorMachine: operatorInfo.machineType,
          status: 'assigned',
          assignmentMethod: 'self-assign'
        };
      });
      
      if (result.committed) {
        // Update operator status in parallel (non-blocking)
        this.updateOperatorAssignment(operatorId, workId, result.snapshot.val());
        
        return {
          success: true,
          workData: result.snapshot.val(),
          message: 'Work assigned successfully'
        };
      } else {
        return {
          success: false,
          error: 'Work already assigned to another operator',
          message: 'Someone else got this work first!',
          code: 'ASSIGNMENT_CONFLICT'
        };
      }
    } catch (error) {
      console.error('Atomic assignment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Assignment failed',
        message: 'Assignment failed due to system error',
        code: 'SYSTEM_ERROR'
      };
    }
  }

  /**
   * Update operator assignment status
   */
  private static async updateOperatorAssignment(
    operatorId: string, 
    workId: string, 
    workData: any
  ): Promise<void> {
    try {
      const operatorStatusRef = ref(rtdb, `${RT_PATHS.OPERATOR_STATUS}/${operatorId}`);
      await set(operatorStatusRef, {
        status: 'working',
        currentWork: workId,
        assignedAt: serverTimestamp(),
        workData: {
          workId: workId,
          bundleId: workData.bundleId,
          operation: workData.operation,
          pieces: workData.pieces
        },
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to update operator status:', error);
      // Non-critical error - don't throw
    }
  }

  /**
   * Release work assignment
   */
  static async releaseWork(workId: string, operatorId: string): Promise<ServiceResponse> {
    try {
      const workRef = ref(rtdb, `${RT_PATHS.AVAILABLE_WORK}/${workId}`);
      
      await set(workRef, {
        assigned: false,
        assignedTo: null,
        assignedAt: null,
        operatorName: null,
        operatorMachine: null,
        status: 'available',
        assignmentMethod: null,
        releasedAt: serverTimestamp(),
        releasedBy: operatorId
      });

      // Update operator status
      const operatorStatusRef = ref(rtdb, `${RT_PATHS.OPERATOR_STATUS}/${operatorId}`);
      await set(operatorStatusRef, {
        status: 'idle',
        currentWork: null,
        lastActivity: serverTimestamp()
      });

      return {
        success: true,
        message: 'Work released successfully'
      };
    } catch (error) {
      console.error('Failed to release work:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to release work',
        code: 'RELEASE_FAILED'
      };
    }
  }

  /**
   * Subscribe to available work updates
   */
  static subscribeToAvailableWork(callback: (workItems: any[]) => void): () => void {
    const workRef = ref(rtdb, RT_PATHS.AVAILABLE_WORK);
    
    return onValue(workRef, (snapshot) => {
      const workData = snapshot.val() || {};
      const workItems = Object.entries(workData)
        .filter(([_, work]: [string, any]) => work.status === 'available' && !work.assigned)
        .map(([id, work]: [string, any]) => ({ id, ...work }));
      
      callback(workItems);
    }, (error) => {
      console.error('Error subscribing to available work:', error);
      callback([]);
    });
  }

  /**
   * Test race condition handling (for development/testing)
   */
  static async testRaceCondition(workId: string, operatorIds: string[]): Promise<ServiceResponse[]> {
    const results = await Promise.allSettled(
      operatorIds.map(operatorId => 
        this.atomicSelfAssign(workId, operatorId, {
          name: `Operator ${operatorId}`,
          machineType: 'overlock'
        })
      )
    );

    return results.map((result, index) => ({
      operatorId: operatorIds[index],
      result: result.status === 'fulfilled' ? result.value : { 
        success: false, 
        error: result.reason?.message || 'Unknown error' 
      }
    }));
  }

  /**
   * Validate work assignment constraints
   */
  static validateAssignment(operatorData: any, workData: any): {
    canAssign: boolean;
    reasons: string[];
    score: number;
  } {
    const reasons: string[] = [];
    let score = 50; // Base score

    // Machine compatibility check (40 points)
    const machineCompatible = this.checkMachineCompatibility(
      operatorData.machineType, 
      workData.requiredMachine
    );
    
    if (machineCompatible) {
      score += 40;
      reasons.push('Machine compatibility confirmed');
    } else {
      score = 10; // Very low score for incompatible work
      reasons.push('Machine incompatibility detected');
      return { canAssign: false, reasons, score };
    }

    // Workload check (10 points)
    const currentWorkload = operatorData.currentAssignments?.length || 0;
    if (currentWorkload < 3) {
      score += 10;
      reasons.push('Workload within limits');
    } else {
      reasons.push('Maximum workload reached');
    }

    return {
      canAssign: score >= 60,
      reasons,
      score: Math.min(score, 100)
    };
  }

  /**
   * Check machine compatibility
   */
  private static checkMachineCompatibility(
    operatorMachine: string, 
    requiredMachine: string
  ): boolean {
    const machineMatches = {
      'overlock': ['overlock', 'ओभरलक', 'Overlock', 'OVERLOCK'],
      'flatlock': ['flatlock', 'फ्ल्यालक', 'Flatlock', 'FLATLOCK'], 
      'singleNeedle': ['singleNeedle', 'single_needle', 'एकल सुई', 'Single Needle'],
      'buttonhole': ['buttonhole', 'बटनहोल', 'Buttonhole', 'BUTTONHOLE'],
      'buttonAttach': ['buttonAttach', 'button_attach', 'बटन जोड्ने'],
      'iron': ['iron', 'pressing', 'इस्त्री प्रेस'],
      'cutting': ['cutting', 'काट्ने मेसिन'],
      'embroidery': ['embroidery', 'कसिदाकारी मेसिन'],
      'manual': ['manual', 'हस्तकला काम']
    };

    // Multi-skill operators can handle any work
    if (operatorMachine === 'multi-skill') {
      return true;
    }

    // Check direct compatibility
    for (const [type, variants] of Object.entries(machineMatches)) {
      if (variants.includes(operatorMachine) && variants.includes(requiredMachine)) {
        return true;
      }
    }

    return false;
  }
}

// Export singleton instance
export const workAssignmentService = new WorkAssignmentService();