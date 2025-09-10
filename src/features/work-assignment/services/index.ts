// Firebase Work Assignment Service - Correct TSA Workflow
import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../../config/firebase';

export const workAssignmentService = {
  // Get work bundles from production_lots collection (generated from WIP + Templates)
  getWorkBundles: async (filters?: any) => {
    try {
      console.log('🔍 Work Assignment Service: Loading production lots (generated bundles)...');
      
      // First check if we have generated production lots from WIP entries
      const lotsRef = collection(db, 'production_lots');
      let lotsQuery = query(lotsRef, orderBy('createdAt', 'desc'));
      
      // Apply filters if provided
      if (filters?.status && filters.status !== 'all') {
        lotsQuery = query(lotsRef, 
          where('status', '==', filters.status),
          orderBy('createdAt', 'desc')
        );
      }
      
      const lotsSnapshot = await getDocs(lotsQuery);
      
      if (!lotsSnapshot.empty) {
        // We have production lots - transform them to work bundles
        console.log(`✅ Found ${lotsSnapshot.docs.length} production lots`);
        
        const bundles = lotsSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('📦 Processing production lot for work assignment:', {
            id: doc.id,
            lotNumber: data.lotNumber,
            articleNumber: data.articleNumber,
            totalPieces: data.totalPieces,
            status: data.status
          });
          
          // Get total pieces - fallback to WIP entry if production lot has 0
          const totalPieces = data.totalPieces || 50; // Default fallback
          
          console.log(`🔍 Production lot ${data.lotNumber}: ${totalPieces} pieces`);
          
          // Transform process steps into work items
          const workItems = (data.processSteps || []).map((step: any) => ({
            id: step.id || `${doc.id}_step_${step.stepNumber}`,
            name: step.operation || 'Operation',
            description: `${step.operation} - ${step.operationNepali}`,
            status: step.status === 'completed' ? 'completed' :
                   step.assignedOperators?.length > 0 ? 'assigned' : 'pending',
            operatorId: step.assignedOperators?.[0],
            machineType: step.machineType || 'sewing',
            timePerPiece: totalPieces > 0 ? (step.estimatedMinutes / totalPieces) : 3.0,
            pricePerPiece: step.pricePerPiece || 2.0,
            totalPieces: totalPieces,
            completedPieces: step.completedPieces || 0,
            requiredSkill: step.requiredSkill || 'basic',
            stepNumber: step.stepNumber
          }));
          
          return {
            id: doc.id,
            name: data.lotNumber || `LOT-${doc.id.slice(-6)}`,
            bundleNumber: data.lotNumber || `LOT-${doc.id.slice(-6)}`,
            articleNumber: data.articleNumber || 'ART-000',
            description: data.articleName || 'Production Lot',
            status: data.status === 'cutting' ? 'created' :
                   data.status === 'in_progress' ? 'in_progress' :
                   data.status === 'completed' ? 'completed' : 'active',
            priority: data.priority || 'normal',
            quantity: totalPieces,
            unitPrice: workItems.reduce((sum, item) => sum + item.pricePerPiece, 0),
            totalValue: totalPieces * workItems.reduce((sum, item) => sum + item.pricePerPiece, 0),
            garmentType: data.garmentType || 'tshirt',
            colorSizeBreakdown: data.colorSizeBreakdown || [],
            dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            workItems
          };
        });
        
        return {
          success: true,
          data: {
            items: bundles,
            total: bundles.length,
            page: 1,
            limit: bundles.length
          }
        };
      }
      
      // No production lots found - check WIP entries and suggest bundle generation
      console.log('⚠️ No production lots found. Checking WIP entries...');
      
      const wipRef = collection(db, 'production_bundles');
      const wipQuery = query(wipRef, orderBy('createdAt', 'desc'));
      const wipSnapshot = await getDocs(wipQuery);
      
      if (!wipSnapshot.empty) {
        console.log(`📦 Found ${wipSnapshot.docs.length} WIP entries that need bundle generation`);
        
        // Return empty with message about needing bundle generation
        return {
          success: true,
          data: {
            items: [],
            total: 0,
            page: 1,
            limit: 10
          },
          message: `Found ${wipSnapshot.docs.length} WIP entries that need to be processed through sewing templates to generate work bundles. Go to Bundle Generation to create production lots first.`
        };
      }
      
      return {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: 10
        },
        message: 'No WIP entries or production lots found. Create WIP entries first, then generate bundles using sewing templates.'
      };
      
    } catch (error) {
      console.error('❌ Work Assignment Service: Error loading work bundles:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load work bundles',
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: 10
        }
      };
    }
  },

  // Get single work bundle by ID
  getWorkBundleById: async (id: string) => {
    try {
      console.log(`🔍 Work Assignment Service: Loading work bundle ${id}...`);
      
      const bundleRef = doc(db, 'production_bundles', id);
      const bundleDoc = await getDoc(bundleRef);
      
      if (!bundleDoc.exists()) {
        return {
          success: false,
          error: 'Work bundle not found'
        };
      }
      
      const data = bundleDoc.data();
      const bundle = {
        id: bundleDoc.id,
        name: data.bundleNumber || `WIP-${bundleDoc.id.slice(-6)}`,
        bundleNumber: data.bundleNumber || `WIP-${bundleDoc.id.slice(-6)}`,
        articleNumber: data.articleNumber || 'ART-000',
        description: data.articleDescription || data.description || 'Work Item',
        status: data.status === 'pending' ? 'created' :
               data.status === 'in-progress' ? 'in_progress' :
               data.status === 'completed' ? 'completed' : 'active',
        priority: data.priority || 'normal',
        quantity: data.quantity || 0,
        unitPrice: data.unitPrice || 0,
        totalValue: data.totalValue || 0,
        assignedOperator: data.assignedOperator,
        dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : new Date(),
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        workItems: [{
          id: `${bundleDoc.id}_main_work`,
          name: data.operationName || 'Main Operation',
          description: data.articleDescription || data.description || 'Main work item',
          status: data.assignedOperator ? 'assigned' : 'pending',
          operatorId: data.assignedOperator,
          machineType: data.machineType || 'sewing',
          timePerPiece: data.timePerPiece || 3.0,
          pricePerPiece: data.pricePerPiece || data.unitPrice || 2.0,
          totalPieces: data.quantity || 0,
          completedPieces: data.completedQuantity || 0
        }]
      };
      
      console.log('✅ Work Assignment Service: Loaded work bundle:', bundle.name);
      
      return {
        success: true,
        data: bundle
      };
      
    } catch (error) {
      console.error('❌ Work Assignment Service: Error loading work bundle:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load work bundle'
      };
    }
  },

  // Create work bundle (creates WIP entry)
  createWorkBundle: async (data: any) => {
    try {
      console.log('🔧 Work Assignment Service: Creating new work bundle (WIP entry)...');
      
      const bundleData = {
        bundleNumber: data.bundleNumber || `WIP-${Date.now()}`,
        articleNumber: data.articleNumber || 'ART-000',
        articleDescription: data.description || data.name,
        quantity: data.quantity || 0,
        unitPrice: data.unitPrice || 0,
        totalValue: data.totalValue || (data.quantity * data.unitPrice),
        status: 'pending',
        priority: data.priority || 'normal',
        machineType: data.machineType || 'sewing',
        operationName: data.operationName || 'Main Operation',
        timePerPiece: data.timePerPiece || 3.0,
        pricePerPiece: data.pricePerPiece || data.unitPrice || 0,
        createdAt: serverTimestamp(),
        createdBy: data.createdBy || 'system',
        dueDate: data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
      
      const bundlesRef = collection(db, 'production_bundles');
      const docRef = await addDoc(bundlesRef, bundleData);
      
      console.log('✅ Work Assignment Service: Created work bundle:', docRef.id);
      
      return {
        success: true,
        data: {
          id: docRef.id,
          ...bundleData
        }
      };
      
    } catch (error) {
      console.error('❌ Work Assignment Service: Error creating work bundle:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create work bundle'
      };
    }
  },

  // Update work bundle
  update: async (id: string, data: any, collection: string) => {
    try {
      console.log(`🔧 Work Assignment Service: Updating ${collection} ${id}...`);
      
      const docRef = doc(db, collection, id);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, updateData);
      
      console.log('✅ Work Assignment Service: Updated document');
      
      return {
        success: true,
        data: { id, ...updateData }
      };
      
    } catch (error) {
      console.error('❌ Work Assignment Service: Error updating document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update document'
      };
    }
  },

  // Get work items by bundle
  getWorkItemsByBundle: async (bundleId: string) => {
    try {
      const bundle = await workAssignmentService.getWorkBundleById(bundleId);
      if (bundle.success && bundle.data) {
        return {
          success: true,
          data: bundle.data.workItems || []
        };
      }
      return {
        success: true,
        data: []
      };
    } catch (error) {
      console.error('Error getting work items:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get work items',
        data: []
      };
    }
  },

  // Create work item
  createWorkItem: async (data: any) => {
    return {
      success: true,
      data: { id: 'new-work-item-id', ...data }
    };
  },

  // Get assignments - loads from production_bundles with assigned operators
  getAssignments: async (filters?: any) => {
    try {
      console.log('🔍 Work Assignment Service: Loading assignments...');
      
      const bundlesRef = collection(db, 'production_bundles');
      let assignmentsQuery = query(bundlesRef, orderBy('createdAt', 'desc'));
      
      // Filter for assigned bundles
      if (filters?.operatorId) {
        assignmentsQuery = query(bundlesRef,
          where('assignedOperator', '==', filters.operatorId),
          orderBy('createdAt', 'desc')
        );
      }
      
      const snapshot = await getDocs(assignmentsQuery);
      
      if (snapshot.empty) {
        return {
          success: true,
          data: {
            items: [],
            total: 0,
            page: 1,
            limit: 10
          }
        };
      }
      
      // Transform to assignment format
      const assignments = snapshot.docs
        .filter(doc => {
          const data = doc.data();
          return data.assignedOperator; // Only include assigned items
        })
        .map(doc => {
          const data = doc.data();
          return {
            id: `assignment_${doc.id}`,
            workItemId: doc.id,
            operatorId: data.assignedOperator,
            bundleNumber: data.bundleNumber,
            articleNumber: data.articleNumber,
            description: data.articleDescription || data.description,
            status: data.status === 'pending' ? 'assigned' :
                   data.status === 'in-progress' ? 'started' :
                   data.status === 'completed' ? 'completed' : 'assigned',
            assignedAt: data.assignedAt?.toDate ? data.assignedAt.toDate() : new Date(),
            dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : new Date(),
            totalPieces: data.quantity || 0,
            completedPieces: data.completedQuantity || 0,
            timePerPiece: data.timePerPiece || 3.0,
            pricePerPiece: data.pricePerPiece || data.unitPrice || 2.0
          };
        });
      
      console.log(`✅ Work Assignment Service: Loaded ${assignments.length} assignments`);
      
      return {
        success: true,
        data: {
          items: assignments,
          total: assignments.length,
          page: 1,
          limit: assignments.length
        }
      };
      
    } catch (error) {
      console.error('❌ Work Assignment Service: Error loading assignments:', error);
      return {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: 10
        }
      };
    }
  },

  // Assign work to operator
  assignWork: async (data: any) => {
    try {
      console.log('🔧 Work Assignment Service: Assigning work to operator...');
      
      if (!data.bundleId || !data.operatorId) {
        throw new Error('Bundle ID and Operator ID are required');
      }
      
      const bundleRef = doc(db, 'production_bundles', data.bundleId);
      await updateDoc(bundleRef, {
        assignedOperator: data.operatorId,
        assignedAt: serverTimestamp(),
        status: 'in-progress',
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Work Assignment Service: Work assigned successfully');
      
      return {
        success: true,
        data: { 
          id: `assignment_${data.bundleId}`,
          bundleId: data.bundleId,
          operatorId: data.operatorId,
          status: 'assigned'
        }
      };
      
    } catch (error) {
      console.error('❌ Work Assignment Service: Error assigning work:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assign work'
      };
    }
  },

  // Complete assignment
  completeAssignment: async (data: any) => {
    try {
      console.log('🔧 Work Assignment Service: Completing assignment...');
      
      if (!data.bundleId) {
        throw new Error('Bundle ID is required');
      }
      
      const bundleRef = doc(db, 'production_bundles', data.bundleId);
      await updateDoc(bundleRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        completedQuantity: data.completedPieces || 0,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Work Assignment Service: Assignment completed');
      
      return {
        success: true,
        data: { 
          id: data.assignmentId,
          status: 'completed',
          completedAt: new Date()
        }
      };
      
    } catch (error) {
      console.error('❌ Work Assignment Service: Error completing assignment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete assignment'
      };
    }
  },

  // Create assignment request
  createAssignmentRequest: async (workItemId: string, operatorId: string, reason?: string) => {
    try {
      console.log('🔧 Work Assignment Service: Creating assignment request...');
      
      const requestData = {
        workItemId,
        operatorId,
        reason: reason || 'Assignment request',
        status: 'pending',
        createdAt: serverTimestamp(),
        requestedBy: operatorId
      };
      
      const requestsRef = collection(db, 'assignment_requests');
      const docRef = await addDoc(requestsRef, requestData);
      
      console.log('✅ Work Assignment Service: Assignment request created');
      
      return {
        success: true,
        data: {
          id: docRef.id,
          workItemId,
          operatorId,
          reason,
          status: 'pending'
        }
      };
      
    } catch (error) {
      console.error('❌ Work Assignment Service: Error creating assignment request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create assignment request'
      };
    }
  },

  // Get assignment statistics
  getAssignmentStatistics: async (filters?: any) => {
    try {
      const bundlesRef = collection(db, 'production_bundles');
      const snapshot = await getDocs(bundlesRef);
      
      if (snapshot.empty) {
        return {
          success: true,
          data: {
            totalAssignments: 0,
            activeAssignments: 0,
            completedAssignments: 0,
            averageEfficiency: 0,
            onTimeCompletion: 0
          }
        };
      }
      
      const bundles = snapshot.docs.map(doc => doc.data());
      const assignedBundles = bundles.filter(b => b.assignedOperator);
      const completedBundles = bundles.filter(b => b.status === 'completed');
      const activeBundles = bundles.filter(b => b.status === 'in-progress');
      
      return {
        success: true,
        data: {
          totalAssignments: assignedBundles.length,
          activeAssignments: activeBundles.length,
          completedAssignments: completedBundles.length,
          averageEfficiency: completedBundles.length > 0 ? 
            (completedBundles.reduce((sum, b) => sum + (b.completedQuantity || 0), 0) / 
             completedBundles.reduce((sum, b) => sum + (b.quantity || 0), 0) * 100) : 0,
          onTimeCompletion: completedBundles.length > 0 ?
            (completedBundles.filter(b => 
              b.completedAt && b.dueDate && b.completedAt <= b.dueDate
            ).length / completedBundles.length * 100) : 0
        }
      };
      
    } catch (error) {
      console.error('❌ Work Assignment Service: Error getting statistics:', error);
      return {
        success: true,
        data: {
          totalAssignments: 0,
          activeAssignments: 0,
          completedAssignments: 0,
          averageEfficiency: 0,
          onTimeCompletion: 0
        }
      };
    }
  }
};