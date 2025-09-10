// Enhanced Bundle Service - Firebase-powered service for bundle operations
import { BaseService } from './base-service';
import { db, COLLECTIONS } from '@/config/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  updateDoc,
  doc,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import type { 
  BundleOperation, 
  ProductionBundle,
  PartsComplaint,
  PartsReplacementRequest,
  OperatorEarnings,
  BundleTrackingData 
} from '../shared/types/bundle-types';

// Service response interface
interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Assignment result interface
interface AssignmentResult {
  operatorId: string;
  operatorName: string;
  operationId: string;
  operationName: string;
  assignedAt: Date;
}

// Operator profile interface
interface OperatorProfile {
  id: string;
  name: string;
  machineType: string;
  efficiency: number;
  currentWorkload: number;
  experience: 'beginner' | 'intermediate' | 'expert';
  specialties: string[];
  status: 'active' | 'break' | 'offline';
}

// Enhanced Bundle Service Class
export class EnhancedBundleService {
  
  // =====================
  // OPERATOR SELF-ASSIGNMENT METHODS
  // =====================
  
  /**
   * Get available operations for operator self-assignment
   */
  static async getAvailableOperationsForOperator(
    operatorId: string,
    machineType: string
  ): Promise<ServiceResponse<(BundleOperation & { bundleInfo: ProductionBundle })[]>> {
    try {
      const operationsRef = collection(db, COLLECTIONS.BUNDLE_OPERATIONS);
      const bundlesRef = collection(db, COLLECTIONS.PRODUCTION_BUNDLES);
      
      // Simplified query to avoid composite index requirements
      const operationsQuery = query(
        operationsRef,
        where('status', '==', 'pending'),
        where('machineType', '==', machineType),
        firestoreLimit(20)
      );
      
      const operationsSnapshot = await getDocs(operationsQuery);
      const operations: (BundleOperation & { bundleInfo: ProductionBundle })[] = [];
      
      // Get bundle info for each operation and filter for assignedOperatorId === null
      for (const operationDoc of operationsSnapshot.docs) {
        const operation = { id: operationDoc.id, ...operationDoc.data() } as BundleOperation;
        
        // Filter out assigned operations (since we can't use compound query)
        if (operation.assignedOperatorId !== null && operation.assignedOperatorId !== undefined) {
          continue;
        }
        
        // Get associated bundle information
        const bundleQuery = query(bundlesRef, where('id', '==', operation.bundleId));
        const bundleSnapshot = await getDocs(bundleQuery);
        
        if (!bundleSnapshot.empty) {
          const bundleData = bundleSnapshot.docs[0].data() as ProductionBundle;
          operations.push({
            ...operation,
            bundleInfo: bundleData
          });
        }
      }
      
      return { success: true, data: operations };
    } catch (error) {
      console.error('Failed to get available operations:', error);
      return { success: false, error: 'Failed to fetch available operations' };
    }
  }
  
  /**
   * Self-assign operation to operator
   */
  static async selfAssignOperation(
    operatorId: string,
    operatorName: string,
    operationId: string
  ): Promise<ServiceResponse<AssignmentResult>> {
    try {
      const operationRef = doc(db, COLLECTIONS.BUNDLE_OPERATIONS, operationId);
      
      // Update the operation with assignment details
      await updateDoc(operationRef, {
        assignedOperatorId: operatorId,
        assignedOperatorName: operatorName,
        assignedAt: Timestamp.now(),
        status: 'assigned',
        updatedAt: Timestamp.now()
      });
      
      // Get operation details for the result
      const operationsRef = collection(db, COLLECTIONS.BUNDLE_OPERATIONS);
      const operationQuery = query(operationsRef, where('__name__', '==', operationId));
      const operationSnapshot = await getDocs(operationQuery);
      
      let operationName = 'Unknown Operation';
      if (!operationSnapshot.empty) {
        const operationData = operationSnapshot.docs[0].data();
        operationName = operationData.name || 'Unknown Operation';
      }
      
      const result: AssignmentResult = {
        operatorId,
        operatorName,
        operationId,
        operationName,
        assignedAt: new Date()
      };
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Self-assignment failed:', error);
      return { success: false, error: 'Self-assignment failed' };
    }
  }
  
  // =====================
  // PARTS REPLACEMENT METHODS
  // =====================
  
  /**
   * Submit parts replacement complaint
   */
  static async submitPartsComplaint(
    complaint: PartsReplacementRequest
  ): Promise<ServiceResponse<PartsComplaint>> {
    try {
      const complaintsRef = collection(db, COLLECTIONS.PARTS_COMPLAINTS);
      
      const newComplaint: Omit<PartsComplaint, 'id'> = {
        ...complaint,
        reportedBy: 'current_operator',
        reportedByName: 'Current Operator',
        reportedAt: new Date(),
        status: 'reported',
        replacedParts: [],
        resolution: 'parts_replaced',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const complaintDoc = await addDoc(complaintsRef, newComplaint);
      
      return { 
        success: true, 
        data: { 
          id: complaintDoc.id,
          ...newComplaint
        } as PartsComplaint
      };
    } catch (error) {
      console.error('Failed to submit parts complaint:', error);
      return { success: false, error: 'Failed to submit complaint' };
    }
  }
  
  /**
   * Get parts complaints for supervisor
   */
  static async getPartsComplaints(
    supervisorId?: string
  ): Promise<ServiceResponse<PartsComplaint[]>> {
    try {
      const complaintsRef = collection(db, COLLECTIONS.PARTS_COMPLAINTS);
      
      let complaintsQuery;
      
      if (supervisorId) {
        // Query by supervisor ID
        complaintsQuery = query(
          complaintsRef,
          where('supervisorId', '==', supervisorId)
        );
      } else {
        // Simple query by status only
        complaintsQuery = query(
          complaintsRef,
          where('status', 'in', ['reported', 'acknowledged', 'replacing'])
        );
      }
      
      const complaintsSnapshot = await getDocs(complaintsQuery);
      const complaints: PartsComplaint[] = complaintsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PartsComplaint[];
      
      return { success: true, data: complaints };
    } catch (error) {
      console.error('Failed to get parts complaints:', error);
      return { success: false, error: 'Failed to fetch parts complaints' };
    }
  }
  
  /**
   * Update parts complaint status
   */
  static async updateComplaintStatus(
    complaintId: string,
    status: PartsComplaint['status'],
    notes?: string
  ): Promise<ServiceResponse<void>> {
    try {
      const complaintRef = doc(db, COLLECTIONS.PARTS_COMPLAINTS, complaintId);
      
      const updateData: any = {
        status,
        updatedAt: Timestamp.now()
      };
      
      if (notes) {
        updateData.supervisorNotes = notes;
      }
      
      // Add timestamp for specific status
      updateData[`${status}At`] = Timestamp.now();
      
      await updateDoc(complaintRef, updateData);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update complaint status:', error);
      return { success: false, error: 'Failed to update complaint status' };
    }
  }
  
  // =====================
  // MULTI-STRATEGY ASSIGNMENT METHODS
  // =====================
  
  /**
   * Get pending operations for assignment
   */
  static async getPendingOperations(
    filters?: {
      priority?: string;
      machineType?: string;
      articleNumber?: string;
      limit?: number;
    }
  ): Promise<ServiceResponse<(BundleOperation & { bundleInfo: ProductionBundle })[]>> {
    try {
      const operationsRef = collection(db, COLLECTIONS.BUNDLE_OPERATIONS);
      const bundlesRef = collection(db, COLLECTIONS.PRODUCTION_BUNDLES);
      
      // Simplified query to avoid index requirements
      let operationsQuery;
      
      if (filters?.machineType) {
        // Query with machine type filter (most common case)
        operationsQuery = query(
          operationsRef,
          where('status', '==', 'pending'),
          where('machineType', '==', filters.machineType),
          firestoreLimit(filters?.limit || 50)
        );
      } else {
        // Simple query without ordering to avoid index requirements
        operationsQuery = query(
          operationsRef,
          where('status', '==', 'pending'),
          firestoreLimit(filters?.limit || 50)
        );
      }
      
      const operationsSnapshot = await getDocs(operationsQuery);
      console.log('🔍 Firebase getPendingOperations - operations count:', operationsSnapshot.docs.length);
      const operations: (BundleOperation & { bundleInfo: ProductionBundle })[] = [];
      
      // Get bundle info for each operation
      for (const operationDoc of operationsSnapshot.docs) {
        const operation = { id: operationDoc.id, ...operationDoc.data() } as BundleOperation;
        
        // Get associated bundle information
        const bundleQuery = query(bundlesRef, where('id', '==', operation.bundleId));
        const bundleSnapshot = await getDocs(bundleQuery);
        
        if (!bundleSnapshot.empty) {
          const bundleData = bundleSnapshot.docs[0].data() as ProductionBundle;
          
          // Apply additional filters on bundle data
          if (filters?.priority && bundleData.priority !== filters.priority) continue;
          if (filters?.articleNumber && bundleData.articleNumber !== filters.articleNumber) continue;
          
          operations.push({
            ...operation,
            bundleInfo: bundleData
          });
        }
      }
      
      return { success: true, data: operations };
    } catch (error) {
      console.error('Failed to get pending operations:', error);
      return { success: false, error: 'Failed to fetch pending operations' };
    }
  }
  
  /**
   * Get available operators
   */
  static async getAvailableOperators(): Promise<ServiceResponse<OperatorProfile[]>> {
    try {
      // Import and use the real operator service
      const { operatorService } = await import('./operator-service');
      const operators = await operatorService.getAllOperators();
      
      if (operators.success && operators.data) {
        console.log('🔍 Raw operators from Firebase:', operators.data);
        
        // Transform operators to the expected OperatorProfile format
        const operatorProfiles: OperatorProfile[] = operators.data.map(op => {
          const profile = {
            id: op.id || 'unknown',
            name: op.name || 'Unknown Operator',
            machineType: op.primaryMachine || op.machineTypes?.[0] || 'overlock',
            efficiency: op.averageEfficiency || 85,
            currentWorkload: op.currentAssignments?.length || 0,
            experience: op.skillLevel || 'intermediate' as any,
            specialties: op.machineTypes || [],
            status: op.isActive ? 'active' : 'offline' as any
          };
          console.log('🔄 Transformed operator:', profile);
          return profile;
        });
        
        console.log('✅ Final operator profiles:', operatorProfiles);
        return { success: true, data: operatorProfiles };
      }
      
      // No operators found - create sample operators for development
      console.log('⚠️ No operators found in Firebase, creating sample operators...');
      await this.createSampleOperators();
      
      // Try again after creating sample data
      const retryOperators = await operatorService.getAllOperators();
      if (retryOperators.success && retryOperators.data) {
        const operatorProfiles: OperatorProfile[] = retryOperators.data.map(op => ({
          id: op.id || 'unknown',
          name: op.name || 'Unknown Operator',
          machineType: op.primaryMachine || op.machineTypes?.[0] || 'overlock',
          efficiency: op.averageEfficiency || 85,
          currentWorkload: op.currentAssignments?.length || 0,
          experience: op.skillLevel || 'intermediate' as any,
          specialties: op.machineTypes || [],
          status: op.isActive ? 'active' : 'offline' as any
        }));
        return { success: true, data: operatorProfiles };
      }
      
      return { success: true, data: [] };
    } catch (error) {
      console.error('Failed to get operators:', error);
      return { success: false, error: 'Failed to fetch operators' };
    }
  }
  
  /**
   * Auto smart assignment
   */
  static async autoSmartAssign(
    operationIds: string[],
    operators: OperatorProfile[]
  ): Promise<ServiceResponse<AssignmentResult[]>> {
    try {
      // TODO: Implement actual smart assignment algorithm
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI processing
      
      const assignments: AssignmentResult[] = operationIds.map((opId, index) => ({
        operatorId: operators[index % operators.length].id,
        operatorName: operators[index % operators.length].name,
        operationId: opId,
        operationName: `Operation ${index + 1}`,
        assignedAt: new Date()
      }));
      
      return { success: true, data: assignments };
    } catch (error) {
      console.error('Auto smart assignment failed:', error);
      return { success: false, error: 'Auto assignment failed' };
    }
  }
  
  /**
   * Bulk batch assignment
   */
  static async bulkBatchAssign(
    operationIds: string[],
    strategy: 'round_robin' | 'by_machine' | 'by_skill'
  ): Promise<ServiceResponse<AssignmentResult[]>> {
    try {
      // TODO: Implement bulk assignment logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock implementation
      const assignments: AssignmentResult[] = [];
      return { success: true, data: assignments };
    } catch (error) {
      console.error('Bulk assignment failed:', error);
      return { success: false, error: 'Bulk assignment failed' };
    }
  }
  
  // =====================
  // BUNDLE TRACKING & ANALYTICS METHODS
  // =====================
  
  /**
   * Get bundle tracking data
   */
  static async getBundleTrackingData(
    filters?: {
      timeframe?: 'today' | 'week' | 'month';
      status?: string;
      lot?: string;
      batch?: string;
    }
  ): Promise<ServiceResponse<BundleTrackingData[]>> {
    try {
      const trackingRef = collection(db, COLLECTIONS.BUNDLE_TRACKING);
      
      let trackingQuery;
      
      // Apply primary filter (avoid compound queries)
      if (filters?.status) {
        trackingQuery = query(
          trackingRef,
          where('status', '==', filters.status)
        );
      } else if (filters?.lot) {
        trackingQuery = query(
          trackingRef,
          where('lotNumber', '==', filters.lot)
        );
      } else if (filters?.batch) {
        trackingQuery = query(
          trackingRef,
          where('batchNumber', '==', filters.batch)
        );
      } else {
        trackingQuery = query(trackingRef);
      }
      
      // Note: Timeframe filtering would require compound index, so we'll filter after fetching
      // For now, we'll do client-side filtering for timeframes to avoid index requirements
      
      const trackingSnapshot = await getDocs(trackingQuery);
      let trackingData: BundleTrackingData[] = trackingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BundleTrackingData[];
      
      // Apply client-side timeframe filtering if needed
      if (filters?.timeframe) {
        const now = new Date();
        let startDate: Date;
        
        switch (filters.timeframe) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            startDate = new Date(0);
        }
        
        trackingData = trackingData.filter(item => {
          const itemDate = item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt);
          return itemDate >= startDate;
        });
      }
      
      return { success: true, data: trackingData };
    } catch (error) {
      console.error('Failed to get bundle tracking data:', error);
      return { success: false, error: 'Failed to fetch tracking data' };
    }
  }
  
  /**
   * Update bundle status
   */
  static async updateBundleStatus(
    bundleId: string,
    status: BundleTrackingData['status'],
    operatorId?: string
  ): Promise<ServiceResponse<void>> {
    try {
      const trackingRef = doc(db, COLLECTIONS.BUNDLE_TRACKING, bundleId);
      
      const updateData: any = {
        status,
        updatedAt: Timestamp.now()
      };
      
      if (operatorId) {
        updateData.currentOperatorId = operatorId;
      }
      
      // Add status-specific timestamp
      updateData[`${status}At`] = Timestamp.now();
      
      await updateDoc(trackingRef, updateData);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update bundle status:', error);
      return { success: false, error: 'Failed to update bundle status' };
    }
  }
  
  // =====================
  // HELPER METHODS
  // =====================
  
  /**
   * Create sample bundle data for testing (development only)
   */
  static async createSampleData(): Promise<ServiceResponse<void>> {
    try {
      console.log('🔧 Creating sample bundle data for development...');
      
      // Create sample production bundles
      const bundlesRef = collection(db, COLLECTIONS.PRODUCTION_BUNDLES);
      const operationsRef = collection(db, COLLECTIONS.BUNDLE_OPERATIONS);
      
      const sampleBundles = [
        {
          id: 'bundle_1',
          bundleNumber: 'BND-3233-M-001',
          articleNumber: '3233',
          articleStyle: 'Adult T-shirt',
          size: 'M',
          quantity: 50,
          priority: 'normal',
          batchNumber: 'B0001',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          id: 'bundle_2',
          bundleNumber: 'BND-3233-L-002',
          articleNumber: '3233',
          articleStyle: 'Adult T-shirt',
          size: 'L',
          quantity: 50,
          priority: 'high',
          batchNumber: 'B0001',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ];

      const sampleOperations = [
        {
          id: 'op_1',
          bundleId: 'bundle_1',
          operationId: 'shoulder_join',
          name: 'Shoulder Join',
          nameNepali: 'काँध जोड्ने',
          machineType: 'overlock',
          sequenceOrder: 1,
          pricePerPiece: 2.5,
          smvMinutes: 4.5,
          status: 'pending',
          prerequisites: [],
          isOptional: false,
          qualityCheckRequired: true,
          defectTolerance: 5,
          assignedOperatorId: null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          id: 'op_2', 
          bundleId: 'bundle_1',
          operationId: 'side_seam',
          name: 'Side Seam',
          nameNepali: 'छेउ सिलाई',
          machineType: 'singleNeedle',
          sequenceOrder: 2,
          pricePerPiece: 3.0,
          smvMinutes: 5.0,
          status: 'pending',
          prerequisites: ['shoulder_join'],
          isOptional: false,
          qualityCheckRequired: true,
          defectTolerance: 3,
          assignedOperatorId: null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          id: 'op_3',
          bundleId: 'bundle_2',
          operationId: 'sleeve_attach',
          name: 'Sleeve Attach',
          nameNepali: 'आस्तीन लगाउने',
          machineType: 'overlock',
          sequenceOrder: 3,
          pricePerPiece: 4.0,
          smvMinutes: 7.0,
          status: 'pending',
          prerequisites: ['side_seam'],
          isOptional: false,
          qualityCheckRequired: true,
          defectTolerance: 2,
          assignedOperatorId: null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ];

      // Add bundles to Firestore
      for (const bundle of sampleBundles) {
        await addDoc(bundlesRef, bundle);
        console.log(`✅ Created bundle: ${bundle.bundleNumber}`);
      }

      // Add operations to Firestore  
      for (const operation of sampleOperations) {
        await addDoc(operationsRef, operation);
        console.log(`✅ Created operation: ${operation.name}`);
      }
      
      console.log('🎉 Sample data created successfully!');
      return { success: true };
    } catch (error) {
      console.error('Failed to create sample data:', error);
      return { success: false, error: 'Failed to create sample data' };
    }
  }

  /**
   * Create sample operators for testing (development only)
   */
  static async createSampleOperators(): Promise<ServiceResponse<void>> {
    try {
      console.log('🔧 Creating sample operators for development...');
      
      // Import the operator service to create operators
      const { operatorService } = await import('./operator-service');
      
      const sampleOperators = [
        {
          username: 'maya_patel',
          name: 'Maya Patel',
          employeeId: 'TSA-EMP-0001',
          email: 'maya.patel@tsa.com',
          phone: '+977-9841234567',
          primaryMachine: 'overlock',
          machineTypes: ['overlock', 'singleNeedle'],
          skillLevel: 'expert' as const,
          shift: 'morning' as const,
          address: 'Kathmandu, Nepal'
        },
        {
          username: 'priya_singh',
          name: 'Priya Singh',
          employeeId: 'TSA-EMP-0002',
          email: 'priya.singh@tsa.com',
          phone: '+977-9841234568',
          primaryMachine: 'singleNeedle',
          machineTypes: ['singleNeedle', 'flatlock'],
          skillLevel: 'intermediate' as const,
          shift: 'morning' as const,
          address: 'Lalitpur, Nepal'
        },
        {
          username: 'rajesh_kumar',
          name: 'Rajesh Kumar',
          employeeId: 'TSA-EMP-0003',
          email: 'rajesh.kumar@tsa.com',
          phone: '+977-9841234569',
          primaryMachine: 'overlock',
          machineTypes: ['overlock'],
          skillLevel: 'expert' as const,
          shift: 'afternoon' as const,
          address: 'Bhaktapur, Nepal'
        },
        {
          username: 'sita_sharma',
          name: 'Sita Sharma',
          employeeId: 'TSA-EMP-0004',
          email: 'sita.sharma@tsa.com',
          phone: '+977-9841234570',
          primaryMachine: 'cutting',
          machineTypes: ['cutting', 'manual'],
          skillLevel: 'intermediate' as const,
          shift: 'morning' as const,
          address: 'Pokhara, Nepal'
        }
      ];

      // Create each operator
      for (const operatorData of sampleOperators) {
        const result = await operatorService.createOperator(operatorData);
        if (result.success) {
          console.log(`✅ Created operator: ${operatorData.name}`);
        } else {
          console.error(`❌ Failed to create operator ${operatorData.name}:`, result.error);
        }
      }
      
      console.log('🎉 Sample operators created successfully!');
      return { success: true };
    } catch (error) {
      console.error('Failed to create sample operators:', error);
      return { success: false, error: 'Failed to create sample operators' };
    }
  }
}

// Export the service
export default EnhancedBundleService;