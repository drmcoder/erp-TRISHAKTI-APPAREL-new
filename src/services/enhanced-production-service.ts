// Enhanced Production Service - TSA Bundle-Based Production System
// Handles cutting droplet → bundle creation → individual operator assignments

import { db, rtdb } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { ref, set, onValue } from 'firebase/database';

// Enhanced interfaces for TSA workflow
export interface CuttingColorSize {
  color: string;
  rollsUsed: number;
  kgUsed: number;
  layers: number;
  sizes: {
    size: string;
    pieces: number;
    bundlesCreated: number;
  }[];
  totalPieces: number;
}

export interface CuttingDroplet {
  id: string;
  lotNumber: string;
  articleNumber: string;
  articleName: string;
  garmentType: 'tshirt' | 'polo' | 'shirt' | 'pants';
  totalRolls: number;
  totalKg: number;
  colorSizeData: CuttingColorSize[];
  createdAt: any;
  createdBy: string;
  status: 'cutting' | 'ready_for_sewing' | 'in_production' | 'completed';
}

export interface ProductionBundle {
  id: string;
  bundleNumber: string;
  lotNumber: string;
  articleNumber: string;
  color: string;
  size: string;
  pieces: number;
  currentStep: number;
  processSteps: BundleProcessStep[];
  status: 'ready' | 'in_progress' | 'completed' | 'on_hold';
  assignedOperators: string[];
  createdAt: any;
  startedAt?: any;
  completedAt?: any;
}

export interface BundleProcessStep {
  stepNumber: number;
  operation: string;
  operationNepali: string;
  machineType: string;
  pricePerPiece: number;
  estimatedMinutes: number;
  canRunParallel: boolean; // For simultaneous operations
  dependencies: number[]; // Which steps must complete first
  status: 'waiting' | 'ready' | 'in_progress' | 'completed' | 'skipped';
  assignedOperator?: string;
  completedPieces: number;
  startTime?: any;
  endTime?: any;
  qualityNotes?: string;
}

export interface OperatorWorkSession {
  id: string;
  operatorId: string;
  operatorName: string;
  bundleId: string;
  bundleNumber: string;
  stepNumber: number;
  operation: string;
  machineType: string;
  assignedPieces: number;
  completedPieces: number;
  pricePerPiece: number;
  totalEarning: number;
  workDate: any;
  startTime?: any;
  endTime?: any;
  status: 'assigned' | 'in_progress' | 'completed' | 'paused';
  qualityIssues: string[];
  notes: string;
}

// TSA Garment Process Templates with Parallel Operations
const TSA_GARMENT_PROCESSES = {
  polo: {
    name: 'Polo T-Shirt',
    nameNepali: 'पोलो टी-शर्ट',
    steps: [
      {
        stepNumber: 1,
        operation: 'Collar Making',
        operationNepali: 'कलर बनाउने',
        machineType: 'single_needle',
        pricePerPiece: 2.5,
        estimatedMinutes: 4,
        canRunParallel: true, // Can run with placket making
        dependencies: []
      },
      {
        stepNumber: 2,
        operation: 'Placket Making',
        operationNepali: 'प्लेकेट बनाउने',
        machineType: 'single_needle',
        pricePerPiece: 2.0,
        estimatedMinutes: 3,
        canRunParallel: true, // Can run with collar making
        dependencies: []
      },
      {
        stepNumber: 3,
        operation: 'Shoulder Join',
        operationNepali: 'काँध जोड्ने',
        machineType: 'overlock',
        pricePerPiece: 1.5,
        estimatedMinutes: 2,
        canRunParallel: false,
        dependencies: [1, 2] // Needs collar and placket ready
      },
      {
        stepNumber: 4,
        operation: 'Sleeve Attach',
        operationNepali: 'बाही जोड्ने',
        machineType: 'overlock',
        pricePerPiece: 3.0,
        estimatedMinutes: 4,
        canRunParallel: false,
        dependencies: [3]
      },
      {
        stepNumber: 5,
        operation: 'Top Stitch',
        operationNepali: 'माथिल्लो सिलाई',
        machineType: 'flatlock',
        pricePerPiece: 1.0,
        estimatedMinutes: 2,
        canRunParallel: false,
        dependencies: [4]
      },
      {
        stepNumber: 6,
        operation: 'Side Seam',
        operationNepali: 'छेउको सिलाई',
        machineType: 'overlock',
        pricePerPiece: 2.0,
        estimatedMinutes: 3,
        canRunParallel: false,
        dependencies: [5]
      },
      {
        stepNumber: 7,
        operation: 'Slit Making',
        operationNepali: 'स्लिट बनाउने',
        machineType: 'single_needle',
        pricePerPiece: 1.5,
        estimatedMinutes: 2,
        canRunParallel: false,
        dependencies: [6]
      },
      {
        stepNumber: 8,
        operation: 'Bottom Fold',
        operationNepali: 'तलको फोल्ड',
        machineType: 'flatlock',
        pricePerPiece: 1.5,
        estimatedMinutes: 2,
        canRunParallel: false,
        dependencies: [7]
      },
      {
        stepNumber: 9,
        operation: 'Finishing',
        operationNepali: 'फिनिशिङ',
        machineType: 'finishing',
        pricePerPiece: 1.0,
        estimatedMinutes: 1,
        canRunParallel: false,
        dependencies: [8]
      }
    ]
  },
  tshirt: {
    name: 'T-Shirt',
    nameNepali: 'टी-शर्ट',
    steps: [
      {
        stepNumber: 1,
        operation: 'Shoulder Join',
        operationNepali: 'काँध जोड्ने',
        machineType: 'overlock',
        pricePerPiece: 1.0,
        estimatedMinutes: 2,
        canRunParallel: false,
        dependencies: []
      },
      {
        stepNumber: 2,
        operation: 'Sleeve Attach',
        operationNepali: 'बाही जोड्ने',
        machineType: 'overlock',
        pricePerPiece: 2.0,
        estimatedMinutes: 3,
        canRunParallel: false,
        dependencies: [1]
      },
      {
        stepNumber: 3,
        operation: 'Side Seam',
        operationNepali: 'छेउको सिलाई',
        machineType: 'overlock',
        pricePerPiece: 1.5,
        estimatedMinutes: 2.5,
        canRunParallel: false,
        dependencies: [2]
      },
      {
        stepNumber: 4,
        operation: 'Bottom Hem',
        operationNepali: 'तलको हेम',
        machineType: 'flatlock',
        pricePerPiece: 1.0,
        estimatedMinutes: 1.5,
        canRunParallel: false,
        dependencies: [3]
      },
      {
        stepNumber: 5,
        operation: 'Finishing',
        operationNepali: 'फिनिशिङ',
        machineType: 'finishing',
        pricePerPiece: 0.5,
        estimatedMinutes: 1,
        canRunParallel: false,
        dependencies: [4]
      }
    ]
  },
  shirt: {
    name: 'Shirt',
    nameNepali: 'शर्ट',
    steps: [
      {
        stepNumber: 1,
        operation: 'Collar Making',
        operationNepali: 'कलर बनाउने',
        machineType: 'single_needle',
        pricePerPiece: 3.0,
        estimatedMinutes: 5,
        canRunParallel: true,
        dependencies: []
      },
      {
        stepNumber: 2,
        operation: 'Cuff Making',
        operationNepali: 'कफ बनाउने',
        machineType: 'single_needle',
        pricePerPiece: 2.0,
        estimatedMinutes: 3,
        canRunParallel: true,
        dependencies: []
      },
      {
        stepNumber: 3,
        operation: 'Shoulder Join',
        operationNepali: 'काँध जोड्ने',
        machineType: 'overlock',
        pricePerPiece: 1.5,
        estimatedMinutes: 3,
        canRunParallel: false,
        dependencies: [1]
      },
      {
        stepNumber: 4,
        operation: 'Sleeve Attach',
        operationNepali: 'बाही जोड्ने',
        machineType: 'overlock',
        pricePerPiece: 3.5,
        estimatedMinutes: 5,
        canRunParallel: false,
        dependencies: [2, 3]
      },
      {
        stepNumber: 5,
        operation: 'Side Seam',
        operationNepali: 'छेउको सिलाई',
        machineType: 'overlock',
        pricePerPiece: 2.5,
        estimatedMinutes: 4,
        canRunParallel: false,
        dependencies: [4]
      },
      {
        stepNumber: 6,
        operation: 'Button Hole',
        operationNepali: 'बटन होल',
        machineType: 'buttonhole',
        pricePerPiece: 2.0,
        estimatedMinutes: 3,
        canRunParallel: false,
        dependencies: [5]
      },
      {
        stepNumber: 7,
        operation: 'Button Attach',
        operationNepali: 'बटन जोड्ने',
        machineType: 'single_needle',
        pricePerPiece: 1.0,
        estimatedMinutes: 2,
        canRunParallel: false,
        dependencies: [6]
      },
      {
        stepNumber: 8,
        operation: 'Finishing',
        operationNepali: 'फिनिशिङ',
        machineType: 'finishing',
        pricePerPiece: 1.5,
        estimatedMinutes: 2,
        canRunParallel: false,
        dependencies: [7]
      }
    ]
  },
  pants: {
    name: 'Pants',
    nameNepali: 'प्यान्ट',
    steps: [
      {
        stepNumber: 1,
        operation: 'Pocket Making',
        operationNepali: 'पकेट बनाउने',
        machineType: 'single_needle',
        pricePerPiece: 2.5,
        estimatedMinutes: 4,
        canRunParallel: true,
        dependencies: []
      },
      {
        stepNumber: 2,
        operation: 'Waistband Making',
        operationNepali: 'कम्मरब्यान्ड बनाउने',
        machineType: 'single_needle',
        pricePerPiece: 3.0,
        estimatedMinutes: 5,
        canRunParallel: true,
        dependencies: []
      },
      {
        stepNumber: 3,
        operation: 'Front Join',
        operationNepali: 'अगाडि जोड्ने',
        machineType: 'overlock',
        pricePerPiece: 2.0,
        estimatedMinutes: 3,
        canRunParallel: false,
        dependencies: [1]
      },
      {
        stepNumber: 4,
        operation: 'Back Join',
        operationNepali: 'पछाडि जोड्ने',
        machineType: 'overlock',
        pricePerPiece: 2.0,
        estimatedMinutes: 3,
        canRunParallel: false,
        dependencies: [1]
      },
      {
        stepNumber: 5,
        operation: 'Side Seam',
        operationNepali: 'छेउको सिलाई',
        machineType: 'overlock',
        pricePerPiece: 3.0,
        estimatedMinutes: 4,
        canRunParallel: false,
        dependencies: [3, 4]
      },
      {
        stepNumber: 6,
        operation: 'Waistband Attach',
        operationNepali: 'कम्मरब्यान्ड जोड्ने',
        machineType: 'flatlock',
        pricePerPiece: 2.5,
        estimatedMinutes: 4,
        canRunParallel: false,
        dependencies: [2, 5]
      },
      {
        stepNumber: 7,
        operation: 'Bottom Hem',
        operationNepali: 'तलको हेम',
        machineType: 'flatlock',
        pricePerPiece: 1.5,
        estimatedMinutes: 2,
        canRunParallel: false,
        dependencies: [6]
      },
      {
        stepNumber: 8,
        operation: 'Finishing',
        operationNepali: 'फिनिशिङ',
        machineType: 'finishing',
        pricePerPiece: 1.0,
        estimatedMinutes: 1,
        canRunParallel: false,
        dependencies: [7]
      }
    ]
  }
};

class EnhancedProductionService {
  // 1. Create cutting droplet (from WIP Excel data)
  async createCuttingDroplet(cuttingData: Omit<CuttingDroplet, 'id' | 'createdAt'>): Promise<CuttingDroplet> {
    try {
      const docRef = await addDoc(collection(db, 'cuttingDroplets'), {
        ...cuttingData,
        createdAt: serverTimestamp()
      });
      
      return {
        id: docRef.id,
        ...cuttingData,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error creating cutting droplet:', error);
      throw error;
    }
  }

  // 2. Convert cutting droplet to individual bundles
  async createBundlesFromCutting(cuttingDropletId: string): Promise<ProductionBundle[]> {
    try {
      const cuttingDoc = await getDoc(doc(db, 'cuttingDroplets', cuttingDropletId));
      if (!cuttingDoc.exists()) {
        throw new Error('Cutting droplet not found');
      }

      const cutting = { id: cuttingDoc.id, ...cuttingDoc.data() } as CuttingDroplet;
      const bundles: ProductionBundle[] = [];
      const batch = writeBatch(db);

      // Get process template for this garment type
      const processTemplate = TSA_GARMENT_PROCESSES[cutting.garmentType];
      if (!processTemplate) {
        throw new Error(`No process template found for ${cutting.garmentType}`);
      }

      let bundleCounter = 1;

      // Create bundles for each color/size combination
      for (const colorData of cutting.colorSizeData) {
        for (const sizeData of colorData.sizes) {
          // Create individual bundles (in your case, one bundle per color/size combination)
          const bundleNumber = `${cutting.lotNumber}-${colorData.color}-${sizeData.size}-${bundleCounter}`;
          
          const processSteps: BundleProcessStep[] = processTemplate.steps.map((step: any) => ({
            stepNumber: step.stepNumber,
            operation: step.operation,
            operationNepali: step.operationNepali,
            machineType: step.machineType,
            pricePerPiece: step.pricePerPiece,
            estimatedMinutes: step.estimatedMinutes,
            canRunParallel: step.canRunParallel,
            dependencies: step.dependencies,
            status: step.dependencies.length === 0 ? 'ready' : 'waiting',
            completedPieces: 0
          }));

          const bundle: Omit<ProductionBundle, 'id'> = {
            bundleNumber,
            lotNumber: cutting.lotNumber,
            articleNumber: cutting.articleNumber,
            color: colorData.color,
            size: sizeData.size,
            pieces: sizeData.pieces,
            currentStep: 1,
            processSteps,
            status: 'ready',
            assignedOperators: [],
            createdAt: serverTimestamp()
          };

          const bundleRef = doc(collection(db, 'productionBundles'));
          batch.set(bundleRef, bundle);

          bundles.push({
            id: bundleRef.id,
            ...bundle,
            createdAt: new Date()
          });

          bundleCounter++;
        }
      }

      // Update cutting droplet status
      batch.update(doc(db, 'cuttingDroplets', cuttingDropletId), {
        status: 'ready_for_sewing'
      });

      await batch.commit();
      return bundles;
    } catch (error) {
      console.error('Error creating bundles from cutting:', error);
      throw error;
    }
  }

  // 3. Assign bundle step to operator
  async assignBundleStepToOperator(bundleId: string, stepNumber: number, operatorId: string, operatorName: string): Promise<OperatorWorkSession> {
    try {
      const bundleDoc = await getDoc(doc(db, 'productionBundles', bundleId));
      if (!bundleDoc.exists()) {
        throw new Error('Bundle not found');
      }

      const bundle = bundleDoc.data() as ProductionBundle;
      const step = bundle.processSteps.find(s => s.stepNumber === stepNumber);
      
      if (!step) {
        throw new Error('Step not found');
      }

      if (step.status !== 'ready') {
        throw new Error('Step is not ready for assignment');
      }

      // Create work session
      const workSession: Omit<OperatorWorkSession, 'id'> = {
        operatorId,
        operatorName,
        bundleId,
        bundleNumber: bundle.bundleNumber,
        stepNumber,
        operation: step.operation,
        machineType: step.machineType,
        assignedPieces: bundle.pieces,
        completedPieces: 0,
        pricePerPiece: step.pricePerPiece,
        totalEarning: 0,
        workDate: serverTimestamp(),
        status: 'assigned',
        qualityIssues: [],
        notes: ''
      };

      const sessionRef = await addDoc(collection(db, 'operatorWorkSessions'), workSession);

      // Update bundle step
      const updatedSteps = bundle.processSteps.map(s => 
        s.stepNumber === stepNumber 
          ? { ...s, status: 'in_progress' as const, assignedOperator: operatorId }
          : s
      );

      await updateDoc(doc(db, 'productionBundles', bundleId), {
        processSteps: updatedSteps,
        assignedOperators: Array.from(new Set([...bundle.assignedOperators, operatorId]))
      });

      // Update realtime status
      await set(ref(rtdb, `operator_status/${operatorId}`), {
        status: 'working',
        currentBundle: bundle.bundleNumber,
        currentOperation: step.operation,
        machineType: step.machineType,
        startTime: Date.now(),
        lastActivity: Date.now()
      });

      return {
        id: sessionRef.id,
        ...workSession,
        workDate: new Date()
      };
    } catch (error) {
      console.error('Error assigning bundle step to operator:', error);
      throw error;
    }
  }

  // 4. Complete operator work (daily piece entry)
  async completeOperatorWork(sessionId: string, completedPieces: number, qualityNotes: string = ''): Promise<void> {
    try {
      const sessionDoc = await getDoc(doc(db, 'operatorWorkSessions', sessionId));
      if (!sessionDoc.exists()) {
        throw new Error('Work session not found');
      }

      const session = sessionDoc.data() as OperatorWorkSession;
      const totalEarning = completedPieces * session.pricePerPiece;

      // Update work session
      await updateDoc(doc(db, 'operatorWorkSessions', sessionId), {
        completedPieces,
        totalEarning,
        status: completedPieces >= session.assignedPieces ? 'completed' : 'in_progress',
        endTime: completedPieces >= session.assignedPieces ? serverTimestamp() : null,
        notes: qualityNotes
      });

      // Update bundle step
      const bundleDoc = await getDoc(doc(db, 'productionBundles', session.bundleId));
      if (bundleDoc.exists()) {
        const bundle = bundleDoc.data() as ProductionBundle;
        const updatedSteps = bundle.processSteps.map(step => {
          if (step.stepNumber === session.stepNumber) {
            const isCompleted = completedPieces >= session.assignedPieces;
            return {
              ...step,
              completedPieces,
              status: isCompleted ? 'completed' as const : 'in_progress' as const,
              endTime: isCompleted ? serverTimestamp() : step.endTime
            };
          }
          return step;
        });

        // Check which steps are now ready (dependencies completed)
        const finalSteps = updatedSteps.map(step => {
          if (step.status === 'waiting') {
            const dependenciesMet = step.dependencies.every(depStep =>
              updatedSteps.find(s => s.stepNumber === depStep)?.status === 'completed'
            );
            if (dependenciesMet) {
              return { ...step, status: 'ready' as const };
            }
          }
          return step;
        });

        await updateDoc(doc(db, 'productionBundles', session.bundleId), {
          processSteps: finalSteps
        });
      }

      // Update operator realtime status
      if (completedPieces >= session.assignedPieces) {
        await set(ref(rtdb, `operator_status/${session.operatorId}`), {
          status: 'online',
          currentBundle: null,
          currentOperation: null,
          machineType: null,
          startTime: null,
          lastActivity: Date.now(),
          todayEarnings: totalEarning // This should be accumulated
        });
      }
    } catch (error) {
      console.error('Error completing operator work:', error);
      throw error;
    }
  }

  // 5. Get available work for operator (based on machine type/skills)
  async getAvailableWorkForOperator(operatorId: string, machineTypes: string[]): Promise<{bundle: ProductionBundle, step: BundleProcessStep}[]> {
    try {
      const bundlesQuery = query(
        collection(db, 'productionBundles'),
        where('status', '==', 'ready')
      );

      const bundlesSnapshot = await getDocs(bundlesQuery);
      const availableWork: {bundle: ProductionBundle, step: BundleProcessStep}[] = [];

      bundlesSnapshot.docs.forEach(doc => {
        const bundle = { id: doc.id, ...doc.data() } as ProductionBundle;
        
        // Find ready steps that match operator's machine types
        const readySteps = bundle.processSteps.filter(step => 
          step.status === 'ready' && 
          machineTypes.includes(step.machineType) &&
          !step.assignedOperator
        );

        readySteps.forEach(step => {
          availableWork.push({ bundle, step });
        });
      });

      return availableWork;
    } catch (error) {
      console.error('Error getting available work for operator:', error);
      throw error;
    }
  }

  // 6. Get operator monthly work summary (for wage calculation)
  async getOperatorMonthlyWork(_operatorId: string, month: number, year: number): Promise<{
    sessions: OperatorWorkSession[];
    totalPieces: number;
    totalEarnings: number;
    workingDays: number;
  }> {
    const operatorId = _operatorId;
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const sessionsQuery = query(
        collection(db, 'operatorWorkSessions'),
        where('operatorId', '==', operatorId),
        where('workDate', '>=', startDate),
        where('workDate', '<=', endDate),
        where('status', '==', 'completed')
      );

      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessions = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as OperatorWorkSession[];

      const totalPieces = sessions.reduce((sum, session) => sum + session.completedPieces, 0);
      const totalEarnings = sessions.reduce((sum, session) => sum + session.totalEarning, 0);
      const workingDays = new Set(sessions.map(session => 
        session.workDate.toDate().toDateString()
      )).size;

      return {
        sessions,
        totalPieces,
        totalEarnings,
        workingDays
      };
    } catch (error) {
      console.error('Error getting operator monthly work:', error);
      throw error;
    }
  }

  // 7. Get production dashboard data
  subscribeToProductionDashboard(callback: (data: any) => void): () => void {
    return onValue(ref(rtdb, 'production_dashboard'), callback);
  }

  // 12. Get process templates
  getGarmentProcessTemplates() {
    return TSA_GARMENT_PROCESSES;
  }

  // 13. Update bundle pricing based on garment type - FIRESTORE for structured updates
  async updateBundlePricing(bundleId: string, customPricing: {stepNumber: number, newPrice: number}[]): Promise<void> {
    try {
      const bundleDoc = await getDoc(doc(db, 'productionBundles', bundleId));
      if (!bundleDoc.exists()) {
        throw new Error('Bundle not found');
      }

      const bundle = bundleDoc.data() as ProductionBundle;
      const updatedSteps = bundle.processSteps.map(step => {
        const customPrice = customPricing.find(p => p.stepNumber === step.stepNumber);
        return customPrice ? { ...step, pricePerPiece: customPrice.newPrice } : step;
      });

      await updateDoc(doc(db, 'productionBundles', bundleId), {
        processSteps: updatedSteps
      });
    } catch (error) {
      console.error('Error updating bundle pricing:', error);
      throw error;
    }
  }
}

export const enhancedProductionService = new EnhancedProductionService();
export default enhancedProductionService;